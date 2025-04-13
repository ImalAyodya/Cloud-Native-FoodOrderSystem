const Order = require('../models/Order');
const nodemailer = require('nodemailer');

// Create a new order
exports.createOrder = async (req, res) => {
    try {
        const order = new Order(req.body);
        await order.save();

        // Send email to the customer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Prepare the email content
        const emailContent = `
            <h2>Order Placed Successfully</h2>
            <p>Dear ${order.customer.name},</p>
            <p>Thank you for placing your order with us! Here are your order details:</p>
            <ul>
                <li><strong>Order ID:</strong> ${order.orderId}</li>
                <li><strong>Restaurant:</strong> ${order.restaurantName}</li>
                <li><strong>Delivery Address:</strong> ${order.customer.address}</li>
                <li><strong>Total Amount:</strong> $${order.totalAmount.toFixed(2)}</li>
            </ul>
            <h3>Order Summary:</h3>
            <ul>
                ${order.items.map(item => `
                    <li>${item.quantity}x ${item.size} ${item.name} - $${(item.price * item.quantity).toFixed(2)}</li>
                `).join('')}
            </ul>
            <p>We will notify you once your order status is updated.</p>
            <p>Thank you for choosing our service!</p>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: order.customer.email,
            subject: 'Order Placed Successfully',
            html: emailContent,
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        res.status(201).json({
            success: true,
            message: 'Order created successfully and email sent to the customer',
            order,
        });
    } catch (error) {
        console.error('Error creating order or sending email:', error);
        res.status(400).json({ error: error.message });
    }
};

// Get all orders
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find();
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single order by ID
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//delete an order by ID
exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

    // Get orders by user ID
exports.getOrdersByUserId = async (req, res) => {
        try {
            const loggedInUser = req.params.userId;
            
            const orders = await Order.find({ loggedInUser })
                .sort({ placedAt: -1 }); // Sort by newest first

            if (!orders || orders.length === 0) {
                return res.status(404).json({ 
                    message: 'No orders found for this user' 
                });
            }

            res.status(200).json({
                success: true,
                count: orders.length,
                orders: orders
            });
        } catch (error) {
            res.status(500).json({ 
                success: false,
                error: 'Server Error',
                message: error.message 
            });
        }
};

exports.deleteOrderById = async (req, res) => {
    const { orderId } = req.params;

    console.log('Received orderId:', orderId); // Debug log

    if (!orderId) {
        return res.status(400).json({ message: 'Order ID is required' });
    }

    try {
        const existingOrder = await Order.findOne({ orderId });

        if (!existingOrder) {
            return res.status(404).json({ message: `No order found with ID: ${orderId}` });
        }

        const deletedOrder = await Order.findOneAndDelete({ orderId });

        res.status(200).json({
            message: 'Order deleted successfully',
            order: deletedOrder
        });
    } catch (error) {
        console.error('Error deleting order:', error);

        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid order ID format' });
        }

        res.status(500).json({
            message: 'Failed to delete order due to server error',
            error: error.message
        });
    }
};

// Update order items controller
exports.updateOrderItems = async (req, res) => {
    const { orderId } = req.params;
    const { items } = req.body; // Expecting an array of updated items
  
    try {
      // Find the order by ID
      const order = await Order.findOne({ orderId });
  
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
  
      // Validate the items array
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: 'Items array is required and cannot be empty' });
      }
  
      // Update the items in the order
      order.items = items;
  
      // Recalculate the total amount
      const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      order.totalAmount = totalAmount;
  
      // Save the updated order
      await order.save();
  
      res.status(200).json({
        success: true,
        message: 'Order items updated successfully',
        order
      });
    } catch (error) {
      console.error('Error updating order items:', error);
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  };

  // Fetch order by orderId
exports.getOrderByOrderId = async (req, res) => {
    const { orderId } = req.params;
  
    try {
      // Find the order by orderId
      const order = await Order.findOne({ orderId });
  
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
  
      res.status(200).json({ success: true, order });
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  };