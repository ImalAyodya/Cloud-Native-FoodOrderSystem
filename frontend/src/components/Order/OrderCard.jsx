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
      const response = await fetch(`http://localhost:5001/api/orders/${order.id}`, {
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
        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300"
      >
        <div className={`w-full h-1 ${getStatusColor(order.status).split(' ')[0].replace('bg-', 'bg-')}`}></div>

        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <FaStore className="text-orange-500" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{order.restaurant}</h3>
                <p className="text-gray-500 text-sm">Order #{order.id.slice(-6)}</p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${getStatusColor(order.status)}`}>
              {statusIcons[order.status.toLowerCase()] || <FaExclamationTriangle size={16} />}
              <span className="capitalize">{order.status}</span>
            </div>
          </div>

          {order.items && (
            <div className="mt-4 mb-4">
              <div className="text-sm text-gray-500 flex items-center gap-2 mb-2">
                <FaReceipt size={14} />
                <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-1 text-gray-700">
                {order.items.slice(0, 2).map((item, index) => (
                  <p key={index} className="truncate text-sm">
                    {item.quantity || 1}x {item.size} {item.name}
                  </p>
                ))}
                {order.items.length > 2 && (
                  <p className="text-sm text-gray-500">+{order.items.length - 2} more</p>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between items-end mt-6">
            <div>
              <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-1">
                <FaClock size={12} />
                <span>{formatDate(order.date)} · {formatTime(order.date)}</span>
              </div>
              <p className="font-bold text-xl">${order.total.toFixed(2)}</p>
            </div>
            <div className="flex gap-2">
              {['cancelled', 'failed', 'completed', 'refunded'].includes(order.status.toLowerCase()) && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-300 font-medium text-sm shadow-sm"
                  disabled={isLoading}
                >
                  Delete
                </motion.button>
              )}

              {order.status.toLowerCase() === 'pending' && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowCancelModal(true)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-300 font-medium text-sm shadow-sm"
                    disabled={isLoading}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleUpdate}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300 font-medium text-sm shadow-sm"
                  >
                    Update
                  </motion.button>
                </>
              )}

              {order.status.toLowerCase() === 'delivered' && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onReturn}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-300 font-medium text-sm shadow-sm"
                  >
                    Return
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowCompleteConfirm(true)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-300 font-medium text-sm shadow-sm"
                    disabled={isLoading}
                  >
                    Complete
                  </motion.button>
                </>
              )}

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onViewDetails}
                className="bg-orange-500 text-white px-5 py-2 rounded-lg hover:bg-orange-600 transition-colors duration-300 font-medium text-sm shadow-sm"
              >
                View Details
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

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