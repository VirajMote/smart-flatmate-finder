const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Listing = require('../models/Listing');
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
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Create listing
router.post('/', authenticateToken, upload.array('images', 10), [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage('Description must be between 20 and 1000 characters'),
  body('propertyType')
    .isIn(['Apartment', 'House', 'Villa', 'PG', 'Hostel'])
    .withMessage('Invalid property type'),
  body('roomType')
    .isIn(['Private Room', 'Shared Room', 'Studio', '1 BHK', '2 BHK', '3 BHK'])
    .withMessage('Invalid room type'),
  body('furnished')
    .isIn(['Fully Furnished', 'Semi Furnished', 'Unfurnished'])
    .withMessage('Invalid furnished status'),
  body('location.address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
  body('location.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('location.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('location.pincode')
    .matches(/^[1-9][0-9]{5}$/)
    .withMessage('Invalid pincode'),
  body('rent')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Rent must be a positive number'),
  body('deposit')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Deposit must be a positive number'),
  body('availableFrom')
    .isISO8601()
    .withMessage('Invalid available from date')
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

    const userId = req.user.id;
    const listingData = req.body;

    // Check if user can create listings
    const user = await User.findById(userId);
    if (!user || (user.accountType !== 'Lister' && user.accountType !== 'Both')) {
      return res.status(403).json({
        success: false,
        message: 'You need to be a lister to create listings'
      });
    }

    // Parse JSON fields if they're strings
    if (typeof listingData.location === 'string') {
      listingData.location = JSON.parse(listingData.location);
    }
    if (typeof listingData.amenities === 'string') {
      listingData.amenities = JSON.parse(listingData.amenities);
    }
    if (typeof listingData.preferences === 'string') {
      listingData.preferences = JSON.parse(listingData.preferences);
    }

    // Upload images to Cloudinary
    const images = [];
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const result = await uploadToCloudinary(file.buffer, {
          folder: 'apnaroom/listings',
          public_id: `listing_${Date.now()}_${i}`,
          transformation: [
            { width: 800, height: 600, crop: 'fill' },
            { quality: 'auto', fetch_format: 'auto' }
          ]
        });

        images.push({
          url: result.secure_url,
          isPrimary: i === 0 // First image is primary
        });
      }
    }

    // Create listing
    const listing = new Listing({
      ...listingData,
      owner: userId,
      images
    });

    await listing.save();

    // Populate owner information
    await listing.populate('owner', 'fullName profilePicture email phone');

    res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      data: { listing }
    });

  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all listings with filters
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('minRent').optional().isNumeric().withMessage('Min rent must be a number'),
  query('maxRent').optional().isNumeric().withMessage('Max rent must be a number'),
  query('city').optional().trim(),
  query('roomType').optional().isIn(['Private Room', 'Shared Room', 'Studio', '1 BHK', '2 BHK', '3 BHK']),
  query('furnished').optional().isIn(['Fully Furnished', 'Semi Furnished', 'Unfurnished']),
  query('sortBy').optional().isIn(['rent', 'createdAt', 'views']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
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
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {
      status: 'Active',
      isAvailable: true
    };

    if (req.query.minRent || req.query.maxRent) {
      filter.rent = {};
      if (req.query.minRent) filter.rent.$gte = parseFloat(req.query.minRent);
      if (req.query.maxRent) filter.rent.$lte = parseFloat(req.query.maxRent);
    }

    if (req.query.city) {
      filter['location.city'] = new RegExp(req.query.city, 'i');
    }

    if (req.query.roomType) {
      filter.roomType = req.query.roomType;
    }

    if (req.query.furnished) {
      filter.furnished = req.query.furnished;
    }

    if (req.query.amenities) {
      const amenities = req.query.amenities.split(',');
      filter.amenities = { $in: amenities };
    }

    // Build sort object
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    // If sorting by relevance and user is authenticated, prioritize based on preferences
    if (req.user && sortBy === 'relevance') {
      // This would require more complex aggregation pipeline
      // For now, default to creation date
      sort.createdAt = -1;
    }

    const listings = await Listing.find(filter)
      .populate('owner', 'fullName profilePicture isVerified')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Listing.countDocuments(filter);

    // If user is authenticated, track views
    if (req.user) {
      // Update view counts for listings (in background)
      listings.forEach(listing => {
        Listing.findByIdAndUpdate(
          listing._id,
          { $inc: { views: 1 } },
          { validateBeforeSave: false }
        ).exec();
      });
    }

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
    console.error('Get listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get single listing
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await Listing.findById(id)
      .populate('owner', 'fullName profilePicture email phone isVerified rating')
      .populate('applications.applicant', 'fullName profilePicture');

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Increment view count if user is authenticated and not the owner
    if (req.user && req.user.id !== listing.owner._id.toString()) {
      await listing.incrementViews(req.user.id);
    }

    // Hide sensitive information if user is not the owner
    if (!req.user || req.user.id !== listing.owner._id.toString()) {
      listing.owner.email = undefined;
      listing.owner.phone = undefined;
      listing.applications = undefined;
      listing.reports = undefined;
    }

    res.json({
      success: true,
      data: { listing }
    });

  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update listing
router.put('/:id', authenticateToken, upload.array('newImages', 5), [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage('Description must be between 20 and 1000 characters'),
  body('rent')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Rent must be a positive number'),
  body('deposit')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Deposit must be a positive number')
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

    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Check if user is the owner
    if (listing.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own listings'
      });
    }

    // Parse JSON fields if they're strings
    if (typeof updateData.amenities === 'string') {
      updateData.amenities = JSON.parse(updateData.amenities);
    }
    if (typeof updateData.preferences === 'string') {
      updateData.preferences = JSON.parse(updateData.preferences);
    }

    // Handle new images
    if (req.files && req.files.length > 0) {
      const newImages = [];
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const result = await uploadToCloudinary(file.buffer, {
          folder: 'apnaroom/listings',
          public_id: `listing_${id}_${Date.now()}_${i}`,
          transformation: [
            { width: 800, height: 600, crop: 'fill' },
            { quality: 'auto', fetch_format: 'auto' }
          ]
        });

        newImages.push({
          url: result.secure_url,
          isPrimary: false
        });
      }
      
      // Add new images to existing ones
      updateData.images = [...listing.images, ...newImages];
    }

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const updatedListing = await Listing.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('owner', 'fullName profilePicture email phone');

    res.json({
      success: true,
      message: 'Listing updated successfully',
      data: { listing: updatedListing }
    });

  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete listing
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Check if user is the owner
    if (listing.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own listings'
      });
    }

    await Listing.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Listing deleted successfully'
    });

  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Apply to listing
router.post('/:id/apply', authenticateToken, [
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Message cannot exceed 500 characters')
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

    const { id } = req.params;
    const userId = req.user.id;
    const { message } = req.body;

    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Check if listing is available
    if (!listing.isAvailable || listing.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: 'This listing is not available for applications'
      });
    }

    // Check if user is not the owner
    if (listing.owner.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot apply to your own listing'
      });
    }

    // Add application
    await listing.addApplication(userId, message);

    // Notify owner via socket if they're online
    if (req.io) {
      req.io.to(`user_${listing.owner}`).emit('new_application', {
        listingId: id,
        listingTitle: listing.title,
        applicantId: userId
      });
    }

    res.json({
      success: true,
      message: 'Application submitted successfully'
    });

  } catch (error) {
    if (error.message === 'You have already applied for this listing') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    console.error('Apply to listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user's listings
router.get('/user/my-listings', authenticateToken, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('status').optional().isIn(['Active', 'Rented', 'Under Review', 'Suspended'])
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

    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { owner: userId };
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const listings = await Listing.find(filter)
      .populate('applications.applicant', 'fullName profilePicture')
      .sort({ createdAt: -1 })
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
    console.error('Get user listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update application status
router.put('/:listingId/applications/:applicationId', authenticateToken, [
  body('status')
    .isIn(['Pending', 'Accepted', 'Rejected'])
    .withMessage('Invalid application status')
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

    const { listingId, applicationId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Check if user is the owner
    if (listing.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only manage applications for your own listings'
      });
    }

    // Find and update application
    const application = listing.applications.id(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    application.status = status;
    await listing.save();

    // If accepted, mark listing as rented
    if (status === 'Accepted') {
      listing.isAvailable = false;
      listing.status = 'Rented';
      await listing.save();
    }

    // Notify applicant via socket
    if (req.io) {
      req.io.to(`user_${application.applicant}`).emit('application_update', {
        listingId,
        listingTitle: listing.title,
        status
      });
    }

    res.json({
      success: true,
      message: `Application ${status.toLowerCase()} successfully`,
      data: { application }
    });

  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;