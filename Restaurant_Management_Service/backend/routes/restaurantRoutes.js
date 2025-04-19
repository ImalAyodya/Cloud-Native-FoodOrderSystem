const express = require('express');
const RestaurantRouter = express.Router();
const auth = require('../middleware/auth');
const restaurantController = require('../controllers/restaurantController');

RestaurantRouter.post(
    '/add', 
    auth, 
    restaurantController.addRestaurant
);

// Restaurant Availability
RestaurantRouter.put(
    '/setAvailability', 
    auth, 
    restaurantController.setAvailability
);

RestaurantRouter.get(
    '/getAvailability', 
    auth, 
    restaurantController.getAvailability
);

module.exports = RestaurantRouter;