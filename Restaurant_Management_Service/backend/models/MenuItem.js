const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    regular: {
      type: Number,
      required: true,
      min: 0
    },
    large: {
      type: Number,
      required: true,
      min: 0
    }
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  portionSize: {
    type: String,
    enum: ['regular', 'large'],
    default: 'regular'
  },
  image: {
    type: String,
    trim: true 
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MenuItem', menuItemSchema);