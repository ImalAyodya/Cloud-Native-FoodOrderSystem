const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path'); // Add path module for serving static files
const app = express();

const MenuItemRouter = require('./routes/menuRoutes');
const RestaurantRouter = require('./routes/restaurantRoutes');

require('dotenv').config();

// Middlewares
app.use(express.json({ limit: '50mb' })); // Increase payload size limit
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Increase payload size limit
app.use(cors({ origin: 'http://localhost:5173', credentials: true })); // Allow requests from frontend

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/menu', MenuItemRouter);
app.use('/api/restaurant', RestaurantRouter);

// Default route for testing
app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});