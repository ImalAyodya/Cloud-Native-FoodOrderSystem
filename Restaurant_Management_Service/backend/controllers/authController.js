// const User = require('../models/User');
// const Restaurant = require('../models/Restaurant'); // Assuming you might need to link restaurant_admin to a restaurant upon registration
// const jwt = require('jsonwebtoken');

// // @desc    Register a new user
// // @route   POST /api/users/register
// // @access  Public
// exports.registerUser = async (req, res) => {
//   try {
//     const { email, password, role, restaurantId } = req.body;

//     // Basic validation
//     if (!email || !password || !role) {
//       return res.status(400).json({ error: 'Please enter all required fields: email, password, and role' });
//     }

//     // Check if user already exists
//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return res.status(400).json({ error: 'User already exists with that email' });
//     }

//     // Validate restaurantId if the role is restaurant_admin
//     if (role === 'restaurant_admin') {
//         if (!restaurantId) {
//             return res.status(400).json({ error: 'Restaurant ID is required for restaurant administrators' });
//         }
//         // Optional: Verify if the restaurantId is valid and exists in your database
//         const restaurant = await Restaurant.findById(restaurantId);
//         if (!restaurant) {
//              return res.status(400).json({ error: 'Invalid restaurant ID provided' });
//         }
//     } else if (role === 'customer' || role === 'delivery') {
//         // Ensure restaurantId is not sent or is ignored for other roles
//         if (restaurantId) {
//              return res.status(400).json({ error: 'Restaurant ID should not be provided for customer or delivery roles' });
//         }
//     } else {
//          return res.status(400).json({ error: 'Invalid user role specified' });
//     }


//     // Create user
//     const user = await User.create({
//       email,
//       password, // Password will be hashed by the pre-save hook in the User model
//       role,
//       restaurantId: role === 'restaurant_admin' ? restaurantId : undefined, // Only save restaurantId for restaurant_admin
//     });

//     if (user) {
//         // Optionally generate a token upon successful registration, depending on your flow
//         const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

//         res.status(201).json({
//             _id: user._id,
//             email: user.email,
//             role: user.role,
//             restaurantId: user.restaurantId,
//             token: token // Include token if generating here
//         });
//     } else {
//         res.status(400).json({ error: 'Invalid user data received' });
//     }

//   } catch (error) {
//     console.error('Register user error:', error.message);
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// // @desc    Get user profile
// // @route   GET /api/users/profile
// // @access  Private (requires authentication)
// exports.getUserProfile = async (req, res) => {
//   try {
//     // req.user is available due to the auth middleware
//     const user = await User.findById(req.user._id).select('-password'); // Exclude password

//     if (user) {
//       res.json({
//         _id: user._id,
//         email: user.email,
//         role: user.role,
//         restaurantId: user.restaurantId,
//         createdAt: user.createdAt,
//       });
//     } else {
//       res.status(404).json({ error: 'User not found' });
//     }
//   } catch (error) {
//     console.error('Get user profile error:', error.message);
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// // @desc    Update user profile
// // @route   PUT /api/users/profile
// // @access  Private (requires authentication)
// exports.updateUserProfile = async (req, res) => {
//     try {
//         // req.user is available due to the auth middleware
//         const user = await User.findById(req.user._id);

//         if (user) {
//             user.email = req.body.email || user.email;

//             // Only update password if it's provided in the request body
//             if (req.body.password) {
//                 user.password = req.body.password; // The pre-save hook will hash this
//             }

//             // Note: We are not allowing role or restaurantId to be updated via this route
//             // as these are typically set during registration and managed by administrators.
//             // If you need this functionality, you would create a separate admin route for it.

//             const updatedUser = await user.save();

//             res.json({
//                 _id: updatedUser._id,
//                 email: updatedUser.email,
//                 role: updatedUser.role,
//                 restaurantId: updatedUser.restaurantId,
//                 createdAt: updatedUser.createdAt,
//             });
//         } else {
//             res.status(404).json({ error: 'User not found' });
//         }
//     } catch (error) {
//         console.error('Update user profile error:', error.message);
//         res.status(500).json({ error: 'Server error' });
//     }
// };

// // You might also need controllers for admin-specific user management tasks
// // based on the PDF requirements (e.g., verifying restaurant registrations, managing user accounts)
// // These would typically require an 'admin' role check in the middleware.

const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Register a new user
exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    if (!['restaurant_admin', 'customer'].includes(role)) {
      return res.status(400).json({ error: 'Role must be restaurant_admin or customer' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create user
    const user = new User({
      email,
      password,
      role
    });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ error: error.message }); // Show detailed error
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role, restaurantId: user.restaurantId },
      process.env.JWT_SECRET,
      { expiresIn: '1000h' }
    );

    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};