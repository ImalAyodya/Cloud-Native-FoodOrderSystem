// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// // Middleware to authenticate and authorize Restaurant Admins
// const auth = async (req, res, next) => {
//   try {
//     // Extract token from Authorization header
//     const token = req.header('Authorization')?.replace('Bearer ', '');
//     if (!token) {
//       return res.status(401).json({ error: 'Authentication required' });
//     }

//     // Verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.userId).select('email role restaurantId');

//     // Check if user exists and is a restaurant_admin
//     if (!user || user.role !== 'restaurant_admin') {
//       return res.status(403).json({ error: 'Access denied: Restaurant Admin role required' });
//     }

//     // Attach user to request for use in controllers
//     req.user = user;
//     next();
//   } catch (error) {
//     console.error('Auth error:', error.message);
//     res.status(401).json({ error: 'Invalid or expired token' });
//   }
// };

// module.exports = auth;

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('email role restaurantId');
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    // Skip restaurantId check for POST /api/restaurant
    const isRestaurantCreation = req.method === 'POST' && req.originalUrl === '/api/restaurant/add';
    if (user.role === 'restaurant_admin' && !user.restaurantId && !isRestaurantCreation) {
      return res.status(403).json({ error: 'Please create a restaurant before proceeding' });
    }
    req.user = user;
    req.token = decoded;
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = auth;