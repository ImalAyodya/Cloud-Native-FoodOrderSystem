const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    phoneNo: {type: String, required: true},
    address: {type: String, required: true},
    role: {type: String, enum: ['customer', 'restaurant_owner', 'admin', 'delivery_person'], default: 'customer'},
});



module.exports = mongoose.model('User', userSchema);