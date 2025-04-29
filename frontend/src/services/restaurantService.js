import axios from 'axios';

const API_BASE_URL = 'http://localhost:5003/api/restaurant';

// Fetch all restaurants
export const fetchRestaurants = async () => {
  const response = await axios.get(`${API_BASE_URL}/get`);
  return response.data;
};

// Fetch a single restaurant by ID
export const fetchRestaurantById = async (restaurantId) => {
  const response = await axios.get(`${API_BASE_URL}/get/${restaurantId}`);
  return response.data;
};

