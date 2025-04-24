const Restaurant = require('../models/Restaurant');
const mongoose = require('mongoose'); // Added mongoose for ObjectId validation

// Create new restaurant
const addRestaurant = async (req, res) => {
  try {
    // Remove dependency on req.user.id
    const newRestaurant = new Restaurant({
      ...req.body
      // ownerId should now be provided in the request body
    });
    
    const restaurant = await newRestaurant.save();
    res.status(201).json({ success: true, restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all restaurants (with optional filters)
const getRestaurants = async (req, res) => {
  try {
    const { cuisine, city, isAvailable, priceRange, name } = req.query;
    const filter = {};
    
    if (cuisine) filter.cuisine = { $in: cuisine.split(',') };
    if (city) filter['location.city'] = city;
    if (isAvailable) filter.isAvailable = isAvailable === 'true';
    if (priceRange) filter.priceRange = priceRange;
    if (name) filter.name = { $regex: name, $options: 'i' };
    
    const restaurants = await Restaurant.find(filter)
      .select('name description address location.city cuisine images rating priceRange isAvailable');
    
    res.status(200).json({ success: true, count: restaurants.length, restaurants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get restaurant by ID
const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate('menuItems');
      
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    
    res.status(200).json({ success: true, restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update restaurant
const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    if (restaurant.ownerId.toString() !== req.user.id && req.user.role !== 'admin') 
      return res.status(403).json({ success: false, message: 'Not authorized' });
    
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body }, 
      { new: true }
    );
    
    res.status(200).json({ success: true, restaurant: updatedRestaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Set restaurant availability
const setAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const restaurant = await Restaurant.findOneAndUpdate(
      { ownerId: req.user.id },
      { $set: { isAvailable } },
      { new: true }
    );
    
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    
    res.status(200).json({ success: true, isAvailable: restaurant.isAvailable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get restaurant availability
const getAvailability = async (req, res) => {
  try {
    const { restaurantId } = req.query;
    const filter = restaurantId ? { _id: restaurantId } : { ownerId: req.user.id };
    
    const restaurant = await Restaurant.findOne(filter).select('name isAvailable');
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    
    res.status(200).json({ success: true, name: restaurant.name, isAvailable: restaurant.isAvailable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete restaurant
const deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    if (restaurant.ownerId.toString() !== req.user.id && req.user.role !== 'admin') 
      return res.status(403).json({ success: false, message: 'Not authorized' });
      
    await Restaurant.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Restaurant deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Find nearby restaurants
const getNearbyRestaurants = async (req, res) => {
  try {
    const { lng, lat, maxDistance = 5000 } = req.query; // maxDistance in meters
    
    if (!lng || !lat) return res.status(400).json({ success: false, message: 'Location coordinates required' });
    
    const restaurants = await Restaurant.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(maxDistance)
        }
      },
      isAvailable: true
    }).select('name address location images rating deliveryFee');
    
    res.status(200).json({ success: true, count: restaurants.length, restaurants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get restaurants by owner user ID
 * @route GET /api/restaurants/user/:userId
 * @access Private
 */
const getRestaurantsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId format but don't check if it matches authenticated user
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Find all restaurants owned by this user without role validation
    const restaurants = await Restaurant.find({ ownerId: userId })
      .select('-__v')
      .sort({ createdAt: -1 });

    // Return the found restaurants
    return res.status(200).json({
      success: true,
      count: restaurants.length,
      data: restaurants
    });
  } catch (error) {
    console.error('Error in getRestaurantsByUserId:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching restaurants',
      error: error.message
    });
  }
};

module.exports = {
  addRestaurant,
  getRestaurants,
  getRestaurantById,
  updateRestaurant,
  setAvailability,
  getAvailability,
  deleteRestaurant,
  getNearbyRestaurants,
  getRestaurantsByUserId
};