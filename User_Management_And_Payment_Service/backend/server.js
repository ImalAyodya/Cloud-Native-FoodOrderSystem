const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes'); 

dotenv.config();

const app = express();
connectDB(); // Connect to MongoDB
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes); // Use auth routes


app.listen(process.env.PORT, () => {
    console.log('Server is running on port 5000');
})
