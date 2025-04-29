const express = require('express');
const RestaurantRouter = express.Router();
const restaurantController = require('../controllers/restaurantController');
const { protect } = require('../middleware/authMiddleware');
const { uploadForImages } = require('../middleware/multerConfig');

// Configure multiple file uploads
const uploadRestaurantImages = uploadForImages.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]);

// Restaurant CRUD operations
//http://localhost:5003/api/restaurant/add
RestaurantRouter.post('/add', uploadRestaurantImages, restaurantController.addRestaurant);

//http://localhost:5003/api/restaurant/get
RestaurantRouter.get('/get', restaurantController.getRestaurants);

//http://localhost:5003/api/restaurant/get/:id
RestaurantRouter.get('/get/:id', restaurantController.getRestaurantById);

//http://localhost:5003/api/restaurant/update/:id
RestaurantRouter.put('/update/:id', uploadRestaurantImages, restaurantController.updateRestaurant);

//http://localhost:5003/api/restaurant/delete/:id
RestaurantRouter.delete('/delete/:id', restaurantController.deleteRestaurant);

// Restaurant Availability
//http://localhost:5003/api/restaurant/setAvailability
RestaurantRouter.put('/setAvailability', restaurantController.setAvailability);

//http://localhost:5003/api/restaurant/getAvailability
RestaurantRouter.get('/getAvailability', restaurantController.getAvailability);

// Geolocation endpoints
//http://localhost:5003/api/restaurant/nearby
RestaurantRouter.get('/nearby', restaurantController.getNearbyRestaurants);

// Get restaurants by user ID
//http://localhost:5003/api/restaurant/user/:userId
RestaurantRouter.get('/user/:userId', protect, restaurantController.getRestaurantsByUserId);

// Restaurant analytics route
RestaurantRouter.get('/:id/analytics', restaurantController.getRestaurantAnalytics);

// Restaurant admin dashboard - all restaurants stats
// http://localhost:5003/api/restaurant/admin/dashboard
RestaurantRouter.get('/admin/dashboard', protect, restaurantController.getRestaurantsDashboardData);

module.exports = RestaurantRouter;