import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.connectionAttempts = 0;
    this.maxAttempts = 3;
  }

  connect() {
    if (this.socket) return this.socket;
    
    console.log("Attempting to connect to WebSocket server...");
    this.connectionAttempts++;
    
    // Try port 5001 first
    try {
      this.socket = io('http://localhost:5001', {
        transports: ['polling', 'websocket'], // Start with polling first, then upgrade
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
        timeout: 10000
      });

      this.socket.on('connect', () => {
        console.log('Socket connected successfully to port 5001');
        this.connected = true;
        this.connectionAttempts = 0;
      });

      this.socket.on('connect_error', (err) => {
        console.error(`Socket connection error (attempt ${this.connectionAttempts}):`, err);
        this.connected = false;
      });
    } catch (error) {
      console.error('Error creating socket connection:', error);
    }

    return this.socket;
  }
  
  getSocket() {
    if (!this.socket) {
      return this.connect();
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      console.log("Socket disconnected");
    }
  }

  joinOrderRoom(orderId) {
    const socket = this.getSocket();
    socket.emit('join_order_room', orderId);
    console.log(`Joined order room: order_${orderId}`);
  }

  joinDriverRoom(driverId) {
    const socket = this.getSocket();
    if (socket && socket.connected) {
      socket.emit('join_driver_room', driverId);
      console.log(`Joined driver room: driver_${driverId}`);
    } else {
      console.warn('Socket not connected, unable to join driver room');
    }
  }
  
  joinRestaurantRoom(restaurantId) {
    const socket = this.getSocket();
    socket.emit('join_restaurant_room', restaurantId);
    console.log(`Joined restaurant room: restaurant_${restaurantId}`);
  }
  
  registerOrderStatusListener(callback) {
    const socket = this.getSocket();
    socket.on('order_status_update', callback);
    
    return () => socket.off('order_status_update', callback);
  }
  
  registerDriverLocationListener(callback) {
    const socket = this.getSocket();
    socket.on('driver_location_update', callback);
    
    return () => socket.off('driver_location_update', callback);
  }
  
  registerOrderAssignmentListener(callback) {
    const socket = this.getSocket();
    socket.on('new_assignment', callback);
    
    return () => socket.off('new_assignment', callback);
  }
}

export default new SocketService();