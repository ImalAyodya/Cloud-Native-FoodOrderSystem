const axios = require('axios');

class OrderIntegrationService {
  constructor() {
    this.baseUrl = process.env.ORDER_SERVICE_URL || 'http://localhost:5001';
  }
  
  async getOrderById(orderId) {
    console.log(`[OrderIntegrationService] Fetching order ${orderId}`);
    try {
      const response = await axios.get(`${this.baseUrl}/api/orders/orders/${orderId}`);
      console.log(`[OrderIntegrationService] Successfully retrieved order ${orderId}`);
      return response.data;
    } catch (error) {
      console.error(`[OrderIntegrationService] Failed to fetch order ${orderId}:`, error.message);
      throw error;
    }
  }

  async getAllOrders() {
    console.log(`[OrderIntegrationService] Fetching all orders`);
    try {
      const response = await axios.get(`${this.baseUrl}/api/orders`);
      console.log(`[OrderIntegrationService] Successfully retrieved all orders`);
      return response.data;
    } catch (error) {
      console.error(`[OrderIntegrationService] Failed to fetch all orders:`, error.message);
      throw error;
    }
  }

  async getReadyForPickupOrders() {
    console.log(`[OrderIntegrationService] Fetching orders with 'Ready for Pickup' status`);
    try {
      const response = await axios.get(`${this.baseUrl}/api/orders/ready-for-pickup`);
      const orderCount = response.data?.orders?.length || 0;
      console.log(`[OrderIntegrationService] Successfully retrieved ${orderCount} Ready for Pickup orders`);
      return response.data;
    } catch (error) {
      console.error(`[OrderIntegrationService] Failed to fetch Ready for Pickup orders:`, error.message);
      throw error;
    }
  }

  async updateOrderDriverAssignment(orderId, assignmentData) {
    console.log(`[OrderIntegrationService] Updating driver assignment for order ${orderId}`);
    try {
      const response = await axios.put(
        `${this.baseUrl}/api/orders/${orderId}/driver-assignment`,
        assignmentData
      );
      console.log(`[OrderIntegrationService] Successfully updated driver assignment for order ${orderId}`);
      return response.data;
    } catch (error) {
      console.error(`[OrderIntegrationService] Failed to update driver assignment for order ${orderId}:`, error.message);
      throw error;
    }
  }
  
  async updateDriverLocation(orderId, locationData) {
    console.log(`[OrderIntegrationService] Updating driver location for order ${orderId}`);
    try {
      const response = await axios.put(
        `${this.baseUrl}/api/orders/${orderId}/update-driver-location`,
        { driverLocation: locationData }
      );
      console.log(`[OrderIntegrationService] Successfully updated driver location for order ${orderId}`);
      return response.data;
    } catch (error) {
      console.error(`[OrderIntegrationService] Failed to update driver location for order ${orderId}:`, error.message);
      throw error;
    }
  }

  async updateOrderStatus(orderId, newStatus) {
    console.log(`[OrderIntegrationService] Updating status for order ${orderId} to ${newStatus}`);
    try {
      const response = await axios.put(
        `${this.baseUrl}/api/orders/update-status/${orderId}`,
        { newStatus }
      );
      console.log(`[OrderIntegrationService] Successfully updated status for order ${orderId}`);
      return response.data;
    } catch (error) {
      console.error(`[OrderIntegrationService] Failed to update status for order ${orderId}:`, error.message);
      throw error;
    }
  }
}

module.exports = new OrderIntegrationService();