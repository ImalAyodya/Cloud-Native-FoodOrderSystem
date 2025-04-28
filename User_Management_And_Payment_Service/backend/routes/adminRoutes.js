const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/authMiddleware');
const roleCheck = require('../middleware/roleMiddleware');

// Admin routes (all protected)
//localhost:5000/api/admin/users
router.get('/users', auth, roleCheck(['admin']), adminController.getUsers);
router.get('/users/:id', auth, roleCheck(['admin']), adminController.getUserById);
router.post('/users', auth, roleCheck(['admin']), adminController.createUser);
router.put('/users/:id', auth, roleCheck(['admin']), adminController.updateUser);
router.delete('/users/:id', auth, roleCheck(['admin']), adminController.deleteUser);
router.patch('/users/:id/role', auth, roleCheck(['admin']), adminController.updateUserRole);
router.patch('/users/:id/status', auth, roleCheck(['admin']), adminController.updateUserStatus);

module.exports = router;