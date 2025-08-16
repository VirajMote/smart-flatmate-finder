const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');

// Store connected users
const connectedUsers = new Map();

const socketHandler = (io) => {
  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user || user.isSuspended) {
        return next(new Error('Authentication error'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected`);

    // Store connected user
    connectedUsers.set(socket.userId, socket.id);
    
    // Update user online status
    User.findByIdAndUpdate(socket.userId, {
      isOnline: true,
      lastActive: new Date()
    }).exec();

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Handle joining conversation rooms
    socket.on('join_conversation', (otherUserId) => {
      const roomId = [socket.userId, otherUserId].sort().join('_');
      socket.join(`conversation_${roomId}`);
      console.log(`User ${socket.userId} joined conversation with ${otherUserId}`);
    });

    // Handle leaving conversation rooms
    socket.on('leave_conversation', (otherUserId) => {
      const roomId = [socket.userId, otherUserId].sort().join('_');
      socket.leave(`conversation_${roomId}`);
      console.log(`User ${socket.userId} left conversation with ${otherUserId}`);
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { receiverId } = data;
      const roomId = [socket.userId, receiverId].sort().join('_');
      socket.to(`conversation_${roomId}`).emit('user_typing', {
        userId: socket.userId,
        userName: socket.user.fullName
      });
    });

    socket.on('typing_stop', (data) => {
      const { receiverId } = data;
      const roomId = [socket.userId, receiverId].sort().join('_');
      socket.to(`conversation_${roomId}`).emit('user_stopped_typing', {
        userId: socket.userId
      });
    });

    // Handle message read receipts
    socket.on('mark_messages_read', async (data) => {
      try {
        const { senderId } = data;
        
        // Mark messages as read
        await Message.updateMany(
          {
            sender: senderId,
            receiver: socket.userId,
            isRead: false
          },
          {
            isRead: true,
            readAt: new Date()
          }
        );

        // Notify sender
        const senderSocketId = connectedUsers.get(senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit('messages_read', {
            readBy: socket.userId,
            readAt: new Date()
          });
        }
      } catch (error) {
        console.error('Mark messages read error:', error);
      }
    });

    // Handle user status updates
    socket.on('update_status', async (data) => {
      try {
        const { status } = data; // 'online', 'away', 'busy'
        
        await User.findByIdAndUpdate(socket.userId, {
          lastActive: new Date(),
          // You can add a status field to User model if needed
        });

        // Broadcast status to user's contacts
        socket.broadcast.emit('user_status_update', {
          userId: socket.userId,
          status,
          lastActive: new Date()
        });
      } catch (error) {
        console.error('Update status error:', error);
      }
    });

    // Handle match notifications
    socket.on('match_interest', (data) => {
      const { listingId, listerId, interested } = data;
      
      // Notify lister about interest
      const listerSocketId = connectedUsers.get(listerId);
      if (listerSocketId) {
        io.to(listerSocketId).emit('match_interest_received', {
          seekerId: socket.userId,
          seekerName: socket.user.fullName,
          listingId,
          interested
        });
      }
    });

    // Handle application notifications
    socket.on('listing_application', (data) => {
      const { listingId, listerId } = data;
      
      // Notify lister about new application
      const listerSocketId = connectedUsers.get(listerId);
      if (listerSocketId) {
        io.to(listerSocketId).emit('new_application', {
          applicantId: socket.userId,
          applicantName: socket.user.fullName,
          listingId
        });
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User ${socket.userId} disconnected`);
      
      // Remove from connected users
      connectedUsers.delete(socket.userId);
      
      // Update user offline status
      try {
        await User.findByIdAndUpdate(socket.userId, {
          isOnline: false,
          lastActive: new Date()
        });

        // Broadcast offline status
        socket.broadcast.emit('user_status_update', {
          userId: socket.userId,
          status: 'offline',
          lastActive: new Date()
        });
      } catch (error) {
        console.error('Update offline status error:', error);
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Make connected users available to other parts of the app
  io.connectedUsers = connectedUsers;

  // Periodic cleanup of stale connections
  setInterval(() => {
    const staleConnections = [];
    connectedUsers.forEach((socketId, userId) => {
      const socket = io.sockets.sockets.get(socketId);
      if (!socket) {
        staleConnections.push(userId);
      }
    });

    staleConnections.forEach(userId => {
      connectedUsers.delete(userId);
      // Update user offline status
      User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastActive: new Date()
      }).exec();
    });

    if (staleConnections.length > 0) {
      console.log(`Cleaned up ${staleConnections.length} stale connections`);
    }
  }, 30000); // Run every 30 seconds
};

module.exports = socketHandler;