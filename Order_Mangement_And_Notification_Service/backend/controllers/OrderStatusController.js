const Order = require('../models/Order');

// Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { newStatus } = req.body;

        // Check if orderId is provided
        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: 'Order ID is required',
            });
        }

        // Optional: Check if orderId is a valid ObjectId
        // Uncomment if you are using MongoDB _id for orderId
        /*
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Order ID format',
            });
        }
        */

        // Check if newStatus is provided
        if (!newStatus || typeof newStatus !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'New status is required and must be a string',
            });
        }

        // Validate the new status
        const validStatuses = [
            'Pending', 'Confirmed', 'Preparing', 
            'Ready for Pickup', 'On the way', 
            'Delivered', 'Cancelled', 'Failed', 
            'Refunded', 'Completed'
        ];

        if (!validStatuses.includes(newStatus)) {
            return res.status(400).json({
                success: false,
                message: `Invalid order status. Valid statuses are: ${validStatuses.join(', ')}`,
            });
        }

        // Find and update the order
        const order = await Order.findOneAndUpdate(
            { orderId }, // Or use { _id: orderId } if using Mongo's ObjectId
            { orderStatus: newStatus },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        res.status(200).json({
            success: true,
            message: `Order status updated to '${newStatus}'`,
            data: order,
        });

    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update order status',
            error: error.message,
        });
    }
};