const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        unique: true,
        required: true,
        default: function() {
            // Generate a random order ID with prefix DGD (DigiDine)
            // Format: DGD-YEAR-MONTH-DAY-RANDOMNUMBER
            const now = new Date();
            const year = now.getFullYear().toString();
            const month = (now.getMonth() + 1).toString().padStart(2, '0');
            const day = now.getDate().toString().padStart(2, '0');
            const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            return `DGD-${year}${month}${day}-${random}`;
        }
    },
    restaurant: { type: String ,required: true }, // Link to restaurant
    restaurantName: { type: String, required: true },
    loggedInUser: { type: String, required: true }, // Link to logged-in user
    loggedInUserName: { type: String, required: true },
    customer: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true }
    },
    items: [
        {
            name: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true },
            category: { type: String, required: true },
            size: { type: String, required: true } // Added size field
        }
    ],
    orderNote: { type: String, default: '' }, // Optional note from customer
    discount: { type: Number, default: 0 }, // Discount applied to the order
    promoCode: { type: String, default: '' }, // Promo code used
    totalAmount: { type: Number, required: true },

    // Payment details
    paymentStatus: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
    paymentMethod: { type: String, enum: ['Credit Card', 'Debit Card', 'PayPal', 'Cash on delivery'], default: 'Credit Card' },
    paymentTransactionId: { type: String }, // Transaction ID from payment processor
    orderStatus: { 
        type: String, 
        enum: [
            'Pending', 'Confirmed', 'Preparing', 
            'Ready for Pickup', 'On the way', 
            'Delivered', 'Cancelled', 'Failed', 'Refunded', 'Completed'
        ], 
        default: 'Pending' 
    },
    
    // Add cancellation details
    cancellation: {
        reason: { type: String },
        cancelledBy: { 
            type: String, 
            enum: ['customer', 'restaurant', 'system'], 
        },
        additionalInfo: { type: String },
        timestamp: { type: Date }
    },
    
    statusTimestamps: {
        type: Map,
        of: Date,
        default: {}
    },
    
    placedAt: { type: Date, default: Date.now }
});

// Middleware to update status timestamps on save
OrderSchema.pre('save', function (next) {
    if (!this.statusTimestamps) {
        this.statusTimestamps = {};
    }
    this.statusTimestamps.set(this.orderStatus, new Date());
    
    // Add cancellation timestamp logic
    if (this.orderStatus === 'Cancelled' && !this.cancellation.timestamp) {
        this.cancellation.timestamp = new Date();
    }
    
    next();
});

// Middleware to update status timestamps on findOneAndUpdate
OrderSchema.pre('findOneAndUpdate', async function (next) {
    const update = this.getUpdate();
    
    // If updating to cancelled status
    if (update.orderStatus === 'Cancelled') {
        // Ensure the cancellation object exists in the update
        if (!update.cancellation) {
            update.cancellation = {};
        }
        
        // Set cancellation timestamp if not provided
        if (!update.cancellation.timestamp) {
            update.cancellation.timestamp = new Date();
        }
    }
    
    // Continue with existing timestamp logic
    if (update.orderStatus) {
        const order = await this.model.findOne(this.getQuery());
        if (order) {
            const statusTimestamps = order.statusTimestamps || new Map();
            statusTimestamps.set(update.orderStatus, new Date());
            update.statusTimestamps = statusTimestamps;
            this.setUpdate(update);
        }
    }
    
    next();
});

// Middleware to auto-update paymentStatus based on paymentMethod
OrderSchema.pre('save', function(next) {
    if (this.paymentMethod !== 'Cash on delivery') {
        this.paymentStatus = 'Completed'; // Auto-set to 'Completed' if not Cash on Delivery
    }
    next();
});

const Order = mongoose.model('Order', OrderSchema);
module.exports = Order;
