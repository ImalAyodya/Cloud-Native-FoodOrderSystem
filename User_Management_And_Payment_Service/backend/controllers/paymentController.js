const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Payment = require("../models/Payment");
const { v4: uuidv4 } = require("uuid");

// exports.createPaymentIntent = async (req, res) => {
//   const { amount, order_id, customer_id } = req.body;

//   try {
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: amount * 100, // Stripe uses cents
//       currency: "usd",
//       payment_method_types: ["card"]
//     });

//     const payment_id = uuidv4();

//     const payment = new Payment({
//       payment_id,
//       order_id,
//       customer_id,
//       amount,
//       payment_method: "Stripe",
//       status: "paid" // for demo; in production, confirm from Stripe webhook
//     });

//     await payment.save();

//     res.status(200).json({
//       clientSecret: paymentIntent.client_secret,
//       payment_id,
//       message: "Payment initiated and saved"
//     });
//   } catch (err) {
//     console.error("Payment failed:", err.message);
//     res.status(500).json({ error: err.message });
//   }
// };

exports.createCheckoutSession = async (req, res) => {
    const { amount, order_id, customer_id } = req.body;
  
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Order ${order_id}`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1
        }],
        mode: 'payment',
        success_url: `http://localhost:3000/success?order_id=${order_id}`,
        cancel_url: `http://localhost:3000/cancel`,
        metadata: {
          order_id,
          customer_id
        }
      });
  
      res.status(200).json({ url: session.url });
    } catch (err) {
      console.error("Stripe session error:", err);
      res.status(500).json({ error: err.message });
    }
  };
  
