const stripe = require('../config/stripe');
const Order = require('../models/Order');

exports.createCheckoutSession = async (req, res) => {
  try {
    const { orderData } = req.body;
    
    if (!orderData || !orderData.items || !orderData.customer) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required order information' 
      });
    }

    // Format line items for Stripe
    const lineItems = orderData.items.map(item => {
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            description: `${item.size} - ${item.category}`,
            metadata: {
              itemId: item._id || 'custom',
              size: item.size,
              category: item.category
            }
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      };
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      customer_email: orderData.customer.email,
      client_reference_id: orderData.orderId,
      metadata: {
        orderId: orderData.orderId,
        restaurantId: orderData.restaurant,
        restaurantName: orderData.restaurantName,
        customerId: orderData.loggedInUser,
        customerName: orderData.loggedInUserName
      },
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'IN', 'AU', 'SG'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 0,
              currency: 'usd',
            },
            display_name: 'Free delivery',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 3,
              },
              maximum: {
                unit: 'business_day',
                value: 5,
              },
            }
          }
        }
      ],
    });

    res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create checkout session',
      error: error.message
    });
  }
};

exports.handleWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      // Update order payment status in database
      if (session.payment_status === 'paid') {
        try {
          const orderId = session.metadata.orderId;
          
          // Update the order status
          await Order.findOneAndUpdate(
            { orderId: orderId },
            { 
              paymentStatus: 'Completed',
              paymentTransactionId: session.payment_intent,
              'statusTimestamps.Confirmed': new Date(),
              orderStatus: 'Confirmed' 
            }
          );
          
          console.log(`Payment for order ${orderId} completed successfully`);
        } catch (error) {
          console.error('Error updating order payment status:', error);
        }
      }
      break;
      
    case 'payment_intent.payment_failed':
      const paymentIntent = event.data.object;
      console.log(`Payment failed: ${paymentIntent.last_payment_error?.message}`);
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).json({ received: true });
};

exports.getPaymentStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Session ID is required' });
    }
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    res.status(200).json({
      success: true,
      status: session.payment_status,
      orderId: session.metadata.orderId
    });
  } catch (error) {
    console.error('Error retrieving payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment status',
      error: error.message
    });
  }
};