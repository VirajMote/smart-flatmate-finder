const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Message = require('../models/Message');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { uploadToCloudinary } = require('../utils/cloudinary');
const multer = require('multer');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Send message
router.post('/', authenticateToken, upload.array('attachments', 3), [
  body('receiverId').isMongoId().withMessage('Invalid receiver ID'),
  body('content').optional().trim().isLength({ min: 1, max: 1000 }).withMessage('Message content must be between 1 and 1000 characters'),
  body('messageType').optional().isIn(['text', 'image', 'document', 'listing_share']).withMessage('Invalid message type'),
  body('relatedListing').optional().isMongoId().withMessage('Invalid listing ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const senderId = req.user.id;
    const { receiverId, content, messageType = 'text', relatedListing } = req.body;

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Check if sender is blocked by receiver
    if (receiver.blockedUsers.includes(senderId)) {
      return res.status(403).json({
        success: false,
        message: 'You cannot send messages to this user'
      });
    }

    // Check if receiver is blocked by sender
    const sender = await User.findById(senderId);
    if (sender.blockedUsers.includes(receiverId)) {
      return res.status(403).json({
        success: false,
        message: 'You have blocked this user'
      });
    }

    let messageData = {
      sender: senderId,
      receiver: receiverId,
      messageType
    };

    // Handle different message types
    if (messageType === 'text') {
      if (!content) {
        return res.status(400).json({
          success: false,
          message: 'Content is required for text messages'
        });
      }
      messageData.content = content;
    } else if (messageType === 'listing_share') {
      if (!relatedListing) {
        return res.status(400).json({
          success: false,
          message: 'Related listing is required for listing share messages'
        });
      }
      messageData.content = content || 'Shared a listing';
      messageData.relatedListing = relatedListing;
    } else if (messageType === 'image' || messageType === 'document') {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Attachments are required for this message type'
        });
      }

      // Upload attachments
      const attachments = [];
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, {
          folder: 'apnaroom/messages',
          public_id: `message_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          resource_type: 'auto'
        });

        attachments.push({
          type: file.mimetype.startsWith('image/') ? 'image' : 'document',
          url: result.secure_url,
          filename: file.originalname,
          size: file.size
        });
      }

      messageData.attachments = attachments;
      messageData.content = content || (messageType === 'image' ? 'Sent an image' : 'Sent a document');
    }

    // Create message
    const message = new Message(messageData);
    await message.save();

    // Populate sender and receiver info
    await message.populate('sender', 'fullName profilePicture');
    await message.populate('receiver', 'fullName profilePicture');
    if (message.relatedListing) {
      await message.populate('relatedListing', 'title rent location.city images');
    }

    // Mark as delivered and emit to receiver if online
    if (req.io) {
      const receiverSocketId = req.io.connectedUsers?.[receiverId];
      if (receiverSocketId) {
        await message.markAsDelivered();
        req.io.to(receiverSocketId).emit('new_message', message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get conversation between two users
router.get('/conversation/:userId', authenticateToken, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const currentUserId = req.user.id;
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    // Check if other user exists
    const otherUser = await User.findById(userId).select('fullName profilePicture isOnline lastActive');
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get conversation messages
    const messages = await Message.getConversation(currentUserId, userId, page, limit);

    // Mark messages as read
    await Message.updateMany(
      {
        sender: userId,
        receiver: currentUserId,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    // Emit read receipts to sender if online
    if (req.io) {
      const senderSocketId = req.io.connectedUsers?.[userId];
      if (senderSocketId) {
        req.io.to(senderSocketId).emit('messages_read', {
          readBy: currentUserId,
          conversationWith: currentUserId
        });
      }
    }

    res.json({
      success: true,
      data: {
        messages,
        otherUser,
        pagination: {
          page,
          limit,
          hasMore: messages.length === limit
        }
      }
    });

  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user's conversations list
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Message.getUserConversations(userId);

    res.json({
      success: true,
      data: { conversations }
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Mark message as read
router.put('/:messageId/read', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the receiver
    if (message.receiver.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only mark messages sent to you as read'
      });
    }

    await message.markAsRead();

    // Emit read receipt to sender if online
    if (req.io) {
      const senderSocketId = req.io.connectedUsers?.[message.sender.toString()];
      if (senderSocketId) {
        req.io.to(senderSocketId).emit('message_read', {
          messageId,
          readBy: userId,
          readAt: message.readAt
        });
      }
    }

    res.json({
      success: true,
      message: 'Message marked as read'
    });

  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete message
router.delete('/:messageId', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is sender or receiver
    if (message.sender.toString() !== userId && message.receiver.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages'
      });
    }

    // Add user to deletedBy array
    const existingDelete = message.deletedBy.find(del => del.user.toString() === userId);
    if (!existingDelete) {
      message.deletedBy.push({ user: userId });
    }

    // If both users have deleted, mark as deleted
    if (message.deletedBy.length === 2) {
      message.isDeleted = true;
    }

    await message.save();

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get unread message count
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadCount = await Message.countDocuments({
      receiver: userId,
      isRead: false,
      isDeleted: false
    });

    res.json({
      success: true,
      data: { unreadCount }
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Search messages
router.get('/search', authenticateToken, [
  query('q').notEmpty().withMessage('Search query is required'),
  query('userId').optional().isMongoId().withMessage('Invalid user ID'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const currentUserId = req.user.id;
    const { q, userId } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build search filter
    const filter = {
      $or: [
        { sender: currentUserId },
        { receiver: currentUserId }
      ],
      content: new RegExp(q, 'i'),
      isDeleted: false
    };

    // If searching within specific conversation
    if (userId) {
      filter.$or = [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ];
    }

    const messages = await Message.find(filter)
      .populate('sender', 'fullName profilePicture')
      .populate('receiver', 'fullName profilePicture')
      .populate('relatedListing', 'title rent location.city')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments(filter);

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;