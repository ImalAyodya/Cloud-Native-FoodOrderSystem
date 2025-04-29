const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Get all users with pagination, filtering and sorting
const getUsers = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            role, 
            search, 
            sortBy = 'createdAt', 
            order = 'desc',
            isActive
        } = req.query;
        
        // Build query
        const query = {};
        
        // Filter by role
        if (role) {
            query.role = role;
        }
        
        // Filter by status
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }
        
        // Search by name or email
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Build sort option
        const sortOption = {};
        sortOption[sortBy] = order === 'asc' ? 1 : -1;
        
        // Execute query with pagination
        const users = await User.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(parseInt(limit));
        
        // Count total users for pagination info
        const totalUsers = await User.countDocuments(query);
        
        res.status(200).json({
            success: true,
            count: users.length,
            totalUsers,
            totalPages: Math.ceil(totalUsers / parseInt(limit)),
            currentPage: parseInt(page),
            users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get a specific user by ID
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Create a new user (admin)
const createUser = async (req, res) => {
    try {
        const { name, email, password, phoneNo, address, role, isActive } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phoneNo,
            address,
            role: role || 'customer',
            isVerified: true, // Admin-created users are auto-verified
            isActive: isActive !== undefined ? isActive : true
        });
        
        await newUser.save();
        
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: newUser
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update a user
const updateUser = async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['name', 'email', 'phoneNo', 'address', 'role', 'isActive'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));
        
        if (!isValidOperation) {
            return res.status(400).json({ success: false, message: 'Invalid updates' });
        }
        
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // Apply updates
        updates.forEach(update => {
            user[update] = req.body[update];
        });
        
        await user.save();
        
        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            user
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Delete a user (permanent delete)
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // Don't allow admins to delete themselves
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ 
                success: false, 
                message: 'You cannot delete your own account' 
            });
        }
        
        // Perform permanent deletion
        await User.findByIdAndDelete(req.params.id);
        
        res.status(200).json({
            success: true,
            message: 'User permanently deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update user role
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        
        if (!role) {
            return res.status(400).json({ success: false, message: 'Role is required' });
        }
        
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // Don't allow admins to change their own role
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ 
                success: false, 
                message: 'You cannot change your own role' 
            });
        }
        
        user.role = role;
        await user.save();
        
        res.status(200).json({
            success: true,
            message: 'User role updated successfully',
            user
        });
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update user status (active/inactive)
const updateUserStatus = async (req, res) => {
    try {
        const { isActive } = req.body;
        
        if (isActive === undefined) {
            return res.status(400).json({ success: false, message: 'Status is required' });
        }
        
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // Don't allow admins to deactivate themselves
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ 
                success: false, 
                message: 'You cannot change your own status' 
            });
        }
        
        user.isActive = isActive;
        await user.save();
        
        res.status(200).json({
            success: true,
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            user
        });
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    updateUserRole,
    updateUserStatus
};