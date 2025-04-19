// const express = require('express');
// const authRouter = express.Router();
// const User = require('../models/User');
// const jwt = require('jsonwebtoken');

// // Login endpoint
// authRouter.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Validate input
//     if (!email || !password) {
//       return res.status(400).json({ error: 'Email and password are required' });
//     }
//     // Find user
//     const user = await User.findOne({ email });

//     // Check if user exists and the password is correct
//     if (!user || !(await user.comparePassword(password))) {
//       return res.status(401).json({ 
//         error: 'Invalid email or password' 
//     });
//     }

//     // Check role
//     if (user.role !== 'restaurant_admin') {
//       return res.status(403).json({ error: 'Access denied: Restaurant Admin role required' });
//     }


//     // Generate JWT
//     const token = jwt.sign({ 
//         userId: user._id 
//     }, process.env.JWT_SECRET, { 
//         expiresIn: '30d' 
//     });

//     res.json({ 
//         message: 'Login successful', token 
//     });

//   } catch (error) {
//     console.error('Login error:', error.message);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// module.exports = authRouter;

const express = require('express');
const authRouter = express.Router();
const authController = require('../controllers/authController');

// Authentication routes
authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);

module.exports = authRouter;