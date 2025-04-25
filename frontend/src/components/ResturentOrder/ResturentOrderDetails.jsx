import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaClock,
  FaTimes, 
  FaBox, 
  FaMapMarkerAlt, 
  FaReceipt, 
  FaUser,
  FaStore,
  FaCreditCard,
  FaExclamationTriangle,
  FaInfoCircle,
  FaPercentage,
  FaClipboardList,
  FaCalendarAlt,
  FaHashtag,
  FaMoneyBill,
  FaShieldAlt,
  FaTruck,
  FaIdCard,
  FaCheck
} from 'react-icons/fa';
import OrderTracker from '../../components/Order/OrderTracker';

const ResturentOrderDetails = ({ order, onClose, onStatusChange }) => {
  // Calculate subtotal correctly by summing all item prices * quantities
  const calculateSubtotal = () => {
    if (!order || !order.items || !Array.isArray(order.items)) return 0;
    return order.items.reduce((total, item) => {
      return total + ((Number(item.price) || 0) * (Number(item.quantity) || 0));
    }, 0);
  };

  const subtotal = calculateSubtotal();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return 'Invalid date';
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-500';
    
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      case 'refunded': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      case 'delivered': return 'bg-green-500';
      case 'on the way': return 'bg-blue-400';
      case 'ready for pickup': return 'bg-yellow-500';
      case 'preparing': return 'bg-indigo-500';
      case 'confirmed': return 'bg-teal-500';
      case 'pending': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getCancellationByText = (cancelledBy) => {
    if (!cancelledBy) return 'Unknown';
    
    switch (cancelledBy) {
      case 'customer': return 'Customer';
      case 'restaurant': return 'Restaurant';
      case 'system': return 'System';
      default: return 'Unknown';
    }
  };

  const getPaymentStatusBadge = (status) => {
    if (!status) return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">Unknown</span>;
    
    switch (status.toLowerCase()) {
      case 'completed': return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Completed</span>;
      case 'failed': return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Failed</span>;
      case 'pending': return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Pending</span>;
      default: return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">{status}</span>;
    }
  };
  
  // Add function to handle status updates if onStatusChange is provided
  const handleStatusUpdate = (newStatus) => {
    if (onStatusChange && order && (order.id || order.orderId)) {
      onStatusChange(order.id || order.orderId, newStatus);
    }
  };

  // Check if order object exists to avoid null reference errors
  if (!order) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md">
          <h2 className="text-xl font-bold text-red-500">Error</h2>
          <p className="mt-2">Order details could not be loaded.</p>
          <button 
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Safely access order properties
  const orderIdDisplay = order.id || order.orderId || 'No Order ID';
  const orderStatus = order.orderStatus || 'Unknown Status';
  const customerData = order.customer || {};
  const restaurantName = order.restaurantName || order.restaurant || 'Restaurant name not available';
  const orderItems = Array.isArray(order.items) ? order.items : [];
  const orderNote = order.orderNote || '';
  const statusTimestamps = order.statusTimestamps || {};
  const totalAmount = order.total || order.totalAmount || 0;
  const discount = order.discount || 0;
  const paymentMethod = order.paymentMethod || 'Not specified';
  const paymentStatus = order.paymentStatus || 'Unknown';
  const paymentTransactionId = order.paymentTransactionId || '';
  const loggedInUserName = order.loggedInUserName || 'Unknown user';
  const cancellation = order.cancellation || {};
  
  // Status action section only added for relevant statuses
  const showStatusActions = typeof onStatusChange === 'function';
  let statusAction = null;
  
  // Add status action buttons based on current status
  if (showStatusActions) {
    switch(orderStatus.toLowerCase()) {
      case 'pending':
        statusAction = (
          <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <p className="text-orange-700 font-medium">This order is pending confirmation</p>
              <button 
                onClick={() => handleStatusUpdate('Confirmed')}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
              >
                <FaCheck size={14} /> Confirm Order
              </button>
            </div>
          </div>
        );
        break;
      
      case 'confirmed':
        statusAction = (
          <div className="mb-6 bg-teal-50 border border-teal-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <p className="text-teal-700 font-medium">Order confirmed. Ready to prepare?</p>
              <button 
                onClick={() => handleStatusUpdate('Preparing')}
                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center gap-2"
              >
                <FaCheck size={14} /> Start Preparing
              </button>
            </div>
          </div>
        );
        break;
        
      case 'preparing':
        statusAction = (
          <div className="mb-6 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <p className="text-indigo-700 font-medium">Food preparation in progress</p>
              <button 
                onClick={() => handleStatusUpdate('Ready for Pickup')}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors flex items-center gap-2"
              >
                <FaBox size={14} /> Mark Ready for Pickup
              </button>
            </div>
          </div>
        );
        break;
        
      

      
        
      
        
      // No action buttons for completed, cancelled, failed, refunded statuses
    }
  }

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
          className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Section with Badge */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">Order Details</h2>
                <span className={`text-xs font-medium text-white px-3 py-1 rounded-full ${getStatusColor(orderStatus)}`}>
                  {orderStatus}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <FaHashtag className="text-gray-500" size={14} />
                <p className="text-gray-500 font-medium">{orderIdDisplay}</p>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <FaCalendarAlt className="text-gray-500" size={14} />
                <p className="text-gray-500 text-sm">Placed on {formatDate(order.placedAt || order.date)}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              aria-label="Close"
            >
              <FaTimes className="text-gray-500" size={20} />
            </button>
          </div>

          {/* Status Update Action - Show only if relevant */}
          {statusAction}

          {/* Order Tracker */}
          {Object.keys(statusTimestamps).length > 0 && (
            <div className="mb-8">
              <OrderTracker
                currentStatus={orderStatus}
                statusTimestamps={statusTimestamps}
              />
            </div>
          )}

          {/* Cancellation Details - Displayed only if order was cancelled */}
          {orderStatus.toLowerCase() === 'cancelled' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 bg-red-50 border border-red-100 rounded-xl p-6"
            >
              <div className="flex items-center gap-2 mb-4 text-red-600">
                <FaExclamationTriangle />
                <h3 className="font-bold text-lg">Order Cancellation</h3>
              </div>
              <div className="space-y-3 text-gray-700">
                <div>
                  <span className="font-medium">Cancelled By:</span> {getCancellationByText(cancellation.cancelledBy)}
                </div>
                <div>
                  <span className="font-medium">Reason:</span> {cancellation.reason || 'No reason provided'}
                </div>
                {cancellation.additionalInfo && (
                  <div>
                    <span className="font-medium">Additional Information:</span> {cancellation.additionalInfo}
                  </div>
                )}
                <div>
                  <span className="font-medium">Cancelled On:</span> {formatDate(cancellation.timestamp)}
                </div>
              </div>
            </motion.div>
          )}

          {/* Two-column layout for details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Restaurant Information */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <FaStore className="text-gray-600" />
                <h3 className="font-bold text-lg">Restaurant</h3>
              </div>
              <p className="text-gray-800 font-medium">{restaurantName}</p>
              {order.restaurant && order.restaurantName && order.restaurant !== order.restaurantName && (
                <p className="text-gray-500 text-sm mt-1">ID: {order.restaurant}</p>
              )}
            </div>

            {/* Customer Information */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <FaUser className="text-gray-600" />
                <h3 className="font-bold text-lg">Customer</h3>
              </div>
              <div className="space-y-1">
                <p className="text-gray-800 font-medium">{customerData.name || 'Name not available'}</p>
                <p className="text-gray-600 text-sm flex items-center">
                  <FaIdCard className="mr-2 text-gray-400" size={12} />
                  {customerData.email || 'Email not available'}
                </p>
                <p className="text-gray-600 text-sm flex items-center">
                  <FaTruck className="mr-2 text-gray-400" size={12} />
                  {customerData.phone || 'Phone not available'}
                </p>
              </div>
            </div>
          </div>

          {/* Order Details Sections */}
          <div className="space-y-6">
            {/* Items Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <FaBox className="text-gray-600" />
                <h3 className="font-bold text-lg">Items</h3>
              </div>
              {orderItems.length > 0 ? (
                <div className="space-y-3">
                  {orderItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                      <div className="flex gap-4 items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                          <span className="text-sm font-medium">{item.quantity || 0}</span>
                        </div>
                        <div>
                          <span className="font-medium">{item.name || 'Unnamed item'}</span>
                          <div className="text-xs text-gray-500 mt-1">
                            Size: {item.size || 'N/A'} | Category: {item.category || 'N/A'}
                          </div>
                        </div>
                      </div>
                      <span className="font-medium">${((item.price || 0) * (item.quantity || 0)).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No items in this order</p>
              )}
            </div>

            {/* Order Note (if exists) */}
            {orderNote && (
              <div className="bg-yellow-50 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FaClipboardList className="text-gray-600" />
                  <h3 className="font-bold text-lg">Order Note</h3>
                </div>
                <p className="text-gray-700 italic">"{orderNote}"</p>
              </div>
            )}

            {/* Delivery Address */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <FaMapMarkerAlt className="text-gray-600" />
                <h3 className="font-bold text-lg">Delivery Address</h3>
              </div>
              <p className="text-gray-600">{customerData.address || order.deliveryAddress || 'Address not available'}</p>
            </div>

            {/* Price Summary */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <FaReceipt className="text-gray-600" />
                <h3 className="font-bold text-lg">Payment Summary</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                
                {/* Show discount if exists */}
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center">
                      <FaPercentage className="mr-1" size={14} />
                      Discount {order.promoCode && `(${order.promoCode})`}
                    </span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-orange-500">${Number(totalAmount).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <FaCreditCard className="text-gray-600" />
                <h3 className="font-bold text-lg">Payment Information</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 flex items-center">
                    <FaMoneyBill className="mr-2 text-gray-400" size={14} />
                    Payment Method
                  </span>
                  <span className="font-medium">{paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 flex items-center">
                    <FaShieldAlt className="mr-2 text-gray-400" size={14} />
                    Payment Status
                  </span>
                  <div>{getPaymentStatusBadge(paymentStatus)}</div>
                </div>
                {paymentTransactionId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID</span>
                    <span className="font-medium text-xs bg-gray-100 px-2 py-1 rounded">{paymentTransactionId}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order placed by (additional information) */}
          {loggedInUserName && (
            <div className="mt-6 pt-4 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-500 flex items-center justify-center">
                <FaInfoCircle className="mr-2" size={14} />
                Order placed by {customerData.name}
              </p>
            </div>
          )}

          {/* Order Status Footer for completed/cancelled statuses */}
          {['cancelled', 'refunded', 'completed', 'failed'].includes(orderStatus.toLowerCase()) && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 rounded-xl p-4 text-center"
              style={{ 
                backgroundColor: 
                  orderStatus.toLowerCase() === 'completed' ? 'rgba(52, 211, 153, 0.1)' : 
                  orderStatus.toLowerCase() === 'cancelled' ? 'rgba(239, 68, 68, 0.1)' : 
                  orderStatus.toLowerCase() === 'refunded' ? 'rgba(59, 130, 246, 0.1)' : 
                  'rgba(239, 68, 68, 0.1)' 
              }}
            >
              <p className={`text-lg font-semibold ${
                orderStatus.toLowerCase() === 'cancelled' ? 'text-red-500' :
                orderStatus.toLowerCase() === 'refunded' ? 'text-blue-500' :
                orderStatus.toLowerCase() === 'completed' ? 'text-green-500' :
                'text-red-500' // For Failed
              }`}>
                Order {orderStatus}
              </p>
              
              {statusTimestamps && statusTimestamps[orderStatus] && (
                <div className="flex items-center justify-center text-sm mt-2">
                  <FaClock className="mr-2 text-gray-500" size={12} />
                  <p className="text-gray-500">
                    {formatDate(statusTimestamps[orderStatus])}
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

export default ResturentOrderDetails;