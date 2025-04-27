const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  isAvailable: { type: Boolean, default: true },
  currentLocation: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]  // [longitude, latitude]
  },                                  
  ratings: [{
    orderId: { type: mongoose.Schema.Types.ObjectId },
    rating: Number
  }],
  averageRating: { type: Number, default: 0 }
}, { timestamps: true });

// Create geo index for location queries
driverSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('Driver', driverSchema);