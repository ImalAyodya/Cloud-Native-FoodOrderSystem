const Order = require('../models/Order');
const nodemailer = require('nodemailer');

// Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { newStatus } = req.body;

        // Check if orderId is provided
        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: 'Order ID is required',
            });
        }

        // Optional: Check if orderId is a valid ObjectId
        // Uncomment if you are using MongoDB _id for orderId
        /*
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Order ID format',
            });
        }
        */

        // Check if newStatus is provided
        if (!newStatus || typeof newStatus !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'New status is required and must be a string',
            });
        }

        // Validate the new status
        const validStatuses = [
            'Pending', 'Confirmed', 'Preparing', 
            'Ready for Pickup', 'On the way', 
            'Delivered', 'Cancelled', 'Failed', 
            'Refunded', 'Completed'
        ];

        if (!validStatuses.includes(newStatus)) {
            return res.status(400).json({
                success: false,
                message: `Invalid order status. Valid statuses are: ${validStatuses.join(', ')}`,
            });
        }

        // Find and update the order
        const order = await Order.findOneAndUpdate(
            { orderId }, // Or use { _id: orderId } if using Mongo's ObjectId
            { orderStatus: newStatus },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        // Save the updated order
        await order.save();

        // Emit the status change to all clients tracking this order
        if (req.io) {
            req.io.to(`order_${orderId}`).emit('order_status_update', {
                orderId,
                status: newStatus,
                timestamp: new Date(),
                driverId: order.diliveryDriverId,
                driverInfo: order.driverInfo,
                driverLocation: order.driverCurrentLocation
            });
            
            // Also notify the restaurant if applicable
            if (order.restaurant) {
                req.io.to(`restaurant_${order.restaurant}`).emit('order_status_update', {
                    orderId,
                    status: newStatus,
                    timestamp: new Date()
                });
            }
            
            // Notify driver if assigned
            if (order.diliveryDriverId) {
                req.io.to(`driver_${order.diliveryDriverId}`).emit('order_status_update', {
                    orderId,
                    status: newStatus,
                    timestamp: new Date()
                });
            }
        }

        res.status(200).json({
            success: true,
            message: `Order status updated to '${newStatus}'`,
            data: order,
        });

    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update order status',
            error: error.message,
        });
    }
};

// Cancel an order with reason
exports.cancelOrder = async (req, res) => {
    try {
      const { orderId } = req.params;
      const { reason, cancelledBy, additionalInfo } = req.body;
  
      // Validate required fields
      if (!reason) {
        return res.status(400).json({ 
          success: false, 
          message: 'Cancellation reason is required' 
        });
      }
  
      if (!cancelledBy || !['customer', 'restaurant', 'system'].includes(cancelledBy)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Valid cancelledBy value is required (customer, restaurant, or system)' 
        });
      }
  
      // Find the order
      const order = await Order.findOne({ orderId });
  
      if (!order) {
        return res.status(404).json({ 
          success: false, 
          message: 'Order not found' 
        });
      }
  
      // Check if order can be cancelled
      const nonCancellableStatuses = ['Delivered', 'Cancelled', 'Refunded', 'Completed'];
      if (nonCancellableStatuses.includes(order.orderStatus)) {
        return res.status(400).json({
          success: false,
          message: `Order cannot be cancelled because it is already ${order.orderStatus}`
        });
      }
  
      // Update order with cancellation details
      order.orderStatus = 'Cancelled';
      order.cancellation = {
        reason,
        cancelledBy,
        additionalInfo: additionalInfo || '',
        timestamp: new Date()
      };
  
      // Save the updated order
      await order.save();
  
      // Send email notification about cancellation
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });
  
        const emailContent = `
          <h2>Order Cancelled</h2>
          <p>Dear ${order.customer.name},</p>
          <p>Your order (ID: ${order.orderId}) has been cancelled.</p>
          <p><strong>Cancellation reason:</strong> ${reason}</p>
          <p><strong>Cancelled by:</strong> ${cancelledBy}</p>
          ${additionalInfo ? `<p><strong>Additional information:</strong> ${additionalInfo}</p>` : ''}
          <p>If you have any questions regarding this cancellation, please contact our customer support.</p>
          <p>Thank you for your understanding.</p>
        `;
  
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: order.customer.email,
          subject: `Your Order #${order.orderId} Has Been Cancelled`,
          html: emailContent,
        };
  
        await transporter.sendMail(mailOptions);
      } catch (emailError) {
        console.error('Failed to send cancellation email:', emailError);
        // Continue execution even if email fails
      }
  
      res.status(200).json({
        success: true,
        message: 'Order cancelled successfully',
        order
      });
  
    } catch (error) {
      console.error('Error cancelling order:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error', 
        error: error.message 
      });
    }
  };