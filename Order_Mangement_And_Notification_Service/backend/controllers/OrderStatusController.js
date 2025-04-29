const Order = require('../models/Order');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

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

        // Find the order
        const order = await Order.findOne({ orderId });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        // Update the order status
        const oldStatus = order.orderStatus;
        order.orderStatus = newStatus;

        // Add timestamp for this status
        if (!order.statusTimestamps) {
            order.statusTimestamps = new Map();
        }
        order.statusTimestamps.set(newStatus, new Date());

        await order.save();

        // Send WhatsApp notifications when status changes to "On the way"
        if (newStatus === 'On the way') {
            // Initialize Twilio client
            const accountSid = process.env.TWILIO_ACCOUNT_SID;
            const authToken = process.env.TWILIO_AUTH_TOKEN;
            const client = twilio(accountSid, authToken);
            const whatsappNumber = process.env.TWILIO_WHATSAPP_PHONE_NUMBER;

            // 1. Notify customer that driver is on the way
            if (order.customer.phone) {
                try {
                    const customerPhone = formatPhoneForWhatsApp(order.customer.phone);

                    const estimatedTime = 30; // Example: 30 minutes estimated delivery time
                    const currentTime = new Date();
                    const estimatedDeliveryTime = new Date(currentTime.getTime() + estimatedTime * 60000);
                    const formattedDeliveryTime = `${estimatedDeliveryTime.getHours()}:${String(estimatedDeliveryTime.getMinutes()).padStart(2, '0')}`;

                    const customerMessage = `
🚚 *Your order is on the way!* 🚚

Your order #${order.orderId} from *${order.restaurantName}* is now on the way to your location.

*Estimated delivery time:* ${formattedDeliveryTime} (approx. ${estimatedTime} mins)

Your driver ${order.driverInfo?.name || 'is'} on the way with your food. You can track your delivery in real-time through our DigiDine app.

Thank you for choosing DigiDine! 🙏
                    `;

                    await client.messages.create({
                        body: customerMessage,
                        from: `whatsapp:${whatsappNumber}`,
                        to: `whatsapp:${customerPhone}`
                    });

                    console.log(`Customer on-the-way WhatsApp sent to ${customerPhone}`);
                } catch (error) {
                    console.error('Error sending on-the-way WhatsApp to customer:', error);
                }
            }

            // 2. Send delivery instructions to the driver
            if (order.driverInfo && order.driverInfo.phone) {
                try {
                    const driverPhone = formatPhoneForWhatsApp(order.driverInfo.phone);

                    const driverMessage = `
📍 *Delivery Instructions for Order #${order.orderId}* 📍

You're on your way with the order from ${order.restaurantName}!

*Delivery Address:*
${order.customer.address}

*Customer:*
${order.customer.name}
${order.customer.phone}

Remember to:
• Verify the order contents before leaving the restaurant
• Follow the in-app navigation to reach the customer
• Update your status to "Delivered" once completed

Safe travels! 🛵
                    `;

                    await client.messages.create({
                        body: driverMessage,
                        from: `whatsapp:${whatsappNumber}`,
                        to: `whatsapp:${driverPhone}`
                    });

                    console.log(`Driver delivery instructions WhatsApp sent to ${driverPhone}`);
                } catch (error) {
                    console.error('Error sending delivery instructions WhatsApp to driver:', error);
                }
            }
        }

        // Send WhatsApp notifications when status changes to "Delivered"
        if (newStatus === 'Delivered') {
            // Initialize Twilio client
            const accountSid = process.env.TWILIO_ACCOUNT_SID;
            const authToken = process.env.TWILIO_AUTH_TOKEN;
            const client = twilio(accountSid, authToken);
            const whatsappNumber = process.env.TWILIO_WHATSAPP_PHONE_NUMBER;
            
            // Notify customer that order is delivered
            if (order.customer.phone) {
                try {
                    const customerPhone = formatPhoneForWhatsApp(order.customer.phone);
                    
                    const customerMessage = `
🎉 *Your order has been delivered!* 🎉

Your order #${order.orderId} from *${order.restaurantName}* has been delivered.

We hope you enjoy your food! If you have a moment, please rate your delivery experience in our DigiDine app.

Thank you for choosing DigiDine! 🙏
                    `;
                    
                    await client.messages.create({
                        body: customerMessage,
                        from: `whatsapp:${whatsappNumber}`,
                        to: `whatsapp:${customerPhone}`
                    });
                    
                    console.log(`Customer delivery confirmation WhatsApp sent to ${customerPhone}`);
                } catch (error) {
                    console.error('Error sending delivery confirmation WhatsApp to customer:', error);
                }
            }
            
            // Send completion notification to driver
            if (order.driverInfo && order.driverInfo.phone) {
                try {
                    const driverPhone = formatPhoneForWhatsApp(order.driverInfo.phone);
                    
                    const driverMessage = `
✅ *Delivery Completed - Order #${order.orderId}* ✅

Great job! You've successfully delivered the order from ${order.restaurantName}.

Your delivery has been recorded in the system. Please check the app for your next delivery assignment.

Thank you for your hard work with DigiDine! 👍
                    `;
                    
                    await client.messages.create({
                        body: driverMessage,
                        from: `whatsapp:${whatsappNumber}`,
                        to: `whatsapp:${driverPhone}`
                    });
                    
                    console.log(`Driver completion WhatsApp sent to ${driverPhone}`);
                } catch (error) {
                    console.error('Error sending completion WhatsApp to driver:', error);
                }
            }
        }

        // Emit socket event if using Socket.io
        if (req.io) {
            req.io.to(`order_${orderId}`).emit('order_status_updated', {
                orderId,
                oldStatus,
                newStatus: newStatus,
                timestamp: new Date()
            });
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

// Helper function to format phone numbers for WhatsApp
function formatPhoneForWhatsApp(phoneNumber) {
    // Remove any non-digit characters
    let cleanPhone = phoneNumber.replace(/\D/g, '');

    // Handle Sri Lankan phone number formats
    if (cleanPhone.startsWith('0')) {
        cleanPhone = '94' + cleanPhone.substring(1);
    } 
    // If number doesn't start with + but has 9 digits (without country code)
    else if (!cleanPhone.startsWith('+') && cleanPhone.length === 9) {
        cleanPhone = '94' + cleanPhone;
    }
    // If number already has country code but missing +
    else if (cleanPhone.startsWith('94') && cleanPhone.length === 11) {
        // WhatsApp expects the country code without +
        cleanPhone = cleanPhone;
    }
    // If number doesn't have country code or + (just the number without the leading 0)
    else if (!cleanPhone.startsWith('+') && !cleanPhone.startsWith('94') && cleanPhone.length < 11) {
        cleanPhone = '94' + cleanPhone;
    }
    // If number already has + symbol, remove it
    else if (cleanPhone.startsWith('+')) {
        cleanPhone = cleanPhone.substring(1);
    }

    console.log(`Formatted phone for WhatsApp: ${cleanPhone}`);
    return cleanPhone;
}

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