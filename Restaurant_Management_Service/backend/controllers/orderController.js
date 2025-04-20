const Order = require('../models/Order');
const mongoose = require("mongoose");

// Get all orders for a restaurant
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ restaurantId: req.user.restaurantId })
      .populate('customerId', 'email')
      .populate('items.menuItemId', 'name price');
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'accepted', 'preparing', 'ready', 'delivered'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const order = await Order.findOneAndUpdate(
    { 
        _id: req.params.id, 
        restaurantId: req.user.restaurantId 
    },
    {
        status 
    },
    { 
        new: true 
    }
    );
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: 'Order status updated', order });
  } catch (error) {
    console.error('Update order status error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};