const dotenv = require('dotenv');
dotenv.config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Check if the API key is properly loaded
if (!process.env.STRIPE_SECRET_KEY) {
    console.error('Warning: STRIPE_SECRET_KEY is not set in environment variables');
  }
module.exports = stripe;