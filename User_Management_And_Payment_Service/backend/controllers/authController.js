const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/email');
const { sendWhatsApp } = require('../utils/smsService'); // Updated to import WhatsApp function

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
            isVerified: true // Auto-verify users since we're not using email verification
        });
        
        await user.save();
        
        // Send welcome email using stylish template
        try {
            const emailContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: 'Arial', sans-serif;
                            line-height: 1.6;
                            color: #333333;
                            max-width: 600px;
                            margin: 0 auto;
                        }
                        .header {
                            background: linear-gradient(to right, #FF6B35, #f8914a);
                            padding: 20px;
                            text-align: center;
                            color: white;
                            border-radius: 8px 8px 0 0;
                        }
                        .content {
                            padding: 20px;
                            background-color: #ffffff;
                            border: 1px solid #e1e1e1;
                            border-top: none;
                            border-radius: 0 0 8px 8px;
                        }
                        .footer {
                            text-align: center;
                            padding: 10px;
                            font-size: 12px;
                            color: #777;
                        }
                        .welcome-box {
                            background-color: #f9f9f9;
                            padding: 15px;
                            border-radius: 4px;
                            margin: 15px 0;
                            border-left: 4px solid #FF6B35;
                        }
                        .button {
                            background-color: #FF6B35;
                            color: white;
                            padding: 10px 20px;
                            text-decoration: none;
                            border-radius: 4px;
                            display: inline-block;
                            margin: 20px 0;
                        }
                        .highlight {
                            color: #FF6B35;
                            font-weight: bold;
                        }
                        .feature-grid {
                            display: flex;
                            flex-wrap: wrap;
                            margin: 20px 0;
                        }
                        .feature {
                            flex: 1 0 45%;
                            margin: 10px;
                            padding: 15px;
                            background-color: #f9f9f9;
                            border-radius: 5px;
                            text-align: center;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>DigiDine</h1>
                        <p>Welcome to Our Cloud-Native Food Ordering System!</p>
                    </div>
                    
                    <div class="content">
                        <h2>Thank You for Joining DigiDine!</h2>
                        <p>Dear ${name},</p>
                        <p>We're thrilled to welcome you to <span class="highlight">DigiDine</span>, your one-stop solution for ordering delicious meals from your favorite restaurants.</p>
                        
                        <div class="welcome-box">
                            <p><strong>Account Information:</strong></p>
                            <p><strong>Email:</strong> ${email}</p>
                            <p><strong>Account Type:</strong> ${role || 'Customer'}</p>
                            <p><strong>Registered On:</strong> ${new Date().toLocaleDateString()}</p>
                        </div>
                        
                        <h3>What You Can Do Now:</h3>
                        
                        <div class="feature-grid">
                            <div class="feature">
                                <h4>Browse Restaurants</h4>
                                <p>Explore our wide selection of top-rated restaurants in your area</p>
                            </div>
                            <div class="feature">
                                <h4>Order Food</h4>
                                <p>Place orders with just a few clicks and track them in real-time</p>
                            </div>
                            <div class="feature">
                                <h4>Save Favorites</h4>
                                <p>Save your favorite meals and restaurants for quick reordering</p>
                            </div>
                            <div class="feature">
                                <h4>Manage Profile</h4>
                                <p>Update your information and preferences anytime</p>
                            </div>
                        </div>
                        
                        <p>Ready to place your first order? Click the button below to start browsing our restaurants!</p>
                        
                        <a href="https://digidine.com/restaurants" class="button">Explore Restaurants</a>
                        
                        <p>If you have any questions or need assistance, please don't hesitate to contact us:</p>
                        <p>Email: support@digidine.com | Phone: (123) 456-7890</p>
                    </div>
                    
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} DigiDine | The Cloud-Native Food Ordering System</p>
                        <p>This is an automated message. Please do not reply to this email.</p>
                    </div>
                </body>
                </html>
            `;

            await sendEmail({
                to: email,
                subject: 'Welcome to DigiDine! 🍽️',
                html: emailContent
            });
            
            console.log('Welcome email sent successfully');
        } catch (emailError) {
            console.error('Error sending welcome email:', emailError);
            // Continue registration process even if email fails
        }
        
        // Send welcome WhatsApp message with better phone formatting
        try {
            // Format phone number similar to OrderController
            let cleanPhone = phoneNo.replace(/\D/g, '');
            
            // Handle Sri Lankan phone number formats
            if (cleanPhone.startsWith('0')) {
                cleanPhone = '94' + cleanPhone.substring(1);
            } 
            // If number doesn't start with + but has 9 digits (without country code)
            else if (!cleanPhone.startsWith('+') && cleanPhone.length === 9) {
                cleanPhone = '94' + cleanPhone;
            }
            // If number already has country code but missing +
            else if (cleanPhone.startsWith('94') && cleanPhone.length === 11) {
                cleanPhone = cleanPhone;
            }
            // If number doesn't have country code or + (just the number without the leading 0)
            else if (!cleanPhone.startsWith('+') && !cleanPhone.startsWith('94') && cleanPhone.length < 11) {
                cleanPhone = '94' + cleanPhone;
            }
            
            console.log(`Original phone: ${phoneNo}, Formatted phone: ${cleanPhone}`);
            
            const whatsappMessage = `
🍽️ *Welcome to DigiDine, ${name}!* 🍽️

Thank you for registering with us. Your account has been successfully created.

*What You Can Do Now:*
• Browse from our selection of restaurants
• Order delicious food for delivery or pickup
• Track your orders in real-time
• Save your favorite restaurants and meals

We're excited to have you on board! If you have any questions, please reach out to our customer support team.

Enjoy your DigiDine experience! 😊
            `;
            
            // Use the WhatsApp service to send the message
            const whatsappResult = await sendWhatsApp(cleanPhone, whatsappMessage);
            
            // Log WhatsApp result but don't fail registration if sending fails
            if (!whatsappResult.success) {
                console.warn('Failed to send welcome WhatsApp message:', whatsappResult.error);
            } else {
                console.log('WhatsApp welcome message sent successfully');
            }
        } catch (whatsappError) {
            console.error('WhatsApp message sending error (caught):', whatsappError);
            // Continue with registration even if WhatsApp fails completely
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );
        
        res.status(201).json({
            success: true,
            message: 'Welcome to DigiDine! Your account has been created successfully.',
            user,
            token
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