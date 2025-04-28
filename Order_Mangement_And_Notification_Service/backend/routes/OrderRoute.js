const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');

// Create a new order
//http://localhost:5001/api/orders/
router.post('/', OrderController.createOrder);
// Get all orders
//http://localhost:5001/api/orders/
router.get('/', OrderController.getAllOrders);

// SPECIFIC ROUTES MUST COME BEFORE PARAMETERIZED ROUTES
// Get all orders with Ready for Pickup status
//http://localhost:5001/api/orders/ready-for-pickup
router.get('/ready-for-pickup', OrderController.getReadyForPickupOrders);

// Get a single order by ID
//http://localhost:5001/api/orders/:id
router.get('/:id', OrderController.getOrderById);
//delete an order by ID
//http://localhost:5001/api/orders/orders/:id
router.delete('/orders/:orderId', OrderController.deleteOrderById);

//http://localhost:5001/api/orders/user/:userId
router.get('/user/:userId', OrderController.getOrdersByUserId);

// Get orders by restaurant ID
// http://localhost:5001/api/orders/restaurant/:restaurantId
router.get('/restaurant/:restaurantId', OrderController.getOrdersByRestaurantId);

// Route to update order items
// http://localhost:5001/api/orders/:orderId/items
router.put('/:orderId/items', OrderController.updateOrderItems);

// Route to fetch order by orderId
// http://localhost:5001/api/orders/orders/:orderId
router.get('/orders/:orderId', OrderController.getOrderByOrderId);

// Update driver assignment status
// http://localhost:5001/api/orders/:orderId/driver-assignment
router.put('/:orderId/driver-assignment', OrderController.updateDriverAssignment);

// Update driver location
// http://localhost:5001/api/orders/:orderId/update-driver-location
router.put('/:orderId/update-driver-location', OrderController.updateDriverLocation);

// Get order's driver assignment status
// http://localhost:5001/api/orders/:orderId/assignment-status
router.get('/:orderId/assignment-status', OrderController.getAssignmentStatus);

// Join tracking room for real-time updates
// http://localhost:5001/api/orders/track/:orderId
router.post('/track/:orderId', OrderController.joinTrackingRoom);

// Get orders assigned to a driver
// http://localhost:5001/api/orders/driver/:driverId
router.get('/driver/:driverId', OrderController.getDriverOrders);

// Get driver's delivery history
// http://localhost:5001/api/orders/driver/:driverId/history
router.get('/driver/:driverId/history', OrderController.getDriverDeliveryHistory);

// Get driver statistics
router.get('/driver/:driverId/stats', OrderController.getDriverStats);

module.exports = router;