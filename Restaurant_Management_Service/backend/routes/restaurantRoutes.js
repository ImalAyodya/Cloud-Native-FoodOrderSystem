const express = require('express');
const RestaurantRouter = express.Router();
const restaurantController = require('../controllers/restaurantController');

// Restaurant CRUD operations
//http://localhost:5003/api/restaurant/add
RestaurantRouter.post('/add', restaurantController.addRestaurant);
//http://localhost:5003/api/restaurant/get
RestaurantRouter.get('/get', restaurantController.getRestaurants);
//http://localhost:5003/api/restaurant/get/:id
RestaurantRouter.get('/get/:id', restaurantController.getRestaurantById);
//http://localhost:5003/api/restaurant/update/:id
RestaurantRouter.put('/update/:id', restaurantController.updateRestaurant);
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

module.exports = RestaurantRouter;