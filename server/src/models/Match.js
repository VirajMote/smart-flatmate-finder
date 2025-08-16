const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  // Users involved in the match
  seeker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seeker is required']
  },
  lister: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Lister is required']
  },
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: [true, 'Listing is required']
  },
  
  // Compatibility score (0-100)
  compatibilityScore: {
    type: Number,
    required: [true, 'Compatibility score is required'],
    min: 0,
    max: 100
  },
  
  // Detailed compatibility breakdown
  compatibilityFactors: {
    budget: {
      score: { type: Number, min: 0, max: 100 },
      weight: { type: Number, default: 25 }
    },
    location: {
      score: { type: Number, min: 0, max: 100 },
      weight: { type: Number, default: 20 }
    },
    lifestyle: {
      score: { type: Number, min: 0, max: 100 },
      weight: { type: Number, default: 20 }
    },
    preferences: {
      score: { type: Number, min: 0, max: 100 },
      weight: { type: Number, default: 15 }
    },
    demographics: {
      score: { type: Number, min: 0, max: 100 },
      weight: { type: Number, default: 10 }
    },
    timing: {
      score: { type: Number, min: 0, max: 100 },
      weight: { type: Number, default: 10 }
    }
  },
  
  // Match status
  status: {
    type: String,
    enum: ['Active', 'Contacted', 'Interested', 'Not Interested', 'Matched', 'Expired'],
    default: 'Active'
  },
  
  // Actions taken
  seekerInterested: {
    type: Boolean,
    default: null // null = no action, true = interested, false = not interested
  },
  listerInterested: {
    type: Boolean,
    default: null
  },
  
  // Contact information shared
  contactShared: {
    type: Boolean,
    default: false
  },
  contactSharedAt: Date,
  
  // Match expiry
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    }
  },
  
  // Feedback
  feedback: {
    seeker: {
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      submittedAt: Date
    },
    lister: {
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      submittedAt: Date
    }
  },
  
  // Analytics
  viewedBySeekerAt: Date,
  viewedByListerAt: Date,
  
}, {
  timestamps: true
});

// Indexes for better query performance
matchSchema.index({ seeker: 1, status: 1 });
matchSchema.index({ lister: 1, status: 1 });
matchSchema.index({ listing: 1 });
matchSchema.index({ compatibilityScore: -1 });
matchSchema.index({ expiresAt: 1 });

// Compound index for unique matches
matchSchema.index({ seeker: 1, listing: 1 }, { unique: true });

// Method to update interest
matchSchema.methods.updateInterest = function(userId, isInterested) {
  if (this.seeker.toString() === userId.toString()) {
    this.seekerInterested = isInterested;
    this.viewedBySeekerAt = new Date();
  } else if (this.lister.toString() === userId.toString()) {
    this.listerInterested = isInterested;
    this.viewedByListerAt = new Date();
  } else {
    throw new Error('User not part of this match');
  }
  
  // Update status based on interests
  if (this.seekerInterested === true && this.listerInterested === true) {
    this.status = 'Matched';
  } else if (this.seekerInterested === false || this.listerInterested === false) {
    this.status = 'Not Interested';
  } else if (this.seekerInterested === true || this.listerInterested === true) {
    this.status = 'Interested';
  }
  
  return this.save();
};

// Method to share contact
matchSchema.methods.shareContact = function() {
  if (this.status === 'Matched') {
    this.contactShared = true;
    this.contactSharedAt = new Date();
    return this.save();
  } else {
    throw new Error('Contact can only be shared for matched users');
  }
};

// Static method to calculate compatibility score
matchSchema.statics.calculateCompatibility = function(seeker, listing) {
  let totalScore = 0;
  let factors = {};
  
  // Budget compatibility (25% weight)
  const budgetScore = this.calculateBudgetCompatibility(seeker.preferences.budget, listing.rent);
  factors.budget = { score: budgetScore, weight: 25 };
  totalScore += budgetScore * 0.25;
  
  // Location compatibility (20% weight)
  const locationScore = this.calculateLocationCompatibility(seeker.preferences.location, listing.location);
  factors.location = { score: locationScore, weight: 20 };
  totalScore += locationScore * 0.20;
  
  // Lifestyle compatibility (20% weight)
  const lifestyleScore = this.calculateLifestyleCompatibility(seeker.preferences, listing.preferences);
  factors.lifestyle = { score: lifestyleScore, weight: 20 };
  totalScore += lifestyleScore * 0.20;
  
  // Preferences compatibility (15% weight)
  const preferencesScore = this.calculatePreferencesCompatibility(seeker, listing.preferences);
  factors.preferences = { score: preferencesScore, weight: 15 };
  totalScore += preferencesScore * 0.15;
  
  // Demographics compatibility (10% weight)
  const demographicsScore = this.calculateDemographicsCompatibility(seeker, listing.preferences);
  factors.demographics = { score: demographicsScore, weight: 10 };
  totalScore += demographicsScore * 0.10;
  
  // Timing compatibility (10% weight)
  const timingScore = this.calculateTimingCompatibility(seeker.preferences.moveInDate, listing.availableFrom);
  factors.timing = { score: timingScore, weight: 10 };
  totalScore += timingScore * 0.10;
  
  return {
    totalScore: Math.round(totalScore),
    factors: factors
  };
};

// Helper methods for compatibility calculation
matchSchema.statics.calculateBudgetCompatibility = function(seekerBudget, listingRent) {
  if (!seekerBudget || !seekerBudget.max) return 50;
  
  if (listingRent <= seekerBudget.max) {
    // Perfect if within 80% of max budget
    if (listingRent <= seekerBudget.max * 0.8) return 100;
    // Good if within max budget
    return 80;
  } else {
    // Decrease score based on how much over budget
    const overBudgetPercent = (listingRent - seekerBudget.max) / seekerBudget.max;
    return Math.max(0, 50 - (overBudgetPercent * 100));
  }
};

matchSchema.statics.calculateLocationCompatibility = function(seekerLocations, listingLocation) {
  if (!seekerLocations || seekerLocations.length === 0) return 50;
  
  const listingCity = listingLocation.city.toLowerCase();
  const hasMatch = seekerLocations.some(loc => 
    listingCity.includes(loc.toLowerCase()) || loc.toLowerCase().includes(listingCity)
  );
  
  return hasMatch ? 100 : 20;
};

matchSchema.statics.calculateLifestyleCompatibility = function(seekerPrefs, listingPrefs) {
  let score = 0;
  let factors = 0;
  
  // Smoking compatibility
  if (seekerPrefs.smoking && listingPrefs.smoking) {
    factors++;
    if (listingPrefs.smoking === 'Any' || seekerPrefs.smoking === listingPrefs.smoking) {
      score += 100;
    } else if (seekerPrefs.smoking === 'No' && listingPrefs.smoking === 'Yes') {
      score += 20;
    } else {
      score += 60;
    }
  }
  
  // Drinking compatibility
  if (seekerPrefs.drinking && listingPrefs.drinking) {
    factors++;
    if (listingPrefs.drinking === 'Any' || seekerPrefs.drinking === listingPrefs.drinking) {
      score += 100;
    } else {
      score += 70;
    }
  }
  
  // Pets compatibility
  if (seekerPrefs.pets && listingPrefs.pets) {
    factors++;
    if (listingPrefs.pets === 'Any' || seekerPrefs.pets === listingPrefs.pets) {
      score += 100;
    } else {
      score += 30;
    }
  }
  
  return factors > 0 ? score / factors : 50;
};

matchSchema.statics.calculatePreferencesCompatibility = function(seeker, listingPrefs) {
  let score = 0;
  let factors = 0;
  
  // Gender compatibility
  if (listingPrefs.gender && seeker.gender) {
    factors++;
    if (listingPrefs.gender === 'Any' || listingPrefs.gender === seeker.gender) {
      score += 100;
    } else {
      score += 0;
    }
  }
  
  // Food habits compatibility
  if (seeker.preferences.foodHabits && listingPrefs.foodHabits) {
    factors++;
    if (listingPrefs.foodHabits === 'Any' || seeker.preferences.foodHabits === listingPrefs.foodHabits) {
      score += 100;
    } else {
      score += 60;
    }
  }
  
  return factors > 0 ? score / factors : 50;
};

matchSchema.statics.calculateDemographicsCompatibility = function(seeker, listingPrefs) {
  let score = 0;
  let factors = 0;
  
  // Age compatibility
  if (seeker.age && listingPrefs.ageRange && listingPrefs.ageRange.min && listingPrefs.ageRange.max) {
    factors++;
    if (seeker.age >= listingPrefs.ageRange.min && seeker.age <= listingPrefs.ageRange.max) {
      score += 100;
    } else {
      score += 30;
    }
  }
  
  return factors > 0 ? score / factors : 50;
};

matchSchema.statics.calculateTimingCompatibility = function(seekerMoveIn, listingAvailable) {
  if (!seekerMoveIn || !listingAvailable) return 50;
  
  const timeDiff = Math.abs(seekerMoveIn.getTime() - listingAvailable.getTime());
  const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
  
  if (daysDiff <= 7) return 100;
  if (daysDiff <= 30) return 80;
  if (daysDiff <= 60) return 60;
  return 30;
};

module.exports = mongoose.model('Match', matchSchema);