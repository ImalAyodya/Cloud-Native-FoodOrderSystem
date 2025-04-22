// backend/routes/orderRoutes.js
const express = require('express');
const { placeOrder } = require('../controllers/orderController');

const router = express.Router();

// POST: Place new order
router.post('/place', placeOrder);

module.exports = router;
