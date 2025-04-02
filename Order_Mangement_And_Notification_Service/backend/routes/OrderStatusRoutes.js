const express = require('express');
const router = express.Router();
const OrderStatusController = require('../controllers/OrderStatusController');

// Update order status
// http://localhost:5001/api/orders/update-status/:orderId
router.put('/update-status/:orderId', OrderStatusController.updateOrderStatus);

module.exports = router;