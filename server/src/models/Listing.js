const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  // Property Details
  propertyType: {
    type: String,
    enum: ['Apartment', 'House', 'Villa', 'PG', 'Hostel'],
    required: [true, 'Property type is required']
  },
  roomType: {
    type: String,
    enum: ['Private Room', 'Shared Room', 'Studio', '1 BHK', '2 BHK', '3 BHK'],
    required: [true, 'Room type is required']
  },
  furnished: {
    type: String,
    enum: ['Fully Furnished', 'Semi Furnished', 'Unfurnished'],
    required: [true, 'Furnished status is required']
  },
  
  // Location
  location: {
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    pincode: {
      type: String,
      match: [/^[1-9][0-9]{5}$/, 'Please enter a valid pincode']
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    nearbyLandmarks: [String]
  },
  
  // Pricing
  rent: {
    type: Number,
    required: [true, 'Rent is required'],
    min: [0, 'Rent cannot be negative']
  },
  deposit: {
    type: Number,
    required: [true, 'Deposit is required'],
    min: [0, 'Deposit cannot be negative']
  },
  maintenanceCharges: {
    type: Number,
    default: 0,
    min: [0, 'Maintenance charges cannot be negative']
  },
  
  // Amenities
  amenities: [{
    type: String,
    enum: [
      'WiFi', 'Parking', 'Kitchen', 'AC', 'Washing Machine', 
      'Gym', 'Swimming Pool', 'Security', 'Elevator', 'Balcony',
      'Power Backup', 'Water Supply', 'Furnished', 'TV', 'Refrigerator'
    ]
  }],
  
  // Images
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  
  // Owner Information
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required']
  },
  
  // Preferences for flatmates
  preferences: {
    gender: {
      type: String,
      enum: ['Any', 'Male', 'Female'],
      default: 'Any'
    },
    ageRange: {
      min: {
        type: Number,
        min: 18,
        max: 100
      },
      max: {
        type: Number,
        min: 18,
        max: 100
      }
    },
    occupation: [String],
    smoking: {
      type: String,
      enum: ['Any', 'No', 'Yes'],
      default: 'Any'
    },
    drinking: {
      type: String,
      enum: ['Any', 'No', 'Yes'],
      default: 'Any'
    },
    pets: {
      type: String,
      enum: ['Any', 'No', 'Yes'],
      default: 'Any'
    },
    foodHabits: {
      type: String,
      enum: ['Any', 'Vegetarian', 'Non-Vegetarian'],
      default: 'Any'
    }
  },
  
  // House Rules
  houseRules: {
    type: String,
    maxlength: [500, 'House rules cannot exceed 500 characters']
  },
  
  // Availability
  availableFrom: {
    type: Date,
    required: [true, 'Available from date is required']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['Active', 'Rented', 'Under Review', 'Suspended'],
    default: 'Active'
  },
  
  // Analytics
  views: {
    type: Number,
    default: 0
  },
  viewedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Applications
  applications: [{
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected'],
      default: 'Pending'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Reports
  reports: [{
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['Fake Listing', 'Inappropriate Content', 'Spam', 'Other']
    },
    description: String,
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Featured listing
  isFeatured: {
    type: Boolean,
    default: false
  },
  featuredUntil: Date,
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
listingSchema.index({ 'location.city': 1 });
listingSchema.index({ rent: 1 });
listingSchema.index({ roomType: 1 });
listingSchema.index({ isAvailable: 1 });
listingSchema.index({ status: 1 });
listingSchema.index({ owner: 1 });
listingSchema.index({ createdAt: -1 });

// Virtual for primary image
listingSchema.virtual('primaryImage').get(function() {
  const primaryImg = this.images.find(img => img.isPrimary);
  return primaryImg ? primaryImg.url : (this.images.length > 0 ? this.images[0].url : null);
});

// Method to increment views
listingSchema.methods.incrementViews = function(userId) {
  // Only increment if user hasn't viewed recently (within 24 hours)
  const recentView = this.viewedBy.find(view => 
    view.user.toString() === userId.toString() && 
    (Date.now() - view.viewedAt.getTime()) < 24 * 60 * 60 * 1000
  );
  
  if (!recentView) {
    this.views += 1;
    this.viewedBy.push({ user: userId });
    
    // Keep only last 100 views to prevent document from growing too large
    if (this.viewedBy.length > 100) {
      this.viewedBy = this.viewedBy.slice(-100);
    }
  }
  
  return this.save({ validateBeforeSave: false });
};

// Method to add application
listingSchema.methods.addApplication = function(applicantId, message) {
  // Check if user already applied
  const existingApplication = this.applications.find(
    app => app.applicant.toString() === applicantId.toString()
  );
  
  if (existingApplication) {
    throw new Error('You have already applied for this listing');
  }
  
  this.applications.push({
    applicant: applicantId,
    message: message || ''
  });
  
  return this.save();
};

module.exports = mongoose.model('Listing', listingSchema);