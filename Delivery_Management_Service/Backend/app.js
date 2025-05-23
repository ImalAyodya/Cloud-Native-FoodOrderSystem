const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const http = require('http');
const socketIO = require('socket.io');
const connectDB = require('./config/db');
const autoAssignmentService = require('./src/services/autoAssignmentService');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Track delivery
  socket.on('track-delivery', (deliveryId) => {
    socket.join(`delivery:${deliveryId}`);
    console.log(`Client ${socket.id} is now tracking delivery ${deliveryId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io available to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes

app.use('/api/deliveries', require('./src/routes/deliveryRoutes'));
app.use('/api', require('./src/routes/autoAssignmentRoutes'));

// Start the auto-assignment service on server startup
// Uncomment the next line to automatically start assignment on server startup
// autoAssignmentService.startAutomaticAssignment();

console.log('Auto-assignment service initialized');

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error' });
});

const PORT = process.env.PORT || 5002;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server };