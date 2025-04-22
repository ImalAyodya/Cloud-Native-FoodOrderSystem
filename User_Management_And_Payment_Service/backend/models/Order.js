// backend/models/Order.js
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    restaurant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    total_price: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'canceled'],
        default: 'pending',
    },
}, { timestamps: { createdAt: 'created_at' } });

module.exports = mongoose.model('Order', OrderSchema);
