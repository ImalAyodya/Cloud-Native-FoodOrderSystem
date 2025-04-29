const Restaurant = require('../models/Restaurant');
const mongoose = require('mongoose'); // Added mongoose for ObjectId validation
const path = require('path');
const MenuItem = require('../models/MenuItem');
const Order = require('../../../Order_Mangement_And_Notification_Service/backend/models/Order');

// Create new restaurant
const addRestaurant = async (req, res) => {
  try {
    let restaurantData = req.body;

    // Handle file uploads if present
    if (req.files) {
      const imageUrls = {};
      
      if (req.files.logo) {
        imageUrls.logo = `/uploads/${req.files.logo[0].filename}`;
      }
      if (req.files.banner) {
        imageUrls.banner = `/uploads/${req.files.banner[0].filename}`;
      }
      
      restaurantData = {
        ...restaurantData,
        images: imageUrls
      };
    }

    const newRestaurant = new Restaurant(restaurantData);
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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid restaurant ID' });
    }
    const restaurant = await Restaurant.findById(req.params.id)
      .populate('menuItems');
      
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    
    res.status(200).json({ success: true, restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateRestaurant = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid restaurant ID' });
    }

    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    let updateData = { ...req.body };
    delete updateData.ownerId;

    // Handle file uploads if present
    if (req.files) {
      const imageUrls = { ...restaurant.images }; // Keep existing images
      
      if (req.files.logo) {
        imageUrls.logo = `/uploads/${req.files.logo[0].filename}`;
      }
      if (req.files.banner) {
        imageUrls.banner = `/uploads/${req.files.banner[0].filename}`;
      }
      
      updateData.images = imageUrls;
    }

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, restaurant: updatedRestaurant });
  } catch (error) {
    console.error('Error updating restaurant:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
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
    // Validate restaurant ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid restaurant ID' });
    }

    // Use raw MongoDB operation to delete
    const result = await Restaurant.collection.deleteOne({ _id: new mongoose.Types.ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    res.status(200).json({ success: true, message: 'Restaurant deleted' });
  } catch (error) {
    console.error('Error deleting restaurant:', error.message, error.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
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

const getRestaurantAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the restaurant ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid restaurant ID' });
    }

    // Check if the restaurant exists
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // Fetch menu items for the restaurant
    const menuItems = await MenuItem.find({ id }).select('name category cuisine price');

    // Hardcoded analytics data
    const analytics = {
      totalMenuItems: menuItems.length,
      totalOrders: Order.length, // Hardcoded
      totalRevenue: 5000, // Hardcoded
      revenueData: [
        { date: '2025-04-01', revenue: 1000 },
        { date: '2025-04-02', revenue: 1200 },
        { date: '2025-04-03', revenue: 1500 },
      ], // Hardcoded
      menuItemsByCategory: menuItems.reduce((acc, item) => {
        const existingCategory = acc.find((entry) => entry.name === item.category);
        if (existingCategory) {
          existingCategory.value += 1;
        } else {
          acc.push({ name: item.category, value: 1 });
        }
        return acc;
      }, []),
      popularDishes: [
        { name: 'Pizza', orders: 50 },
        { name: 'Burger', orders: 40 },
        { name: 'Pasta', orders: 30 },
      ], // Hardcoded
    };

    // Return the analytics data
    res.status(200).json(analytics);
  } catch (error) {
    console.error('Error fetching restaurant analytics:', error.message, error.stack);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics data',
    });
  }
};

const getRestaurantsDashboardData = async (req, res) => {
  try {
    // Get all restaurants with basic info
    const restaurants = await Restaurant.find({})
      .select('name images rating address status isAvailable createdAt');
    
    // Get total count of restaurants
    const totalRestaurants = await Restaurant.countDocuments({});
    const activeRestaurants = await Restaurant.countDocuments({ status: 'active', isAvailable: true });
    const pendingRestaurants = await Restaurant.countDocuments({ status: 'pending' });
    const suspendedRestaurants = await Restaurant.countDocuments({ status: 'suspended' });
    
    // Get restaurant count by cuisine (top cuisines)
    const cuisineStats = await Restaurant.aggregate([
      { $unwind: '$cuisine' },
      { $group: { _id: '$cuisine', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Get restaurant count by city/location
    const locationStats = await Restaurant.aggregate([
      { $group: { _id: '$location.city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Get recently added restaurants
    const recentRestaurants = await Restaurant.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name images rating address status createdAt');
    
    // Get top rated restaurants
    const topRatedRestaurants = await Restaurant.find({})
      .sort({ rating: -1 })
      .limit(5)
      .select('name images rating address status');
    
    // Get restaurants by price range
    const priceRangeStats = await Restaurant.aggregate([
      { $group: { _id: '$priceRange', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    // Compile all data into dashboard response
    const dashboardData = {
      counts: {
        totalRestaurants,
        activeRestaurants,
        pendingRestaurants,
        suspendedRestaurants
      },
      recentRestaurants,
      topRatedRestaurants,
      cuisineStats: cuisineStats.map(item => ({ name: item._id, count: item.count })),
      locationStats: locationStats.map(item => ({ name: item._id || 'Unspecified', count: item.count })),
      priceRangeStats: priceRangeStats.map(item => ({ range: item._id, count: item.count })),
      restaurants: restaurants.map(restaurant => ({
        _id: restaurant._id,
        name: restaurant.name,
        image: restaurant.images?.logo || restaurant.images?.banner || null,
        rating: restaurant.rating,
        address: restaurant.address,
        status: restaurant.status,
        isAvailable: restaurant.isAvailable,
        createdAt: restaurant.createdAt
      }))
    };
    
    res.status(200).json({ success: true, data: dashboardData });
  } catch (error) {
    console.error('Error fetching restaurant dashboard data:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
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
  getRestaurantsByUserId,
  getRestaurantAnalytics,
  getRestaurantsDashboardData
};