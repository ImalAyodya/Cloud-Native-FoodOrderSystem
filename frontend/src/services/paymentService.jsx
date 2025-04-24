import axios from 'axios';

const API_URL = 'http://localhost:5000/api/payment';

export const createCheckoutSession = async (orderData) => {
  try {
    const response = await axios.post(`${API_URL}/create-checkout-session`, { orderData });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error creating checkout session' };
  }
};

export const getPaymentStatus = async (sessionId) => {
  try {
    const response = await axios.get(`${API_URL}/status/${sessionId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error retrieving payment status' };
  }
};