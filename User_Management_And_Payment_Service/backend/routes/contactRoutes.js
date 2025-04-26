const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// Submit contact form
router.post('/submit', contactController.submitContactForm);

// Get all contact submissions (admin only)
router.get('/', contactController.getAllContacts);

// Get a single contact by ID (admin only)
router.get('/:id', contactController.getContactById);

// Update contact status (admin only)
router.put('/:id/status', contactController.updateContactStatus);

// Reply to a contact submission (admin only)
router.post('/:id/reply', contactController.replyToContact);

// Delete a contact submission (admin only)
router.delete('/:id', contactController.deleteContact);

module.exports = router;
