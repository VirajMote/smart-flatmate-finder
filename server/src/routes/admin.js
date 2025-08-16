const express = require('express');
const { query, body, validationResult } = require('express-validator');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Message = require('../models/Message');
const Match = require('../models/Match');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply admin middleware to all routes
router.use(authenticateToken, requireAdmin);

// Dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get basic counts
    const totalUsers = await User.countDocuments();
    const totalListings = await Listing.countDocuments();
    const activeListings = await Listing.countDocuments({ status: 'Active', isAvailable: true });
    const totalMatches = await Match.countDocuments({ status: 'Matched' });

    // Get growth metrics
    const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const newListingsThisMonth = await Listing.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const newMatchesThisMonth = await Match.countDocuments({ 
      status: 'Matched', 
      createdAt: { $gte: thirtyDaysAgo } 
    });

    // Get weekly activity
    const weeklyUsers = await User.countDocuments({ lastActive: { $gte: sevenDaysAgo } });
    const weeklyMessages = await Message.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    // Get pending items
    const pendingVerifications = await User.countDocuments({ 
      'documents.verified': false,
      'documents.0': { $exists: true }
    });
    const reportedListings = await Listing.countDocuments({ 'reports.0': { $exists: true } });
    const suspendedUsers = await User.countDocuments({ isSuspended: true });

    // Calculate growth percentages
    const previousMonthStart = new Date(thirtyDaysAgo.getTime() - 30 * 24 * 60 * 60 * 1000);
    const previousMonthUsers = await User.countDocuments({ 
      createdAt: { $gte: previousMonthStart, $lt: thirtyDaysAgo } 
    });
    const userGrowthPercent = previousMonthUsers > 0 ? 
      ((newUsersThisMonth - previousMonthUsers) / previousMonthUsers * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalListings,
          activeListings,
          totalMatches
        },
        growth: {
          newUsersThisMonth,
          newListingsThisMonth,
          newMatchesThisMonth,
          userGrowthPercent
        },
        activity: {
          weeklyActiveUsers: weeklyUsers,
          weeklyMessages
        },
        pending: {
          pendingVerifications,
          reportedListings,
          suspendedUsers
        }
      }
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all users with filters
router.get('/users', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().trim(),
  query('accountType').optional().isIn(['Seeker', 'Lister', 'Both']),
  query('isVerified').optional().isBoolean(),
  query('isSuspended').optional().isBoolean(),
  query('sortBy').optional().isIn(['createdAt', 'lastActive', 'fullName']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    
    if (req.query.search) {
      filter.$or = [
        { fullName: new RegExp(req.query.search, 'i') },
        { email: new RegExp(req.query.search, 'i') }
      ];
    }

    if (req.query.accountType) {
      filter.accountType = req.query.accountType;
    }

    if (req.query.isVerified !== undefined) {
      filter.isVerified = req.query.isVerified === 'true';
    }

    if (req.query.isSuspended !== undefined) {
      filter.isSuspended = req.query.isSuspended === 'true';
    }

    // Build sort
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    const users = await User.find(filter)
      .select('-password -verificationToken -passwordResetToken')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user details
router.get('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('-password -verificationToken -passwordResetToken')
      .populate('savedListings', 'title rent location.city');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's listings
    const listings = await Listing.find({ owner: userId })
      .select('title rent location.city status createdAt views')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get user's matches
    const matches = await Match.find({
      $or: [{ seeker: userId }, { lister: userId }]
    })
    .populate('listing', 'title rent location.city')
    .sort({ createdAt: -1 })
    .limit(10);

    res.json({
      success: true,
      data: {
        user,
        listings,
        matches
      }
    });

  } catch (error) {
    console.error('Admin get user details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Suspend/unsuspend user
router.put('/users/:userId/suspend', [
  body('suspend').isBoolean().withMessage('Suspend must be a boolean'),
  body('reason').optional().trim().isLength({ max: 500 }).withMessage('Reason cannot exceed 500 characters')
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

    const { userId } = req.params;
    const { suspend, reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isSuspended = suspend;
    if (suspend && reason) {
      user.suspensionReason = reason;
    } else if (!suspend) {
      user.suspensionReason = undefined;
    }

    await user.save();

    // If suspending, also suspend their listings
    if (suspend) {
      await Listing.updateMany(
        { owner: userId },
        { status: 'Suspended' }
      );
    } else {
      // If unsuspending, reactivate their listings
      await Listing.updateMany(
        { owner: userId, status: 'Suspended' },
        { status: 'Active' }
      );
    }

    res.json({
      success: true,
      message: `User ${suspend ? 'suspended' : 'unsuspended'} successfully`,
      data: { user }
    });

  } catch (error) {
    console.error('Admin suspend user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Verify user documents
router.put('/users/:userId/verify-document', [
  body('documentId').isMongoId().withMessage('Invalid document ID'),
  body('verified').isBoolean().withMessage('Verified must be a boolean')
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

    const { userId } = req.params;
    const { documentId, verified } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const document = user.documents.id(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    document.verified = verified;
    await user.save();

    res.json({
      success: true,
      message: `Document ${verified ? 'verified' : 'rejected'} successfully`,
      data: { document }
    });

  } catch (error) {
    console.error('Admin verify document error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all listings with filters
router.get('/listings', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().trim(),
  query('status').optional().isIn(['Active', 'Rented', 'Under Review', 'Suspended']),
  query('city').optional().trim(),
  query('hasReports').optional().isBoolean(),
  query('sortBy').optional().isIn(['createdAt', 'views', 'rent']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    
    if (req.query.search) {
      filter.$or = [
        { title: new RegExp(req.query.search, 'i') },
        { description: new RegExp(req.query.search, 'i') }
      ];
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.city) {
      filter['location.city'] = new RegExp(req.query.city, 'i');
    }

    if (req.query.hasReports === 'true') {
      filter['reports.0'] = { $exists: true };
    }

    // Build sort
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    const listings = await Listing.find(filter)
      .populate('owner', 'fullName email isVerified')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Listing.countDocuments(filter);

    res.json({
      success: true,
      data: {
        listings,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Admin get listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update listing status
router.put('/listings/:listingId/status', [
  body('status').isIn(['Active', 'Rented', 'Under Review', 'Suspended']).withMessage('Invalid status'),
  body('reason').optional().trim().isLength({ max: 500 }).withMessage('Reason cannot exceed 500 characters')
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

    const { listingId } = req.params;
    const { status, reason } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    listing.status = status;
    if (status === 'Suspended' && reason) {
      // Add admin note to reports
      listing.reports.push({
        reporter: req.user.id,
        reason: 'Admin Action',
        description: reason,
        reportedAt: new Date()
      });
    }

    await listing.save();

    res.json({
      success: true,
      message: 'Listing status updated successfully',
      data: { listing }
    });

  } catch (error) {
    console.error('Admin update listing status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get reported content
router.get('/reports', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('type').optional().isIn(['listing', 'user']),
  query('status').optional().isIn(['pending', 'resolved'])
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    let reports = [];

    // Get listing reports
    if (!req.query.type || req.query.type === 'listing') {
      const listingReports = await Listing.aggregate([
        { $match: { 'reports.0': { $exists: true } } },
        { $unwind: '$reports' },
        {
          $lookup: {
            from: 'users',
            localField: 'reports.reporter',
            foreignField: '_id',
            as: 'reporter'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'owner',
            foreignField: '_id',
            as: 'owner'
          }
        },
        {
          $project: {
            type: 'listing',
            reportId: '$reports._id',
            reason: '$reports.reason',
            description: '$reports.description',
            reportedAt: '$reports.reportedAt',
            reporter: { $arrayElemAt: ['$reporter', 0] },
            content: {
              id: '$_id',
              title: '$title',
              owner: { $arrayElemAt: ['$owner', 0] }
            }
          }
        },
        { $sort: { reportedAt: -1 } }
      ]);

      reports = reports.concat(listingReports);
    }

    // Paginate results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedReports = reports.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        reports: paginatedReports,
        pagination: {
          page,
          limit,
          total: reports.length,
          pages: Math.ceil(reports.length / limit)
        }
      }
    });

  } catch (error) {
    console.error('Admin get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get analytics data
router.get('/analytics', [
  query('period').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('Invalid period'),
  query('metric').optional().isIn(['users', 'listings', 'matches', 'messages']).withMessage('Invalid metric')
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

    const period = req.query.period || '30d';
    const metric = req.query.metric || 'users';

    // Calculate date range
    const now = new Date();
    let startDate;
    let groupBy;

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        groupBy = { $dateToString: { format: "%Y-%U", date: "$createdAt" } };
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        groupBy = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
        break;
    }

    // Select collection based on metric
    let Model;
    switch (metric) {
      case 'users':
        Model = User;
        break;
      case 'listings':
        Model = Listing;
        break;
      case 'matches':
        Model = Match;
        break;
      case 'messages':
        Model = Message;
        break;
    }

    const analytics = await Model.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        period,
        metric,
        analytics
      }
    });

  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;