const Driver = require('../models/Driver');
const driverService = require('../services/driverService');

class DriverController {
  // Register a new driver
  async registerDriver(req, res) {
    try {
      const { name, email, phone, currentLocation } = req.body;
      
      // Create new driver
      const driver = new Driver({
        name,
        email,
        phone,
        currentLocation: {
          type: 'Point',
          coordinates: currentLocation
        },
        isAvailable: true
      });
      
      const savedDriver = await driver.save();
      
      res.status(201).json(savedDriver);
    } catch (error) {
      console.error('Error registering driver:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  // Update driver location
  async updateLocation(req, res) {
    try {
      const { driverId } = req.params;
      const { coordinates } = req.body;
      
      const updatedDriver = await driverService.updateLocation(driverId, coordinates);
      
      if (!updatedDriver) {
        return res.status(404).json({ error: 'Driver not found' });
      }
      
      res.status(200).json(updatedDriver);
    } catch (error) {
      console.error('Error updating driver location:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  // Update driver availability
  async updateAvailability(req, res) {
    try {
      const { driverId } = req.params;
      const { isAvailable } = req.body;
      
      const updatedDriver = await driverService.updateAvailability(driverId, isAvailable);
      
      if (!updatedDriver) {
        return res.status(404).json({ error: 'Driver not found' });
      }
      
      res.status(200).json(updatedDriver);
    } catch (error) {
      console.error('Error updating driver availability:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  // Get all drivers
  async getAllDrivers(req, res) {
    try {
      const drivers = await Driver.find();
      res.status(200).json(drivers);
    } catch (error) {
      console.error('Error getting drivers:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  // Get a driver by ID
  async getDriverById(req, res) {
    try {
      const { driverId } = req.params;
      const driver = await Driver.findById(driverId);
      
      if (!driver) {
        return res.status(404).json({ error: 'Driver not found' });
      }
      
      res.status(200).json(driver);
    } catch (error) {
      console.error('Error getting driver:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Find nearest drivers
async findNearestDrivers(req, res) {
  try {
    const { coordinates } = req.body; // [longitude, latitude]

    if (!coordinates || coordinates.length !== 2) {
      return res.status(400).json({ error: 'Coordinates must be an array [lon, lat]' });
    }

    const drivers = await driverService.findNearestDrivers({ coordinates });
    res.status(200).json(drivers);
  } catch (error) {
    console.error('Error finding nearest drivers:', error);
    res.status(500).json({ error: error.message });
  }
 }

 // Add rating to driver
async addRating(req, res) {
  try {
    const { driverId } = req.params;
    const { orderId, rating } = req.body;

    if (!orderId || typeof rating !== 'number') {
      return res.status(400).json({ error: 'orderId and numeric rating are required' });
    }

    const updatedDriver = await driverService.addRating(driverId, orderId, rating);
    res.status(200).json(updatedDriver);
  } catch (error) {
    console.error('Error adding rating:', error);
    res.status(500).json({ error: error.message });
  }
 }


}

module.exports = new DriverController();
