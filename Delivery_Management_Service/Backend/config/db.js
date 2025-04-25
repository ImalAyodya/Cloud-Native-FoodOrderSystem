// // config/db.js
// const mongoose = require('mongoose');

// // Use hardcoded connection string instead of .env
// const MONGODB_URI = 'mongodb+srv://Juthmini:Juthmini@cluster0.bx7gg.mongodb.net/food_ordering_system';

// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(MONGODB_URI);

    
//     console.log(`DB Connected`);            
//   } catch (error) {
//     console.error(`Error connecting to MongoDB: ${error.message}`);
//     process.exit(1);
//   }
// };

// module.exports = connectDB;

const mongoose = require('mongoose');

const connectDB = async () => {
  // try {

  //   const conn = await mongoose.connect(process.env.MONGO_URI);
  //   console.log(`DB Connected: ${conn.connection.host}`);
  // } catch (error) {
  //   console.error(`MongoDB Connection Error: ${error.message}`);
    
    // Try local fallback connection if main connection fails
    try {
      const localConn = await mongoose.connect('mongodb+srv://Juthmini:Juthmini@cluster0.bx7gg.mongodb.net/Food_ordering_system');
      console.log(`Connected to MongoDB`);
    } catch (localError) {
      console.error(`Local MongoDB Connection Error: ${localError.message}`);
      process.exit(1);
    }
  }


module.exports = connectDB;