const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const dotenv = require('dotenv');
const Mailgun = require("mailgun.js")
const FormData = require("form-data");

dotenv.config();


// Initialize Mailgun
const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY,  // Use environment variable
    url: "https://api.mailgun.net",   // Correct Mailgun API base URL
});


// Register user (email and password)
const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "Email already in use" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const verificationToken = crypto.randomBytes(32).toString("hex");
        const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;

        const newUser = new User({
            name,
            email,
            password_hash: hashedPassword,
            role,
            isVerified: false,
            emailVerificationToken: verificationToken,
        });

        await newUser.save();

        // Send verification email via Mailgun
        try {
            const response = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
                from: `Your App <postmaster@${process.env.MAILGUN_DOMAIN}>`,
                to: [email],
                subject: "Verify Your Email",
                html: `<p>Click the link below to verify your email:</p><p><a href="${verificationLink}">Verify Email</a></p>`,
            });

            console.log("Mailgun response:", response);
            res.status(200).json({ message: "Registration successful! Please check your email to verify your account." });

        } catch (error) {
            console.error("Mailgun error:", error);
            res.status(500).json({ message: "Email not sent. Please try again later.", error: error.message });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Login user (email and password)
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        if (!user.isVerified) {
            return res.status(400).json({ message: 'Please verify your email first' });
        }

        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ token, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Email verification
const verifyEmail = async (req, res) => {
    const { token } = req.query;

    try {
        const user = await User.findOne({ emailVerificationToken: token });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification link' });
        } 

        user.isVerified = true;
        user.emailVerificationToken = null;
        await user.save();

        res.status(200).json({ message: 'Email successfully verified!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { registerUser, loginUser, verifyEmail };
