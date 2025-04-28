require('dotenv').config();
const axios = require('axios');

// URL of the notification service
const ORDER_NOTIFICATION_SERVICE_URL = process.env.ORDER_NOTIFICATION_SERVICE_URL || 'http://localhost:5001';

/**
 * Send an SMS using the Order Management & Notification Service
 * @param {string} to - Recipient phone number
 * @param {string} message - Message content
 * @returns {Promise} - Response from the SMS service
 */
const sendSMS = async (to, message) => {
  try {
    console.log(`Attempting to send SMS to ${to} via ${ORDER_NOTIFICATION_SERVICE_URL}/api/send-sms`);
    
    const response = await axios.post(`${ORDER_NOTIFICATION_SERVICE_URL}/api/send-sms`, {
      to,
      message
    });
    
    console.log('SMS response:', response.data);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error sending SMS:', error.message);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
};

/**
 * Send a WhatsApp message using the Order Management & Notification Service
 * @param {string} to - Recipient phone number (without the "whatsapp:" prefix)
 * @param {string} message - Message content
 * @returns {Promise} - Response from the WhatsApp service
 */
const sendWhatsApp = async (to, message) => {
  try {
    const response = await axios.post(`${ORDER_NOTIFICATION_SERVICE_URL}/api/send-whatsapp`, {
      to,
      message
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error.message);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
};

module.exports = {
  sendSMS,
  sendWhatsApp
};