const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');

// Create a new order
//http://localhost:5001/api/orders/create
router.post('/create', OrderController.createOrder);
// Get all orders
//http://localhost:5001/api/orders/
router.get('/', OrderController.getAllOrders);
// Get a single order by ID
//http://localhost:5001/api/orders/:id
router.get('/:id', OrderController.getOrderById);
//delete an order by ID
//http://localhost:5001/api/orders/:id
router.delete('/:id', OrderController.deleteOrder);

module.exports = router;