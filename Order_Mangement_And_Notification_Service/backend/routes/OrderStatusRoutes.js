const express = require('express');
const router = express.Router();
const OrderStatusController = require('../controllers/OrderStatusController');
const nodemailer = require('nodemailer');

// Update order status
// http://localhost:5001/api/orders/update-status/:orderId
router.put('/update-status/:orderId', OrderStatusController.updateOrderStatus);


// Cancel an order with reason
// http://localhost:5001/api/orders/cancel/:orderId
router.put('/cancel/:orderId', OrderStatusController.cancelOrder);
module.exports = router;