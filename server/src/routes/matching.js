const express = require('express');
const { query, validationResult } = require('express-validator');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Match = require('../models/Match');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get matches for seeker
router.get('/seeker', authenticateToken, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('minCompatibility').optional().isInt({ min: 0, max: 100 })
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
    const minCompatibility = parseInt(req.query.minCompatibility) || 60;

    // Get user preferences
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.accountType !== 'Seeker' && user.accountType !== 'Both') {
      return res.status(403).json({
        success: false,
        message: 'Only seekers can view listing matches'
      });
    }

    // Build listing filter based on user preferences
    const listingFilter = {
      status: 'Active',
      isAvailable: true,
      owner: { $ne: userId } // Exclude own listings
    };

    // Budget filter
    if (user.preferences.budget && user.preferences.budget.max) {
      listingFilter.rent = { $lte: user.preferences.budget.max };
    }

    // Location filter
    if (user.preferences.location && user.preferences.location.length > 0) {
      const locationRegex = user.preferences.location.map(loc => new RegExp(loc, 'i'));
      listingFilter['location.city'] = { $in: locationRegex };
    }

    // Room type filter
    if (user.preferences.roomType) {
      listingFilter.roomType = user.preferences.roomType;
    }

    // Get listings
    const listings = await Listing.find(listingFilter)
      .populate('owner', 'fullName profilePicture age gender occupation isVerified')
      .lean();

    // Calculate compatibility for each listing
    const matches = [];
    for (const listing of listings) {
      const compatibility = Match.calculateCompatibility(user, listing);
      
      if (compatibility.totalScore >= minCompatibility) {
        matches.push({
          listing,
          compatibilityScore: compatibility.totalScore,
          compatibilityFactors: compatibility.factors,
          owner: listing.owner
        });
      }
    }

    // Sort by compatibility score
    matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    // Paginate results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedMatches = matches.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        matches: paginatedMatches,
        pagination: {
          page,
          limit,
          total: matches.length,
          pages: Math.ceil(matches.length / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get seeker matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get matches for lister
router.get('/lister/:listingId', authenticateToken, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('minCompatibility').optional().isInt({ min: 0, max: 100 })
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
    const { listingId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const minCompatibility = parseInt(req.query.minCompatibility) || 60;

    // Get listing
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
        message: 'You can only view matches for your own listings'
      });
    }

    // Build seeker filter based on listing preferences
    const seekerFilter = {
      accountType: { $in: ['Seeker', 'Both'] },
      _id: { $ne: userId }, // Exclude self
      isVerified: true // Only verified seekers
    };

    // Budget compatibility
    if (listing.rent) {
      seekerFilter['preferences.budget.max'] = { $gte: listing.rent };
    }

    // Location compatibility
    if (listing.location.city) {
      seekerFilter['preferences.location'] = new RegExp(listing.location.city, 'i');
    }

    // Gender preference
    if (listing.preferences.gender && listing.preferences.gender !== 'Any') {
      seekerFilter.gender = listing.preferences.gender;
    }

    // Age preference
    if (listing.preferences.ageRange && listing.preferences.ageRange.min && listing.preferences.ageRange.max) {
      seekerFilter.age = {
        $gte: listing.preferences.ageRange.min,
        $lte: listing.preferences.ageRange.max
      };
    }

    // Get seekers
    const seekers = await User.find(seekerFilter)
      .select('-password -verificationToken -passwordResetToken')
      .lean();

    // Calculate compatibility for each seeker
    const matches = [];
    for (const seeker of seekers) {
      const compatibility = Match.calculateCompatibility(seeker, listing);
      
      if (compatibility.totalScore >= minCompatibility) {
        matches.push({
          seeker,
          compatibilityScore: compatibility.totalScore,
          compatibilityFactors: compatibility.factors
        });
      }
    }

    // Sort by compatibility score
    matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    // Paginate results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedMatches = matches.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        matches: paginatedMatches,
        listing: {
          id: listing._id,
          title: listing.title,
          rent: listing.rent,
          location: listing.location
        },
        pagination: {
          page,
          limit,
          total: matches.length,
          pages: Math.ceil(matches.length / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get lister matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create/update match interest
router.post('/interest', authenticateToken, [
  body('listingId').isMongoId().withMessage('Invalid listing ID'),
  body('interested').isBoolean().withMessage('Interested must be a boolean')
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
    const { listingId, interested } = req.body;

    // Get listing
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Determine seeker and lister
    let seekerId, listerId;
    if (user.accountType === 'Seeker' || user.accountType === 'Both') {
      seekerId = userId;
      listerId = listing.owner;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Only seekers can express interest in listings'
      });
    }

    // Find or create match
    let match = await Match.findOne({
      seeker: seekerId,
      listing: listingId
    });

    if (!match) {
      // Calculate compatibility
      const compatibility = Match.calculateCompatibility(user, listing);
      
      match = new Match({
        seeker: seekerId,
        lister: listerId,
        listing: listingId,
        compatibilityScore: compatibility.totalScore,
        compatibilityFactors: compatibility.factors
      });
    }

    // Update interest
    await match.updateInterest(userId, interested);

    // Notify other party if both are interested
    if (match.status === 'Matched' && req.io) {
      req.io.to(`user_${listerId}`).emit('new_match', {
        matchId: match._id,
        seekerId,
        listingId,
        listingTitle: listing.title
      });
    }

    res.json({
      success: true,
      message: interested ? 'Interest expressed successfully' : 'Interest removed successfully',
      data: {
        match: {
          id: match._id,
          status: match.status,
          compatibilityScore: match.compatibilityScore,
          seekerInterested: match.seekerInterested,
          listerInterested: match.listerInterested
        }
      }
    });

  } catch (error) {
    console.error('Update match interest error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user's matches
router.get('/my-matches', authenticateToken, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('status').optional().isIn(['Active', 'Contacted', 'Interested', 'Not Interested', 'Matched', 'Expired'])
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

    // Build filter
    const filter = {
      $or: [
        { seeker: userId },
        { lister: userId }
      ]
    };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const matches = await Match.find(filter)
      .populate('seeker', 'fullName profilePicture age gender occupation isVerified')
      .populate('lister', 'fullName profilePicture age gender occupation isVerified')
      .populate('listing', 'title rent location images roomType')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Match.countDocuments(filter);

    res.json({
      success: true,
      data: {
        matches,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get user matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Share contact information
router.post('/share-contact/:matchId', authenticateToken, async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.user.id;

    const match = await Match.findById(matchId)
      .populate('seeker', 'fullName email phone')
      .populate('lister', 'fullName email phone')
      .populate('listing', 'title');

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Check if user is part of this match
    if (match.seeker._id.toString() !== userId && match.lister._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not part of this match'
      });
    }

    // Share contact
    await match.shareContact();

    // Get contact information
    const otherUser = match.seeker._id.toString() === userId ? match.lister : match.seeker;

    res.json({
      success: true,
      message: 'Contact information shared successfully',
      data: {
        contact: {
          name: otherUser.fullName,
          email: otherUser.email,
          phone: otherUser.phone
        }
      }
    });

  } catch (error) {
    if (error.message === 'Contact can only be shared for matched users') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    console.error('Share contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Submit match feedback
router.post('/feedback/:matchId', authenticateToken, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters')
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

    const { matchId } = req.params;
    const userId = req.user.id;
    const { rating, comment } = req.body;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Check if user is part of this match
    if (match.seeker.toString() !== userId && match.lister.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not part of this match'
      });
    }

    // Check if match is completed
    if (match.status !== 'Matched') {
      return res.status(400).json({
        success: false,
        message: 'Feedback can only be submitted for matched users'
      });
    }

    // Submit feedback
    const feedbackField = match.seeker.toString() === userId ? 'seeker' : 'lister';
    match.feedback[feedbackField] = {
      rating,
      comment: comment || '',
      submittedAt: new Date()
    };

    await match.save();

    // Update user rating if both feedbacks are submitted
    if (match.feedback.seeker.rating && match.feedback.lister.rating) {
      const seekerRating = match.feedback.lister.rating; // Lister's rating for seeker
      const listerRating = match.feedback.seeker.rating; // Seeker's rating for lister

      // Update seeker's rating
      const seeker = await User.findById(match.seeker);
      if (seeker) {
        const newSeekerCount = seeker.rating.count + 1;
        const newSeekerAverage = ((seeker.rating.average * seeker.rating.count) + seekerRating) / newSeekerCount;
        seeker.rating = {
          average: Math.round(newSeekerAverage * 10) / 10,
          count: newSeekerCount
        };
        await seeker.save();
      }

      // Update lister's rating
      const lister = await User.findById(match.lister);
      if (lister) {
        const newListerCount = lister.rating.count + 1;
        const newListerAverage = ((lister.rating.average * lister.rating.count) + listerRating) / newListerCount;
        lister.rating = {
          average: Math.round(newListerAverage * 10) / 10,
          count: newListerCount
        };
        await lister.save();
      }
    }

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: { feedback: match.feedback[feedbackField] }
    });

  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;