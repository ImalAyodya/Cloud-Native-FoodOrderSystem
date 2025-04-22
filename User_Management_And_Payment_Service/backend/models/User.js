// backend/models/User.js
const mongoose = require('mongoose');

// const UserSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password_hash: { type: String, required: true },
//     role: { type: String, enum: ['customer', 'restaurant_owner', 'admin', 'delivery_person'], default: 'customer' },
//     phone_number: { type: String },
//     address: { type: String },
//     isVerified: { type: Boolean, default: false },
//     googleId: { type: String }, // Google OAuth field
// }, { timestamps: true });

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    role: { type: String, enum: ['customer', 'restaurant_owner', 'admin', 'delivery_person'], default: 'customer' },
    phone_number: { type: String },
    address: { type: String },
    isVerified: { type: Boolean, default: false },
    googleId: { type: String },
    loyaltyPoints: { type: Number, default: 0 }, // ✅ New field
}, { timestamps: true });


module.exports = mongoose.model('User', UserSchema);
