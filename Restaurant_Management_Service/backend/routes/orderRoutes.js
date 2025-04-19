const express = require('express');
const OrderRouter = express.Router();
const auth = require('../middleware/auth');
const orderController = require('../controllers/orderController');

// Order Management
OrderRouter.get(
    '/get', 
    auth, 
    orderController.getOrders
);

OrderRouter.put(
    '/:id/status', 
    auth, 
    orderController.updateOrderStatus
);

module.exports = OrderRouter;