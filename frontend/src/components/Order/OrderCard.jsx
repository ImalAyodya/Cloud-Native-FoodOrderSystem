import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FaStore,
  FaClock,
  FaCheck,
  FaTimes,
  FaBoxOpen,
  FaUtensils,
  FaTruck,
  FaUndo,
  FaExclamationTriangle,
  FaReceipt,
  FaTrash,
  FaEdit,
  FaCalendarAlt,
} from 'react-icons/fa';
import CancelOrderModal from './CancelOrder';

const OrderCard = ({ order, onViewDetails, onDelete, onReturn, onOrderStatusChange }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); // Use navigate for routing

  // Utility functions
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      case 'on the way':
        return 'bg-indigo-100 text-indigo-800';
      case 'ready for pickup':
        return 'bg-emerald-100 text-emerald-800';
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const statusIcons = {
    pending: <FaClock size={16} />,
    confirmed: <FaCheck size={16} />,
    preparing: <FaUtensils size={16} />,
    'ready for pickup': <FaBoxOpen size={16} />,
    'on the way': <FaTruck size={16} />,
    delivered: <FaCheck size={16} />,
    cancelled: <FaTimes size={16} />,
    failed: <FaExclamationTriangle size={16} />,
    refunded: <FaUndo size={16} />,
    completed: <FaCheck size={16} />,
  };

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit', hour12: true };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  // Action Handlers
  const handleDelete = async () => {
    setIsLoading(true);
    try {
      // Update this URL to include 'orders/' before the order ID
      const response = await fetch(`http://localhost:5001/api/orders/orders/${order.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete order');

      toast.success('Order deleted successfully');
      onDelete && onDelete(order.id);
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order. Please try again.');
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleComplete = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:5001/api/orders/update-status/${order.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newStatus: 'Completed' }),
      });

      if (!response.ok) throw new Error('Failed to update order status');

      const data = await response.json();

      // Update local state first
      onOrderStatusChange && onOrderStatusChange(order.id, 'Completed');

      // Show success message and close modal
      toast.success('Order marked as completed!');
      setShowCompleteConfirm(false);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = () => {
    // Navigate to the update page with the order ID
    navigate(`/orders/update/${order.id}`);
  };

  // Callback for when cancellation is complete
  const handleCancellationComplete = (orderId) => {
    // Update local state
    onOrderStatusChange && onOrderStatusChange(order.id, 'Cancelled');
  };

  // Updated CompleteConfirmationModal with consistent design
  const CompleteConfirmationModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 backdrop-blur-sm bg-black/60" 
        onClick={() => !isLoading && setShowCompleteConfirm(false)}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-xl p-6 max-w-sm w-11/12 md:w-auto shadow-2xl relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-center">
          <div className="bg-green-100 p-2 rounded-full mr-3">
            <FaCheck className="text-green-500" size={18} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Complete Order</h3>
        </div>
        <p className="text-gray-600 mb-6 pl-10">
          Are you sure you want to mark this order as completed?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => !isLoading && setShowCompleteConfirm(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleComplete}
            className="px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors disabled:opacity-50 shadow-sm flex items-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
                <span>Completing...</span>
              </>
            ) : (
              <>
                <FaCheck size={14} />
                <span>Complete</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );

  // Updated DeleteConfirmationModal with consistent design
  const DeleteConfirmationModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 backdrop-blur-sm bg-black/60"
        onClick={() => !isLoading && setShowDeleteConfirm(false)}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-xl p-6 max-w-sm w-11/12 md:w-auto shadow-2xl relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-center">
          <div className="bg-red-100 p-2 rounded-full mr-3">
            <FaTimes className="text-red-500" size={18} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Delete Order</h3>
        </div>
        <p className="text-gray-600 mb-6 pl-10">
          Are you sure you want to delete this order? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50 shadow-sm flex items-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <FaTimes size={14} />
                <span>Delete</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all duration-300 group"
      >
        {/* Status indicator - enhanced with gradient */}
        <div className={`w-full h-1.5 bg-gradient-to-r ${
          order.status.toLowerCase() === 'completed' || order.status.toLowerCase() === 'delivered' 
            ? 'from-green-400 to-green-500' : 
          order.status.toLowerCase() === 'cancelled' || order.status.toLowerCase() === 'failed'
            ? 'from-red-400 to-red-500' :
          order.status.toLowerCase() === 'refunded'
            ? 'from-blue-400 to-blue-500' :
          order.status.toLowerCase() === 'on the way'
            ? 'from-indigo-400 to-indigo-500' :
          order.status.toLowerCase() === 'ready for pickup'
            ? 'from-emerald-400 to-emerald-500' :
          order.status.toLowerCase() === 'preparing'
            ? 'from-orange-400 to-orange-500' :
          order.status.toLowerCase() === 'confirmed'
            ? 'from-blue-400 to-blue-500' :
          'from-yellow-400 to-yellow-500'
        }`}></div>

        <div className="p-6">
          <div className="flex justify-between items-start mb-5">
            {/* Restaurant info with improved layout */}
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300">
                <FaStore className="text-white text-lg" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-800">{order.restaurant}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="px-2 py-0.5 bg-gray-100 rounded-md text-gray-600 text-xs font-medium">
                    #{order.id.slice(-6)}
                  </div>
                  <span className="text-gray-500 text-xs">•</span>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <FaClock size={10} />
                    <span>{formatTime(order.date)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Status badge with enhanced design */}
            <div 
              className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 backdrop-filter backdrop-blur-[2px] ${
                order.status.toLowerCase() === 'completed' || order.status.toLowerCase() === 'delivered' 
                  ? 'bg-green-100/80 text-green-700 border border-green-200' : 
                order.status.toLowerCase() === 'cancelled' || order.status.toLowerCase() === 'failed'
                  ? 'bg-red-100/80 text-red-700 border border-red-200' :
                order.status.toLowerCase() === 'refunded'
                  ? 'bg-blue-100/80 text-blue-700 border border-blue-200' :
                order.status.toLowerCase() === 'on the way'
                  ? 'bg-indigo-100/80 text-indigo-700 border border-indigo-200' :
                order.status.toLowerCase() === 'ready for pickup'
                  ? 'bg-emerald-100/80 text-emerald-700 border border-emerald-200' :
                order.status.toLowerCase() === 'preparing'
                  ? 'bg-orange-100/80 text-orange-700 border border-orange-200' :
                order.status.toLowerCase() === 'confirmed'
                  ? 'bg-blue-100/80 text-blue-700 border border-blue-200' :
                'bg-yellow-100/80 text-yellow-700 border border-yellow-200'
              }`}
            >
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }} 
                transition={{ repeat: Infinity, repeatDelay: 5, duration: 1 }}
                className="w-2 h-2 rounded-full bg-current"
              />
              {statusIcons[order.status.toLowerCase()] || <FaExclamationTriangle size={14} />}
              <span className="capitalize">{order.status}</span>
            </div>
          </div>

          {/* Order items with enhanced styling */}
          {order.items && (
            <div className="mt-4 mb-5 pl-16">
              <div className="text-xs text-gray-500 flex items-center gap-2 mb-2 font-medium uppercase tracking-wide">
                <FaReceipt size={12} />
                <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-2 text-gray-700">
                {order.items.slice(0, 2).map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                    <p className="truncate text-sm">
                      <span className="font-medium">{item.quantity || 1}x</span> {item.size} {item.name}
                    </p>
                  </div>
                ))}
                {order.items.length > 2 && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 italic">
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                    <p>+{order.items.length - 2} more items</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom section with price and actions */}
          <div className="flex flex-wrap justify-between items-center mt-6 pt-4 border-t border-gray-100">
            <div>
              <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
                <FaCalendarAlt size={10} />
                <span>{formatDate(order.date)}</span>
              </div>
              <p className="font-bold text-xl text-gray-800 flex items-baseline">
                <span className="text-sm text-gray-500 mr-1">$</span>
                {order.total.toFixed(2)}
              </p>
            </div>
            
            {/* Action buttons with enhanced styling */}
            <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
              {/* Delete button for final statuses */}
              {['cancelled', 'failed', 'completed', 'refunded'].includes(order.status.toLowerCase()) && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl hover:shadow-md transition-all duration-300 font-medium text-sm flex items-center gap-2 disabled:opacity-70"
                  disabled={isLoading}
                >
                  <FaTrash size={12} />
                  <span>Delete</span>
                </motion.button>
              )}

              {/* Cancel and Update buttons for pending orders */}
              {order.status.toLowerCase() === 'pending' && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowCancelModal(true)}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2 rounded-xl hover:shadow-md transition-all duration-300 font-medium text-sm flex items-center gap-2 disabled:opacity-70"
                    disabled={isLoading}
                  >
                    <FaTimes size={12} />
                    <span>Cancel</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleUpdate}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl hover:shadow-md transition-all duration-300 font-medium text-sm flex items-center gap-2"
                  >
                    <FaEdit size={12} />
                    <span>Update</span>
                  </motion.button>
                </>
              )}

              {/* Return and Complete buttons for delivered orders */}
              {order.status.toLowerCase() === 'delivered' && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onReturn}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2 rounded-xl hover:shadow-md transition-all duration-300 font-medium text-sm flex items-center gap-2"
                  >
                    <FaUndo size={12} />
                    <span>Return</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowCompleteConfirm(true)}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-xl hover:shadow-md transition-all duration-300 font-medium text-sm flex items-center gap-2 disabled:opacity-70"
                    disabled={isLoading}
                  >
                    <FaCheck size={12} />
                    <span>Complete</span>
                  </motion.button>
                </>
              )}

              {/* View Details button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onViewDetails}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2 rounded-xl hover:shadow-md transition-all duration-300 font-medium text-sm flex items-center gap-2"
              >
                <span>View Details</span>
                <motion.div
                  animate={{ x: [0, 3, 0] }}
                  transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.8 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modals remain the same - their content will be styled separately */}
      <AnimatePresence>
        {showDeleteConfirm && <DeleteConfirmationModal />}
        {showCompleteConfirm && <CompleteConfirmationModal />}
        <CancelOrderModal 
          isOpen={showCancelModal}
          orderId={order.id}
          onClose={() => setShowCancelModal(false)}
          onCancelComplete={handleCancellationComplete}
        />
      </AnimatePresence>
    </>
  );
};

export default OrderCard;