// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
connectDB();

// Base route
app.get('/', (req, res) => {
    res.send('Food Ordering System API is running...');
});

// Define port (use 5000 as fallback if PORT not defined in .env)
const PORT = process.env.PORT || 5002;

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});