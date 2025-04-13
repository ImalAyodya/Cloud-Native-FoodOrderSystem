const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');

// -----------------------------
// ✅ Add a new restaurant
// -----------------------------
//http://localhost:5001/api/restaurants/add-restaurant
router.post('/add-restaurant', async (req, res) => {
  try {
    const { name, address, phone, email, password } = req.body;

    const newRestaurant = new Restaurant({
      name,
      address,
      phone,
      email,
      password, // make sure to hash this in production!
    });

    const savedRestaurant = await newRestaurant.save();
    res.status(201).json({ message: 'Restaurant added successfully', restaurant: savedRestaurant });
  } catch (error) {
    console.error('Error adding restaurant:', error);
    res.status(500).json({ message: 'Failed to add restaurant' });
  }
});

// -----------------------------
// ✅ Add a food item to a restaurant
// -----------------------------
// http://localhost:5001/api/restaurants/add-food
router.post('/add-food', async (req, res) => {
  try {
    const { name, description, price, category, imageUrl, restaurantId } = req.body;

    // Check if the restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const newFood = new Food({
      name,
      description,
      price,
      category,
      imageUrl,
      restaurant: restaurantId,
    });

    const savedFood = await newFood.save();

    // Optional: Add food to restaurant's menu list
    restaurant.menus.push(savedFood._id);
    await restaurant.save();

    res.status(201).json({ message: 'Food item added successfully', food: savedFood });
  } catch (error) {
    console.error('Error adding food item:', error);
    res.status(500).json({ message: 'Failed to add food item' });
  }
});

// Route to fetch foods by restaurant ID
// http://localhost:5001/api/restaurants/foods/:restaurantId
router.get('/foods/:restaurantId', async (req, res) => {
    const { restaurantId } = req.params;
  
    try {
      // Find the restaurant by ID
      const restaurant = await Restaurant.findById(restaurantId);
  
      if (!restaurant) {
        return res.status(404).json({ success: false, message: 'Restaurant not found' });
      }
  
      // Fetch foods associated with the restaurant
      const foods = await Food.find({ restaurant: restaurantId });
  
      res.status(200).json({
        success: true,
        restaurantName: restaurant.name,
        foods
      });
    } catch (error) {
      console.error('Error fetching foods:', error);
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  });

module.exports = router;
