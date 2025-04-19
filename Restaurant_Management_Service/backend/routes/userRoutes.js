// const express = require('express');
// const userRouter = express.Router();
// const userController = require('../controllers/userController');
// const auth = require('../middleware/auth'); // Assuming you have a more general auth middleware

// // Public route for user registration
// userRouter.post('/register', userController.registerUser);

// // Private routes for authenticated users
// userRouter.get('/profile', auth, userController.getUserProfile);
// userRouter.put('/profile', auth, userController.updateUserProfile);

// // You would add admin-specific user routes here if needed, using an admin auth middleware
// // userRouter.get('/', adminAuth, userController.getAllUsers);
// // userRouter.get('/:id', adminAuth, userController.getUserById);
// // userRouter.put('/:id', adminAuth, userController.updateUser);
// // userRouter.delete('/:id', adminAuth, userController.deleteUser);


// module.exports = userRouter;