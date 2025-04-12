import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaBox, FaMapMarkerAlt, FaReceipt } from 'react-icons/fa';
import OrderTracker from './OrderTracker';

const OrderDetails = ({ order, onClose }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-500';
      case 'Cancelled': return 'bg-red-500';
      case 'Refunded': return 'bg-blue-500';
      case 'Failed': return 'bg-red-500';
      default: return 'bg-orange-500';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25 }}
          className="bg-white rounded-2xl p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Section with Badge */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">Order Details</h2>
                <span className={`text-xs font-medium text-white px-3 py-1 rounded-full ${getStatusColor(order.orderStatus)}`}>
                  {order.orderStatus}
                </span>
              </div>
              <p className="text-gray-500 font-medium">Order ID: {order.id}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              aria-label="Close"
            >
              <FaTimes className="text-gray-500" size={20} />
            </button>
          </div>

          {/* Order Tracker */}
          <div className="mb-8">
            <OrderTracker
              currentStatus={order.orderStatus}
              statusTimestamps={order.statusTimestamps}
            />
          </div>

          {/* Order Details Sections */}
          <div className="space-y-8">
            {/* Items Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <FaBox className="text-gray-600" />
                <h3 className="font-bold text-lg">Items</h3>
              </div>
              <div className="space-y-3">
              {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                    <span className="text-sm font-medium">{item.quantity}</span>
                  </div>
                  <span className="font-medium">{item.size} {item.name}</span>
                </div>
                <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <FaReceipt className="text-gray-600" />
                <h3 className="font-bold text-lg">Summary</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-orange-500">${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <FaMapMarkerAlt className="text-gray-600" />
                <h3 className="font-bold text-lg">Delivery Address</h3>
              </div>
              <p className="text-gray-600">{order.deliveryAddress}</p>
            </div>
            {/* Payment Method */}
            <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Payment Method: <span className="font-medium text-gray-800">{order.paymentMethod}</span>
                </p>
              </div>
          </div>

          {/* Order Status Footer */}
          {['Cancelled', 'Refunded', 'Completed', 'Failed'].includes(order.orderStatus) && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 rounded-xl p-4 text-center"
              style={{ backgroundColor: order.orderStatus === 'Completed' ? 'rgba(52, 211, 153, 0.1)' : 
                                        order.orderStatus === 'Cancelled' ? 'rgba(239, 68, 68, 0.1)' : 
                                        order.orderStatus === 'Refunded' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}
            >
              <p
                className={`text-lg font-semibold ${
                  order.orderStatus === 'Cancelled'
                    ? 'text-red-500'
                    : order.orderStatus === 'Refunded'
                    ? 'text-blue-500'
                    : order.orderStatus === 'Completed'
                    ? 'text-green-500'
                    : 'text-red-500' // For Failed
                }`}
              >
                Order {order.orderStatus}
              </p>
              {order.statusTimestamps[order.orderStatus] && (
                <div className="flex items-center justify-center text-sm mt-2">
                  <FaTimes className="mr-2 text-gray-500" size={12} />
                  <p className="text-gray-500">
                    {formatDate(order.statusTimestamps[order.orderStatus])}
                  </p>
                </div>
              )}
              
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OrderDetails;