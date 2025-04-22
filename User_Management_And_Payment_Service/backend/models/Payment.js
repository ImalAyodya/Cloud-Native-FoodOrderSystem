const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  payment_id: { type: String, required: true, unique: true },
  order_id: { type: String, required: true },
  customer_id: { type: String, required: true },
  amount: { type: Number, required: true },
  payment_method: { type: String, enum: ["Stripe", "PayPal", "PayHere"], required: true },
  status: { type: String, enum: ["paid", "failed"], required: true }
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
