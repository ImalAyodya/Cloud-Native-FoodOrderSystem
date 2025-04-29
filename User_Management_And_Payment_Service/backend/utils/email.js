const nodemailer = require('nodemailer');
const axios = require('axios');

/**
 * Send email using local nodemailer configuration
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email content as HTML
 */
const sendLocalEmail = async (options) => {
    // Create transporter using Gmail service
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE, // 'gmail'
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // Define email options
    const mailOptions = {
        from: `"DigiDine" <${process.env.EMAIL_FROM}>`,
        to: options.to,
        subject: options.subject,
        html: options.html
    };

    // Send email
    await transporter.sendMail(mailOptions);
};

/**
 * Send email using Order Management & Notification Service
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Email content as text
 */
const sendEmailViaService = async (options) => {
    const NOTIFICATION_SERVICE_URL = process.env.ORDER_NOTIFICATION_SERVICE_URL || 'http://localhost:5001';
    
    try {
        const response = await axios.post(`${NOTIFICATION_SERVICE_URL}/api/email/send`, {
            recipientEmail: options.to,
            subject: options.subject,
            message: options.html || options.message
        });
        
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('Error sending email via notification service:', error.message);
        return {
            success: false,
            error: error.response?.data || error.message
        };
    }
};

/**
 * Send email using either local nodemailer or the notification service
 * @param {Object} options - Email options
 * @param {boolean} useService - Whether to use notification service (true) or local nodemailer (false)
 */
const sendEmail = async (options, useService = false) => {
    if (useService) {
        return sendEmailViaService(options);
    } else {
        await sendLocalEmail(options);
        return { success: true };
    }
};

module.exports = sendEmail;