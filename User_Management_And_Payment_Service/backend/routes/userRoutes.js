const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');
// Assuming you have multer for file uploads
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Protected user routes
router.get('/me', auth, userController.getProfile);
router.put('/me', auth, userController.updateProfile);
router.patch('/me/password', auth, userController.updatePassword);
router.post('/me/avatar', auth, upload.single('avatar'), userController.uploadAvatar);
router.get('/me/dashboard', auth, userController.getDashboard);

module.exports = router;