const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  vehicleType: {
    type: String,
    enum: ['Car', 'Motorcycle', 'Bicycle', 'Scooter'],
    default: 'Car'
  },
  licensePlate: {
    type: String
  },
  isAvailable: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  currentLocation: {
    latitude: Number,
    longitude: Number,
    lastUpdated: Date
  },
  pendingAssignments: [String], // Order IDs
  currentOrders: [String], // Order IDs
  completedOrders: [String], // Order IDs
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  }
}, { timestamps: true });

// Add method to find by userId (for authentication purposes)
driverSchema.statics.findByUserId = function(userId) {
  return this.findOne({ userId });
};

const Driver = mongoose.model('Driver', driverSchema);

module.exports = Driver;