const express = require('express');
const router = express.Router();
const { sendEmail } = require('../controllers/emailController');

//http://localhost:5001/api/email/send-email
router.post('/send-email', sendEmail);

module.exports = router;
