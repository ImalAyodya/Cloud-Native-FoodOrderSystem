const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  orderId: { 
    type: String, 
    required: true,
    // For real integration this would be: type: mongoose.Schema.Types.ObjectId, ref: 'Order'
  },
  restaurantId: { 
    type: String, 
    required: true,
    // For real integration this would be: type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant'
  },
  driverId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Driver',
    default: null 
  },
  restaurantLocation: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]  // [longitude, latitude]
  },
  customerLocation: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]  // [longitude, latitude]
  },
  driverLocation: {
    type: { type: String, default: 'Point' },
    coordinates: { 
      type: [Number],
      default: [0, 0]  // Add a default value
    }
  },
  
  status: {
    type: String,
    enum: ['pending', 'driver_assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'],
    default: 'pending'
  },
  estimatedPickupTime: Date,
  estimatedDeliveryTime: Date,
  actualPickupTime: Date,
  actualDeliveryTime: Date,
  rating: Number
}, { timestamps: true });

deliverySchema.index({ restaurantLocation: '2dsphere' });
deliverySchema.index({ customerLocation: '2dsphere' });
deliverySchema.index({ driverLocation: '2dsphere' });

module.exports = mongoose.model('Delivery', deliverySchema);
