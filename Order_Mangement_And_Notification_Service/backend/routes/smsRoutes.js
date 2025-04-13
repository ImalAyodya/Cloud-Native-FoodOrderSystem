// routes/smsRoutes.js
const express = require('express');
const router = express.Router();
const { sendSMS } = require('../controllers/smsController');

// POST /send-sms
router.post('/send-sms', sendSMS);

module.exports = router;
