// config/db.js
const mongoose = require('mongoose');

// Use hardcoded connection string instead of .env
const MONGODB_URI = 'mongodb+srv://Juthmini:Juthmini@cluster0.bx7gg.mongodb.net/food_ordering_system';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI);

    
    console.log(`DB Connected`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;