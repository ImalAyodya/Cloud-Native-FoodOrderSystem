const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Get user profile
const getProfile = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            user: req.user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['name', 'email', 'phoneNo', 'address'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));
        
        if (!isValidOperation) {
            return res.status(400).json({ success: false, message: 'Invalid updates' });
        }
        
        // Apply updates
        updates.forEach(update => {
            req.user[update] = req.body[update];
        });
        
        await req.user.save();
        
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: req.user
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update password
const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, req.user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }
        
        // Hash and set new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        req.user.password = hashedPassword;
        await req.user.save();
        
        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Upload avatar (assuming you have file upload middleware)
const uploadAvatar = async (req, res) => {
    try {
        // Assuming req.file contains the uploaded file path/URL
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        
        req.user.avatar = req.file.path || req.file.location;
        await req.user.save();
        
        res.status(200).json({
            success: true,
            message: 'Avatar uploaded successfully',
            avatarUrl: req.user.avatar
        });
    } catch (error) {
        console.error('Upload avatar error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get user dashboard data
const getDashboard = async (req, res) => {
    try {
        // Fetch whatever dashboard data you need for this user
        // This would depend on your specific application

        // Example: fetch recent orders
        // const recentOrders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(5);
        
        res.status(200).json({
            success: true,
            dashboardData: {
                user: req.user,
                // recentOrders,
                // Any other relevant user dashboard data
            }
        });
    } catch (error) {
        console.error('Get dashboard error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get users by role
const getUsersByRole = async (req, res) => {
    try {
        const { role } = req.params;
        
        // Validate role parameter
        const validRoles = ['customer', 'restaurant_owner', 'delivery_person', 'admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid role parameter. Valid roles are: customer, restaurant_owner, delivery_person, admin' 
            });
        }
        
        // Optional query parameters for pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        
        // Find users with the specified role
        const users = await User.find({ role, isActive: true })
            .select('-password') // Exclude password
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        
        // Count total users with this role for pagination info
        const totalUsers = await User.countDocuments({ role, isActive: true });
        
        res.status(200).json({
            success: true,
            count: users.length,
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page,
            users
        });
    } catch (error) {
        console.error('Get users by role error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    updatePassword,
    uploadAvatar,
    getDashboard,
    getUsersByRole
};