const express = require('express');
const { login } = require('../controllers/authController'); 

const router = express.Router();

router.post('/login', login); // POST route for user login

module.exports = router;