const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Try local connection 
    const localConn = await mongoose.connect('mongodb+srv://Juthmini:Juthmini@cluster0.bx7gg.mongodb.net/Food_ordering_system');
    console.log('Connected to MongoDB: ${localConn.connection.host}');
  } catch (error) {
    console.error('MongoDB Connection Error: ${error.message}');
    process.exit(1);
  }
};

module.exports = connectDB;