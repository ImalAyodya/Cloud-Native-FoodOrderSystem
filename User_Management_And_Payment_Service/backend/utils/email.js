const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
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

module.exports = sendEmail;