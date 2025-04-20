// backend/routes/authRoutes.js
const express = require('express');
const passport = require('passport');
const { registerUser, loginUser, verifyEmail } = require('../controllers/authController');

const router = express.Router();

// Google Login route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google Callback route
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
});

// Register route
router.post('/register', registerUser);

// Login route
router.post('/login', loginUser);

// Email verification route
router.get('/verify-email', verifyEmail);

module.exports = router;
