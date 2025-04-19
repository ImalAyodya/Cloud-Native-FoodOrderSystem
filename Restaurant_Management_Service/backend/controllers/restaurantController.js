// const Restaurant = require('../models/Restaurant');
// const mongoose = require("mongoose");

// // Set restaurant availability
// exports.setAvailability = async (req, res) => {
//   try {
//     const { isAvailable } = req.body;
//     if (typeof isAvailable !== 'boolean') {
//       return res.status(400).json({ error: 'isAvailable must be a boolean' });
//     }
//     const restaurant = await Restaurant.findByIdAndUpdate(
//       req.user.restaurantId,
//       { isAvailable },
//       { new: true }
//     );
//     if (!restaurant) {
//       return res.status(404).json({ error: 'Restaurant not found' });
//     }
//     res.json({ message: 'Availability updated', isAvailable: restaurant.isAvailable });
//   } catch (error) {
//     console.error('Set availability error:', error.message);
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// // Get restaurant availability
// exports.getAvailability = async (req, res) => {
//   try {
//     const restaurant = await Restaurant.findById(req.user.restaurantId);
//     if (!restaurant) {
//       return res.status(404).json({ error: 'Restaurant not found' });
//     }
//     res.json({ isAvailable: restaurant.isAvailable });
//   } catch (error) {
//     console.error('Get availability error:', error.message);
//     res.status(500).json({ error: 'Server error' });
//   }
// };


const Restaurant = require('../models/Restaurant');

exports.addRestaurant = async (req, res) => {
  try {
    if (req.user.role !== 'restaurant_admin') {
      return res.status(403).json({ error: 'Access denied: Restaurant Admin role required' });
    }

    const { name, address } = req.body;
    if (!name || !address) {
      return res.status(400).json({ error: 'Name and address are required' });
    }

    const restaurant = new Restaurant({
      name,
      address,
      ownerId: req.user._id,
      isAvailable: true
    });
    await restaurant.save();

    // Update user's restaurantId
    req.user.restaurantId = restaurant._id;
    await req.user.save();

    res.status(201).json({ message: 'Restaurant added', restaurant });
  } catch (error) {
    console.error('Add restaurant error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Set restaurant availability
exports.setAvailability = async (req, res) => {
  try {
    if (req.user.role !== 'restaurant_admin') {
      return res.status(403).json({ error: 'Access denied: Restaurant Admin role required' });
    }

    const { isAvailable } = req.body;
    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({ error: 'isAvailable must be a boolean' });
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      req.user.restaurantId,
      { isAvailable },
      { new: true }
    );
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    res.json({ message: 'Availability updated', isAvailable: restaurant.isAvailable });
  } catch (error) {
    console.error('Set availability error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get restaurant availability
exports.getAvailability = async (req, res) => {
  try {
    if (req.user.role !== 'restaurant_admin') {
      return res.status(403).json({ error: 'Access denied: Restaurant Admin role required' });
    }

    const restaurant = await Restaurant.findById(req.user.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    res.json({ isAvailable: restaurant.isAvailable });
  } catch (error) {
    console.error('Get availability error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};