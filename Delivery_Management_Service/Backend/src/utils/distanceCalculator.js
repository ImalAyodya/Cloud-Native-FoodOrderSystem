/**
 * Calculate distance between two points using the Haversine formula
 * @param {Array} point1 [longitude, latitude]
 * @param {Array} point2 [longitude, latitude] 
 * @returns {Number} Distance in kilometers
 */
const calculateDistance = (point1, point2) => {
    const [lon1, lat1] = point1;
    const [lon2, lat2] = point2;
    
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    
    return distance;
  };
  
  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };
  
  /**
   * Estimate delivery time based on distance
   * @param {Number} distanceInKm Distance in kilometers 
   * @returns {Number} Estimated time in minutes
   */
  const estimateDeliveryTime = (distanceInKm) => {
    // Assume average speed of 30 km/h in city
    const avgSpeedKmPerHour = 30;
    // Convert to minutes, add 10 minutes buffer
    return Math.ceil((distanceInKm / avgSpeedKmPerHour) * 60) + 10;
  };
  
  module.exports = {
    calculateDistance,
    estimateDeliveryTime
  };
  