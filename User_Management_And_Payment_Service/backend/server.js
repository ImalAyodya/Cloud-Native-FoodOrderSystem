const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes'); 
const paymentRoutes = require('./routes/paymentRoutes');

dotenv.config();

const app = express();

connectDB(); // Connect to MongoDB
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));
app.use("/api/auth", authRoutes); // Use auth routes
app.use('/api/payment', paymentRoutes);


app.listen(process.env.PORT, () => {
    console.log('Server is running on port 5000');
})
