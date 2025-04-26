const mongoose = require('mongoose');

// Simplified variation schema
const variationSchema = new mongoose.Schema
({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  price: { 
    type: Number, 
    required: true, 
    min: 0 
  }
}, 
{ 
  _id: false 
});

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  variations: [variationSchema],
  image: {
    type: String,
    trim: true,
  },
  gallery: [
    {
      type: String,
      trim: true,
    },
  ],
  tags: [
    {
      type: String,
      trim: true,
    },
  ],
  ingredients: [
    {
      type: String,
      trim: true,
    },
  ],
  nutrition: {
    calories: {
      type: Number,
      min: 0,
    },
    allergens: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  dietary: {
    isVegetarian: {
      type: Boolean,
      default: false,
    },
    isVegan: {
      type: Boolean,
      default: false,
    },
    isGlutenFree: {
      type: Boolean,
      default: false,
    },
  },
  featured: {
    type: Boolean,
    default: false,
  },
  preparationTime: {
    type: Number,
    min: 0,
    default: 15,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp on modification
menuItemSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Text search capabilities
menuItemSchema.index({
  name: 'text',
  description: 'text',
  tags: 'text',
});

module.exports = mongoose.model('MenuItem', menuItemSchema);