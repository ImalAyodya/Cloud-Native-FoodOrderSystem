const Order = require('../models/Order');

// Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params; // Get the order ID from the request parameters
        const { newStatus } = req.body; // Get the new status from the request body

        // Validate the new status
        const validStatuses = [
            'Pending', 'Confirmed', 'Preparing', 
            'Ready for Pickup', 'On the way', 
            'Delivered', 'Cancelled', 'Failed', 'Refunded', 'Completed'
        ];
        if (!validStatuses.includes(newStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order status'
            });
        }

        // Find the order and update the status
        const order = await Order.findOneAndUpdate(
            { orderId }, // Find the order by orderId
            { orderStatus: newStatus }, // Update the orderStatus
            { new: true } // Return the updated document
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            message: `Order status updated to '${newStatus}'`,
            data: order
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update order status',
            error: error.message
        });
    }
};