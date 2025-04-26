const Order = require('../models/Order');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Create a new order
exports.createOrder = async (req, res) => {
    try {
        const order = new Order(req.body);
        await order.save();

        // Initialize Twilio client
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const client = twilio(accountSid, authToken);
        const whatsappNumber = process.env.TWILIO_WHATSAPP_PHONE_NUMBER;

        // Send email to the customer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Prepare the email content with DigiDine branding
        const emailContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        line-height: 1.6;
                        color: #333333;
                        max-width: 600px;
                        margin: 0 auto;
                    }
                    .header {
                        background: linear-gradient(to right, #FF6B35, #f8914a);
                        padding: 20px;
                        text-align: center;
                        color: white;
                        border-radius: 8px 8px 0 0;
                    }
                    .content {
                        padding: 20px;
                        background-color: #ffffff;
                        border: 1px solid #e1e1e1;
                        border-top: none;
                        border-radius: 0 0 8px 8px;
                    }
                    .footer {
                        text-align: center;
                        padding: 10px;
                        font-size: 12px;
                        color: #777;
                    }
                    .order-info {
                        background-color: #f9f9f9;
                        padding: 15px;
                        border-radius: 4px;
                        margin: 15px 0;
                        border-left: 4px solid #FF6B35;
                    }
                    .item-table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    .item-table th {
                        background-color: #f2f2f2;
                        text-align: left;
                        padding: 10px;
                    }
                    .item-table td {
                        padding: 8px;
                        border-bottom: 1px solid #eeeeee;
                    }
                    .total-row {
                        font-weight: bold;
                        background-color: #f9f9f9;
                    }
                    .button {
                        background-color: #FF6B35;
                        color: white;
                        padding: 10px 20px;
                        text-decoration: none;
                        border-radius: 4px;
                        display: inline-block;
                        margin: 20px 0;
                    }
                    .highlight {
                        color: #FF6B35;
                        font-weight: bold;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>DigiDine</h1>
                    <p>Your Order Has Been Received</p>
                </div>
                
                <div class="content">
                    <h2>Thank You for Your Order!</h2>
                    <p>Dear ${order.customer.name},</p>
                    <p>We're excited to confirm that we've received your order at <span class="highlight">${order.restaurantName}</span>. 
                    Your delicious food will be prepared fresh and delivered to you soon.</p>
                    
                    <div class="order-info">
                        <p><strong>Order ID:</strong> ${order.orderId}</p>
                        <p><strong>Date:</strong> ${new Date(order.placedAt || Date.now()).toLocaleString()}</p>
                        <p><strong>Delivery Address:</strong> ${order.customer.address}</p>
                        <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
                    </div>
                    
                    <h3>Order Items:</h3>
                    <table class="item-table">
                        <tr>
                            <th>Item</th>
                            <th>Size</th>
                            <th>Qty</th>
                            <th>Price</th>
                        </tr>
                        ${order.items.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td>${item.size}</td>
                                <td>${item.quantity}</td>
                                <td>$${(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                        <tr class="total-row">
                            <td colspan="3" style="text-align: right">Total Amount:</td>
                            <td>$${order.totalAmount.toFixed(2)}</td>
                        </tr>
                    </table>
                    
                    <p>You can track the status of your order through our DigiDine app or website.</p>
                    
                    <a href="https://digidine.com/track-order/${order.orderId}" class="button">Track Your Order</a>
                    
                    <p>If you have any questions or need assistance, please don't hesitate to contact us:</p>
                    <p>Email: support@digidine.com | Phone: (123) 456-7890</p>
                </div>
                
                <div class="footer">
                    <p>© ${new Date().getFullYear()} DigiDine | The Cloud-Native Food Ordering System</p>
                    <p>This is an automated message. Please do not reply to this email.</p>
                </div>
            </body>
            </html>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: order.customer.email,
            subject: `DigiDine: Order #${order.orderId} Confirmation`,
            html: emailContent,
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        // Prepare WhatsApp message content
        // Create a simplified item list for WhatsApp
        const itemList = order.items.map(item => 
            `• ${item.name} (${item.size}) x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
        ).join('\n');
        
        // Format WhatsApp message
        const whatsappMessage = `
🍽️ *DigiDine Order Confirmation* 🍽️

Hello ${order.customer.name}! Your order from *${order.restaurantName}* has been confirmed.

*Order #:* ${order.orderId}
*Estimated Delivery:* 30-45 minutes

*Your Order:*
${itemList}

*Total:* $${order.totalAmount.toFixed(2)}

Track your order here: https://digidine.com/track-order/${order.orderId}

Thank you for choosing DigiDine! 🙏
        `;

        // Only send WhatsApp message if customer phone is provided
        if (order.customer.phone) {
            try {
                // Format customer phone for WhatsApp
                
                // First, remove any spaces, dashes, parentheses, or other non-digit characters
                let cleanPhone = order.customer.phone.replace(/\D/g, '');
                
                // Handle Sri Lankan phone number formats
                // If number starts with 0, replace with +94
                if (cleanPhone.startsWith('0')) {
                    cleanPhone = '+94' + cleanPhone.substring(1);
                } 
                // If number doesn't start with + but has 9 digits (without country code)
                else if (!cleanPhone.startsWith('+') && cleanPhone.length === 9) {
                    cleanPhone = '+94' + cleanPhone;
                }
                // If number already has country code but missing +
                else if (cleanPhone.startsWith('94') && cleanPhone.length === 11) {
                    cleanPhone = '+' + cleanPhone;
                }
                // If number doesn't have country code or + (just the number without the leading 0)
                else if (!cleanPhone.startsWith('+') && !cleanPhone.startsWith('94') && cleanPhone.length < 11) {
                    cleanPhone = '+94' + cleanPhone;
                }
                // If not matching any pattern, assume it's already correctly formatted or needs manual check
                
                console.log(`Original phone: ${order.customer.phone}, Formatted phone: ${cleanPhone}`);
                console.log(`Sending WhatsApp to: whatsapp:${cleanPhone}`);
                
                // Send WhatsApp message
                await client.messages.create({
                    body: whatsappMessage,
                    from: `whatsapp:${whatsappNumber}`,
                    to: `whatsapp:${cleanPhone}`
                });
                
                console.log('WhatsApp message sent successfully');
            } catch (whatsappError) {
                console.error('Error sending WhatsApp message:', whatsappError);
                // Continue execution even if WhatsApp message fails
            }
        }

        res.status(201).json({
            success: true,
            message: 'Order created successfully and confirmations sent',
            order,
        });
    } catch (error) {
        console.error('Error creating order or sending notifications:', error);
        res.status(400).json({ 
            success: false,
            error: error.message 
        });
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
  const { items, totalAmount, paymentMethod } = req.body;
  
  try {
    // Validate inputs
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Items array is required and cannot be empty' 
      });
    }
    
    // Find the order by orderId
    const order = await Order.findOne({ orderId });
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    // Check if order can be updated (only allow updates for Pending status)
    if (order.orderStatus !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot update order that is in ${order.orderStatus} status. Only Pending orders can be updated.`
      });
    }
    
    // Update the items in the order
    order.items = items;
    
    // Update payment method if provided
    if (paymentMethod && ['Credit Card', 'Debit Card', 'PayPal', 'Cash on delivery'].includes(paymentMethod)) {
      order.paymentMethod = paymentMethod;
      
      // Update payment status based on payment method
      if (paymentMethod !== 'Cash on delivery') {
        order.paymentStatus = 'Completed';
      } else {
        order.paymentStatus = 'Pending';
      }
    }
    
    // Update the total amount (if provided, otherwise calculate)
    if (totalAmount !== undefined) {
      order.totalAmount = totalAmount;
    } else {
      // Calculate total amount from items
      order.totalAmount = items.reduce(
        (sum, item) => sum + (item.price * item.quantity), 0
      );
    }
    
    // Save the updated order
    await order.save();
    
    // Send email notification about order update
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      
      // Create a list of newly added items (assuming original items are first in the array)
      const originalItemCount = order.items.length - items.length + 1;
      const newItems = items.slice(originalItemCount - 1);
      
      const emailContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    line-height: 1.6;
                    color: #333333;
                    max-width: 600px;
                    margin: 0 auto;
                }
                .header {
                    background: linear-gradient(to right, #FF6B35, #f8914a);
                    padding: 20px;
                    text-align: center;
                    color: white;
                    border-radius: 8px 8px 0 0;
                }
                .content {
                    padding: 20px;
                    background-color: #ffffff;
                    border: 1px solid #e1e1e1;
                    border-top: none;
                    border-radius: 0 0 8px 8px;
                }
                .footer {
                    text-align: center;
                    padding: 10px;
                    font-size: 12px;
                    color: #777;
                }
                .order-info {
                    background-color: #f9f9f9;
                    padding: 15px;
                    border-radius: 4px;
                    margin: 15px 0;
                    border-left: 4px solid #FF6B35;
                }
                .item-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .item-table th {
                    background-color: #f2f2f2;
                    text-align: left;
                    padding: 10px;
                }
                .item-table td {
                    padding: 8px;
                    border-bottom: 1px solid #eeeeee;
                }
                .total-row {
                    font-weight: bold;
                    background-color: #f9f9f9;
                }
                .button {
                    background-color: #FF6B35;
                    color: white;
                    padding: 10px 20px;
                    text-decoration: none;
                    border-radius: 4px;
                    display: inline-block;
                    margin: 20px 0;
                }
                .highlight {
                    color: #FF6B35;
                    font-weight: bold;
                }
                .update-notice {
                    background-color: #fff3e0;
                    border: 1px solid #ffe0b2;
                    padding: 10px;
                    border-radius: 4px;
                    margin: 15px 0;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>DigiDine</h1>
                <p>Your Order Has Been Updated</p>
            </div>
            
            <div class="content">
                <div class="update-notice">
                    <p>Your order has been modified with additional items!</p>
                </div>
                
                <p>Dear ${order.customer.name},</p>
                <p>Your order (ID: <span class="highlight">${order.orderId}</span>) at <span class="highlight">${order.restaurantName}</span> has been updated with new items.</p>
                
                <div class="order-info">
                    <p><strong>Order ID:</strong> ${order.orderId}</p>
                    <p><strong>Date Updated:</strong> ${new Date().toLocaleString()}</p>
                    <p><strong>Delivery Address:</strong> ${order.customer.address}</p>
                    <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
                </div>
                
                <h3>Newly Added Items:</h3>
                <table class="item-table">
                    <tr>
                        <th>Item</th>
                        <th>Size</th>
                        <th>Qty</th>
                        <th>Price</th>
                    </tr>
                    ${newItems.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.size}</td>
                            <td>${item.quantity}</td>
                            <td>$${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                    <tr class="total-row">
                        <td colspan="3" style="text-align: right">New Total Amount:</td>
                        <td>$${order.totalAmount.toFixed(2)}</td>
                    </tr>
                </table>
                
                <p>You can track the updated status of your order through our DigiDine app or website.</p>
                
                <a href="https://digidine.com/track-order/${order.orderId}" class="button">Track Your Order</a>
                
                <p>If you have any questions or need assistance, please don't hesitate to contact us:</p>
                <p>Email: support@digidine.com | Phone: (123) 456-7890</p>
            </div>
            
            <div class="footer">
                <p>© ${new Date().getFullYear()} DigiDine | The Cloud-Native Food Ordering System</p>
                <p>This is an automated message. Please do not reply to this email.</p>
            </div>
        </body>
        </html>
      `;
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: order.customer.email,
        subject: `Order #${order.orderId} Updated`,
        html: emailContent,
      };
      
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Error sending email notification:', emailError);
      // Continue execution even if email fails
    }
    
    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      order
    });
    
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
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

// Get orders by restaurant ID
exports.getOrdersByRestaurantId = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    
    if (!restaurantId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Restaurant ID is required'
      });
    }
    
    // Find orders for the specified restaurant
    const orders = await Order.find({ restaurant: restaurantId })
      .sort({ placedAt: -1 }); // Sort by newest first
    
    if (!orders || orders.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'No orders found for this restaurant' 
      });
    }
    
    return res.status(200).json({
      success: true,
      count: orders.length,
      orders: orders
    });
  } catch (error) {
    console.error('Error fetching restaurant orders:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server error while fetching restaurant orders', 
      error: error.message 
    });
  }
};

// Get Ready for Pickup orders (specific convenience function)
exports.getReadyForPickupOrders = async (req, res) => {
    try {
      // Find all orders with Ready for Pickup status
      const readyOrders = await Order.find({ orderStatus: 'Ready for Pickup' })
        .sort({ 'statusTimestamps.Ready for Pickup': -1 }); // Sort by when they became ready
      
      if (!readyOrders || readyOrders.length === 0) {
        return res.status(404).json({ 
          success: false,
          message: 'No orders are currently ready for pickup' 
        });
      }
      
      return res.status(200).json({
        success: true,
        count: readyOrders.length,
        orders: readyOrders
      });
    } catch (error) {
      console.error('Error fetching ready for pickup orders:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Server error while fetching ready for pickup orders', 
        error: error.message 
      });
    }
  };

