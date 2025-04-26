const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');

// Submit contact form
exports.submitContactForm = async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
  
      // Validate required fields
      if (!name || !email || !subject || !message) {
        return res.status(400).json({
          success: false,
          message: 'Please provide all required fields'
        });
      }
  
      // Create new contact entry
      const contact = await Contact.create({
        name,
        email,
        subject,
        message
      });
  
      // Create HTML email content
      const htmlContent = `
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
            </style>
          </head>
          <body>
            <div class="header">
              <h1>DigiDine</h1>
              <p>Thank You for Contacting Us</p>
            </div>
            <div class="content">
              <h2>Hello ${name},</h2>
              <p>Thank you for reaching out to us. We've received your message and we'll get back to you as soon as possible.</p>
              <p><strong>Subject:</strong> ${subject}</p>
              <p>Our team is reviewing your message and will respond within 24-48 hours.</p>
              <p>If you have any urgent concerns, please call us at +94 11 234 5678.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} DigiDine | The Cloud-Native Food Ordering System</p>
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </body>
        </html>
      `;
  
      // Configure transporter just like in emailController
      const transporter = nodemailer.createTransport({
        service: 'gmail', // Use the same service as emailController
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
  
      // Log email credentials for debugging (remove in production)
      console.log('Email credentials:', {
        user: process.env.EMAIL_USER ? 'provided' : 'missing',
        pass: process.env.EMAIL_PASS ? 'provided' : 'missing'
      });
  
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Thank you for contacting DigiDine',
        text: `Thank you for your message. We'll respond as soon as possible. Subject: ${subject}`, // Plain text version
        html: htmlContent // HTML version
      };
  
      // Send the email and await the result
      await transporter.sendMail(mailOptions);
  
      res.status(201).json({
        success: true,
        message: 'Your message has been sent successfully',
        data: contact
      });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit contact form',
        error: error.message
      });
    }
  };

// Get all contact submissions (admin only)
exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact submissions',
      error: error.message
    });
  }
};

// Get a single contact by ID
exports.getContactById = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findById(id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact submission',
      error: error.message
    });
  }
};

// Update contact status
exports.updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'responded', 'resolved'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
    
    const contact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update contact status',
      error: error.message
    });
  }
};


// Reply to a contact submission
exports.replyToContact = async (req, res) => {
    try {
      const { id } = req.params;
      const { replyMessage } = req.body;
      
      if (!replyMessage || replyMessage.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Reply message is required'
        });
      }
      
      // Find the contact submission
      const contact = await Contact.findById(id);
      
      if (!contact) {
        return res.status(404).json({
          success: false,
          message: 'Contact submission not found'
        });
      }
      
      // Create HTML email content
      const htmlContent = `
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
              .message-history {
                background-color: #f9f9f9;
                padding: 15px;
                margin-top: 20px;
                border-left: 3px solid #FF6B35;
                border-radius: 4px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>DigiDine</h1>
              <p>Response to Your Inquiry</p>
            </div>
            <div class="content">
              <h2>Hello ${contact.name},</h2>
              <p>Thank you for contacting DigiDine. Here is our response to your inquiry:</p>
              
              <div>${replyMessage.replace(/\n/g, '<br/>')}</div>
              
              <div class="message-history">
                <p><strong>Your original message:</strong></p>
                <p><strong>Subject:</strong> ${contact.subject}</p>
                <p>${contact.message.replace(/\n/g, '<br/>')}</p>
                <p><small>Sent on: ${new Date(contact.createdAt).toLocaleString()}</small></p>
              </div>
              
              <p>If you have any further questions, please feel free to reply to this email or contact us at +94 11 234 5678.</p>
              <p>Best regards,<br>DigiDine Support Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} DigiDine | The Cloud-Native Food Ordering System</p>
            </div>
          </body>
        </html>
      `;
  
      // Configure transporter just like in emailController
      const transporter = nodemailer.createTransport({
        service: 'gmail', // Use the same service as emailController
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
  
      // Log email credentials for debugging (remove in production)
      console.log('Email credentials:', {
        user: process.env.EMAIL_USER ? 'provided' : 'missing',
        pass: process.env.EMAIL_PASS ? 'provided' : 'missing'
      });
  
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: contact.email,
        subject: `RE: ${contact.subject}`,
        text: replyMessage, // Plain text version
        html: htmlContent // HTML version
      };
  
      // Send the email and await the result
      await transporter.sendMail(mailOptions);
      
      // Update contact status to responded
      contact.status = 'responded';
      await contact.save();
      
      res.status(200).json({
        success: true,
        message: 'Reply sent successfully',
        data: contact
      });
        
    } catch (error) {
      console.error('Error replying to contact:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process reply',
        error: error.message
      });
    }
  };

// Delete a contact submission
exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findByIdAndDelete(id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Contact submission deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete contact submission',
      error: error.message
    });
  }
};