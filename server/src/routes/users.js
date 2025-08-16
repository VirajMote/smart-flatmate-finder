const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { uploadToCloudinary } = require('../utils/cloudinary');
const multer = require('multer');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Update profile
router.put('/profile', authenticateToken, [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid Indian phone number'),
  body('age')
    .optional()
    .isInt({ min: 18, max: 100 })
    .withMessage('Age must be between 18 and 100'),
  body('occupation')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Occupation cannot exceed 100 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters')
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
    const updateData = req.body;

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update preferences
router.put('/preferences', authenticateToken, [
  body('budget.min')
    .optional()
    .isNumeric()
    .withMessage('Minimum budget must be a number'),
  body('budget.max')
    .optional()
    .isNumeric()
    .withMessage('Maximum budget must be a number'),
  body('location')
    .optional()
    .isArray()
    .withMessage('Location must be an array'),
  body('roomType')
    .optional()
    .isIn(['Private Room', 'Shared Room', 'Studio', '1 BHK', '2 BHK', '3 BHK'])
    .withMessage('Invalid room type'),
  body('genderPreference')
    .optional()
    .isIn(['Any', 'Male', 'Female'])
    .withMessage('Invalid gender preference'),
  body('smoking')
    .optional()
    .isIn(['No', 'Yes', 'Occasionally'])
    .withMessage('Invalid smoking preference'),
  body('drinking')
    .optional()
    .isIn(['No', 'Yes', 'Socially'])
    .withMessage('Invalid drinking preference'),
  body('pets')
    .optional()
    .isIn(['Yes', 'No'])
    .withMessage('Invalid pets preference'),
  body('foodHabits')
    .optional()
    .isIn(['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Jain'])
    .withMessage('Invalid food habits'),
  body('moveInDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid move-in date')
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
    const preferences = req.body;

    // Validate budget range
    if (preferences.budget && preferences.budget.min && preferences.budget.max) {
      if (preferences.budget.min > preferences.budget.max) {
        return res.status(400).json({
          success: false,
          message: 'Minimum budget cannot be greater than maximum budget'
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { preferences },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Upload profile picture
router.post('/profile-picture', authenticateToken, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const userId = req.user.id;

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'apnaroom/profiles',
      public_id: `profile_${userId}`,
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });

    // Update user profile
    const user = await User.findByIdAndUpdate(
      userId,
      { profilePicture: result.secure_url },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      data: {
        profilePicture: result.secure_url,
        user
      }
    });

  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile picture'
    });
  }
});

// Upload verification documents
router.post('/documents', authenticateToken, upload.array('documents', 3), [
  body('documentTypes')
    .isArray()
    .withMessage('Document types must be an array'),
  body('documentTypes.*')
    .isIn(['ID Proof', 'Address Proof', 'Income Proof'])
    .withMessage('Invalid document type')
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

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const userId = req.user.id;
    const { documentTypes } = req.body;

    if (req.files.length !== documentTypes.length) {
      return res.status(400).json({
        success: false,
        message: 'Number of files must match number of document types'
      });
    }

    const documents = [];

    // Upload each document
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const documentType = documentTypes[i];

      const result = await uploadToCloudinary(file.buffer, {
        folder: 'apnaroom/documents',
        public_id: `${userId}_${documentType.replace(' ', '_')}_${Date.now()}`,
        resource_type: 'auto'
      });

      documents.push({
        type: documentType,
        url: result.secure_url,
        verified: false
      });
    }

    // Update user documents
    const user = await User.findByIdAndUpdate(
      userId,
      { $push: { documents: { $each: documents } } },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Documents uploaded successfully',
      data: {
        documents,
        user
      }
    });

  } catch (error) {
    console.error('Upload documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload documents'
    });
  }
});

// Get user profile by ID
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('-password -verificationToken -passwordResetToken -passwordResetExpires')
      .populate('savedListings', 'title rent location.city images');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't show sensitive information to other users
    if (userId !== req.user.id) {
      user.email = undefined;
      user.phone = undefined;
      user.documents = undefined;
      user.blockedUsers = undefined;
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Save/unsave listing
router.post('/saved-listings/:listingId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { listingId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isAlreadySaved = user.savedListings.includes(listingId);

    if (isAlreadySaved) {
      // Remove from saved listings
      user.savedListings = user.savedListings.filter(id => id.toString() !== listingId);
      await user.save();

      res.json({
        success: true,
        message: 'Listing removed from saved items',
        data: { saved: false }
      });
    } else {
      // Add to saved listings
      user.savedListings.push(listingId);
      await user.save();

      res.json({
        success: true,
        message: 'Listing saved successfully',
        data: { saved: true }
      });
    }

  } catch (error) {
    console.error('Save listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get saved listings
router.get('/saved-listings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const user = await User.findById(userId)
      .populate({
        path: 'savedListings',
        populate: {
          path: 'owner',
          select: 'fullName profilePicture'
        },
        options: {
          skip: (page - 1) * limit,
          limit: limit,
          sort: { createdAt: -1 }
        }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        listings: user.savedListings,
        pagination: {
          page,
          limit,
          total: user.savedListings.length
        }
      }
    });

  } catch (error) {
    console.error('Get saved listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Block/unblock user
router.post('/block/:targetUserId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetUserId } = req.params;

    if (userId === targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot block yourself'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isAlreadyBlocked = user.blockedUsers.includes(targetUserId);

    if (isAlreadyBlocked) {
      // Unblock user
      user.blockedUsers = user.blockedUsers.filter(id => id.toString() !== targetUserId);
      await user.save();

      res.json({
        success: true,
        message: 'User unblocked successfully',
        data: { blocked: false }
      });
    } else {
      // Block user
      user.blockedUsers.push(targetUserId);
      await user.save();

      res.json({
        success: true,
        message: 'User blocked successfully',
        data: { blocked: true }
      });
    }

  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;