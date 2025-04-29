
// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     phoneNo: { type: String, required: true },
//     address: { type: String, required: true },
//     role: { type: String, enum: ['customer', 'restaurant_owner', 'admin', 'delivery_person'], default: 'customer' },
//     avatar: { type: String, default: '' },
//     isVerified: { type: Boolean, default: false },
//     isActive: { type: Boolean, default: true },
//     resetPasswordToken: { type: String },
//     resetPasswordExpires: { type: Date },
//     verificationToken: { type: String },
//     lastLogin: { type: Date },
//     createdAt: { type: Date, default: Date.now },
//     updatedAt: { type: Date, default: Date.now }
// }, {
//     timestamps: true
// });

// // Method to hide password in API responses
// userSchema.methods.toJSON = function() {
//     const user = this.toObject();
//     delete user.password;
//     delete user.resetPasswordToken;
//     delete user.resetPasswordExpires;
//     delete user.verificationToken;
//     return user;
// };

// module.exports = mongoose.model('User', userSchema);

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNo: { type: String, required: true },
    address: { type: String, required: true },
    role: { type: String, enum: ['customer', 'restaurant_owner', 'admin', 'delivery_person'], default: 'customer' },
    avatar: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    verificationToken: { type: String },
    lastLogin: { type: Date },
    
    // Delivery person specific fields
    vehicleType: { type: String, enum: ['motorcycle', 'car', 'bicycle', 'scooter'], default: 'motorcycle' },
    licensePlate: { type: String },
    currentLocation: {
        latitude: { type: Number },
        longitude: { type: Number },
        lastUpdated: { type: Date, default: Date.now }
    },
    isAvailable: { type: Boolean, default: false },
    currentOrders: [{ type: String }], // Order IDs
    
    // Restaurant owner specific fields
    businessName: { type: String },
    businessAddress: { type: String },
    taxId: { type: String },
    businessPhoneNo: { type: String },
    cuisineTypes: [{ type: String }],
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Method to hide password in API responses
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    delete user.resetPasswordToken;
    delete user.resetPasswordExpires;
    delete user.verificationToken;
    return user;
};

module.exports = mongoose.model('User', userSchema);