const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const app = express()

const MenuItemRouter = require('./routes/menuRoutes');
const RestaurantRouter = require('./routes/restaurantRoutes');



require('dotenv').config()

//middlewares
app.use(express.json())
app.use(cors())

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/menu', MenuItemRouter);

app.use('/api/restaurant', RestaurantRouter);

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});