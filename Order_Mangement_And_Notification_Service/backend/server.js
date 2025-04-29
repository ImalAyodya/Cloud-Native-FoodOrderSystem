require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
app.use(express.json());
app.use(cors());

connectDB();

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Import and use routes
const orderRoutes = require('./routes/OrderRoute');
const orderStatusRoutes = require('./routes/OrderStatusRoutes');
const emailRoutes = require('./routes/emailRoutes');
const smsRoutes = require('./routes/smsRoutes'); 

app.use('/api/email', emailRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/orders', orderStatusRoutes);
app.use('/api', smsRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
