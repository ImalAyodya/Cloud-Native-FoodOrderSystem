const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');

// Register a new driver
router.post('/', driverController.registerDriver);

// Update driver location
router.put('/:driverId/location', driverController.updateLocation);

// Update driver availability
router.put('/:driverId/availability', driverController.updateAvailability);

// Get all drivers
router.get('/', driverController.getAllDrivers);

// Get a driver by ID
router.get('/:driverId', driverController.getDriverById);

// Find nearest drivers
router.post('/:nearest', driverController.findNearestDrivers);

//Add a Rating for a Driver
router.post('/:driverId/rating', driverController.addRating);



module.exports = router;