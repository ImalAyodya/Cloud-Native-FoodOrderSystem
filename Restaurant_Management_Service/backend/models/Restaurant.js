const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: 
  { 
    type: String, 
    required: true, 
    trim: true, 
    index: true 
  },
  description: 
  { 
    type: String, 
    trim: true 
  },
  address: 
  { 
    type: String, 
    required: true, 
    trim: true 
  },
  location: {
    coordinates: 
    { 
      type: [Number], 
      default: [0, 0] 
    }, // [longitude, latitude]
    city: 
    { 
      type: String, 
      trim: true 
    }
  },
  contact: 
  {
    email: 
    { 
      type: String, 
      trim: true, 
      sparse: true 
    },
    phone: 
    { 
      type: String, 
      trim: true 
    }
  },
  cuisine: 
  [{ 
    type: String, 
    trim: true 
  }],
  businessHours: 
  [{
    day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
    open: { type: String },
    close: { type: String },
    closed: { type: Boolean, default: false }
  }],
  images: 
  {
    logo: { type: String },
    banner: { type: String }
  },
  rating: 
  { 
    type: Number, 
    default: 0, 
    min: 0, 
    max: 5 
  },
  priceRange: 
  { 
    type: String, 
    enum: ['$', '$$', '$$$', '$$$$'], 
    default: '$$' 
  },
  deliveryFee: 
  { 
    type: Number, 
    default: 0 
  },
  minOrder: 
  { 
    type: Number, 
    default: 0 
  },
  isAvailable: 
  { 
    type: Boolean, 
    default: true 
  },
  status: 
  { 
    type: String, 
    enum: ['pending', 'active', 'suspended'], 
    default: 'pending' 
  },
  ownerId: 
  { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  createdAt: 
  { 
    type: Date, 
    default: Date.now 
  }
});

// Create geospatial index for location-based queries
restaurantSchema.index
({ 
  'location.coordinates': '2dsphere' 
});

// Virtual property for menu items
restaurantSchema.virtual
('menuItems', {
  ref: 'MenuItem',
  localField: '_id',
  foreignField: 'restaurantId'
});

module.exports = mongoose.model('Restaurant', restaurantSchema);