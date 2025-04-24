const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Create checkout session
router.post('/create-checkout-session', paymentController.createCheckoutSession);

// Webhook for handling Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

// Get payment status
router.get('/status/:sessionId', paymentController.getPaymentStatus);

// Add to your payment routes
router.post('/create-payment-intent', paymentController.createPaymentIntent);
module.exports = router;