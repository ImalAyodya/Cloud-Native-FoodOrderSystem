// backend/controllers/orderController.js
const Order = require('../models/Order');
const User = require('../models/User');

const placeOrder = async (req, res) => {
    try {
        const { customer_id, restaurant_id, total_price } = req.body;

        const newOrder = new Order({
            customer_id,
            restaurant_id,
            total_price,
            status: 'pending',
        });

        await newOrder.save();

        // 🟢 Loyalty Points Logic
        const pointsEarned = Math.floor(total_price / 10);
        await User.findByIdAndUpdate(customer_id, { $inc: { loyaltyPoints: pointsEarned } });

        res.status(201).json({
            message: "Order placed successfully",
            order: newOrder,
            pointsEarned,
        });
    } catch (error) {
        console.error("Error placing order:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { placeOrder };
