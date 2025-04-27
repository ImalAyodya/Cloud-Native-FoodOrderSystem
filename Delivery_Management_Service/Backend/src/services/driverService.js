const Driver = require('../models/Driver');

class DriverService {
  // Find nearest available drivers
  async findNearestDrivers(restaurantLocation, maxDistance = 5000, limit = 5) {
    try {
      // Find drivers within maxDistance meters who are available
      const drivers = await Driver.find({
        isAvailable: true,
        currentLocation: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: restaurantLocation.coordinates
            },
            $maxDistance: maxDistance // meters
          }
        }
      }).limit(limit);
      
      return drivers;
    } catch (error) {
      console.error('Error finding nearest drivers:', error);
      throw error;
    }
  }
  
  // Update driver location
  async updateLocation(driverId, coordinates) {
    try {
      return await Driver.findByIdAndUpdate(
        driverId,
        {
          currentLocation: {
            type: 'Point',
            coordinates: coordinates
          }
        },
        { new: true }
      );
    } catch (error) {
      console.error('Error updating driver location:', error);
      throw error;
    }
  }
  
  // Update driver availability
  async updateAvailability(driverId, isAvailable) {
    try {
      return await Driver.findByIdAndUpdate(
        driverId,
        { isAvailable: isAvailable },
        { new: true }
      );
    } catch (error) {
      console.error('Error updating driver availability:', error);
      throw error;
    }
  }
  
  // Add a rating for a driver
  async addRating(driverId, orderId, rating) {
    try {
      const driver = await Driver.findById(driverId);
      
      if (!driver) {
        throw new Error('Driver not found');
      }
      
      // Add new rating
      driver.ratings.push({ orderId, rating });
      
      // Calculate new average
      const sum = driver.ratings.reduce((acc, curr) => acc + curr.rating, 0);
      driver.averageRating = sum / driver.ratings.length;
      
      return await driver.save();
    } catch (error) {
      console.error('Error adding driver rating:', error);
      throw error;
    }
  }
}

module.exports = new DriverService();
