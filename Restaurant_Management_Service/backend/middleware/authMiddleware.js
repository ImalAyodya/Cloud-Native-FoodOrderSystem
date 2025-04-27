const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  try {
    // Get token from header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized, no token' 
      });
    }

    try {
      // Verify token without checking role
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Add user from payload to request object - just store the ID
      // Don't validate role
      req.user = {
        id: decoded.id
      };
      
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized, token failed: ' + error.message
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error in authentication' 
    });
  }
};

module.exports = { protect };