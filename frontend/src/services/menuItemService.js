import axios from 'axios';

const API_BASE_URL = 'http://localhost:5003/api/menu';

// Fetch menu items for a specific restaurant
export const fetchMenuItemsByRestaurant = async (restaurantId) => {
  const response = await axios.get(`${API_BASE_URL}/get?restaurantId=${restaurantId}`);
  return response.data;
};

// Add a new menu item
export const addMenuItem = async (menuItemData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/add`, menuItemData);
    return response.data;
  } catch (error) {
    console.error('Error adding menu item:', error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

// Update a menu item
export const updateMenuItem = async (menuItemId, menuItemData) => {
  const response = await axios.put(`${API_BASE_URL}/update/${menuItemId}`, menuItemData);
  return response.data;
};

// Delete a menu item
export const deleteMenuItem = async (menuItemId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/delete/${menuItemId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting menu item:', error.response?.data || error.message);
      throw error.response?.data || error.message;
    }
  };