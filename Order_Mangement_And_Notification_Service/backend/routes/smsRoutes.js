// routes/smsRoutes.js
const express = require('express');
const { sendSMS, sendWhatsApp } = require('../controllers/smsController');

const router = express.Router();

router.post('/send-sms', sendSMS);
router.post('/send-whatsapp', sendWhatsApp);

module.exports = router;
