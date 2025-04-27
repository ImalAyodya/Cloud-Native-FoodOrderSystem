const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/email');

// Register a new user
const register = async (req, res) => {
    try {
        const { name, email, password, phoneNo, address, role } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'User with this email already exists' 
            });
        }
        
        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new user
        const user = new User({
            name,
            email,
            password: hashedPassword,
            phoneNo,
            address,
            role: role || 'customer', // Default to customer role
            verificationToken
        });
        
        await user.save();
        
        // Send verification email
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
        await sendEmail({
            to: email,
            subject: 'DigiDine - Please verify your email',
            html: `
                <h1>Welcome to DigiDine!</h1>
                <p>Please click the link below to verify your email address:</p>
                <a href="${verificationUrl}">Verify Email</a>
            `
        });
        
        res.status(201).json({
            success: true,
            message: 'User registered successfully. Please check your email to verify your account.'
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        
        // Check if account is active
        if (!user.isActive) {
            return res.status(401).json({ success: false, message: 'Account is suspended' });
        }
        
        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        
        // Update last login timestamp
        user.lastLogin = new Date();
        await user.save();
        
        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );
        
        res.status(200).json({
            success: true,
            user,
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Verify email
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        
        const user = await User.findOne({ verificationToken: token });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
        }
        
        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();
        
        res.status(200).json({ success: true, message: 'Email verified successfully' });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Request password reset
const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // Generate reset token and expiry
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();
        
        // Send password reset email
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        await sendEmail({
            to: email,
            subject: 'DigiDine - Password Reset Request',
            html: `
                <h1>Password Reset Request</h1>
                <p>You requested a password reset. Please click the link below to reset your password:</p>
                <a href="${resetUrl}">Reset Password</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        });
        
        res.status(200).json({
            success: true,
            message: 'Password reset email sent. Please check your inbox.'
        });
    } catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Reset password
const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired token' });
        }
        
        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Update user password and clear reset token
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        
        res.status(200).json({ success: true, message: 'Password reset successful' });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Logout (optional - client-side mainly)
const logout = async (req, res) => {
    // JWT tokens are stateless, so no server-side action needed
    // In a real implementation, you might use a token blacklist
    res.status(200).json({ success: true, message: 'Logged out successfully' });
};

module.exports = {
    register,
    login,
    verifyEmail,
    requestPasswordReset,
    resetPassword,
    logout
};