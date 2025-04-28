const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');
// Assuming you have multer for file uploads
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Protected user routes
//http://localhost:5000/api/users/me
router.get('/me', auth, userController.getProfile);
router.put('/me', auth, userController.updateProfile);
router.patch('/me/password', auth, userController.updatePassword);
router.post('/me/avatar', auth, upload.single('avatar'), userController.uploadAvatar);
router.get('/me/dashboard', auth, userController.getDashboard);
// Add this route to your existing routes
router.get('/role/:role', auth, userController.getUsersByRole);

module.exports = router;