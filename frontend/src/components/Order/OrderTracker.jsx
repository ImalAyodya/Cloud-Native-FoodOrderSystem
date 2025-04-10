import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaClipboardList, 
  FaCheck, 
  FaUtensils, 
  FaBiking, 
  FaBoxOpen,
  FaTimes
} from 'react-icons/fa';

const OrderTracker = ({ currentStatus, statusTimestamps = {} }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const orderStatuses = [
    { id: 'Pending', label: 'Order Placed', icon: FaClipboardList },
    { id: 'Confirmed', label: 'Confirmed', icon: FaCheck },
    { id: 'Preparing', label: 'Preparing', icon: FaUtensils },
    { id: 'On the way', label: 'On the Way', icon: FaBiking },
    { id: 'Delivered', label: 'Delivered', icon: FaBoxOpen }
  ];

  const getStatusIndex = (status) => {
    if (status === 'Cancelled' || status === 'Failed') return -1;
    return orderStatuses.findIndex(s => s.id === status);
  };

  const currentIndex = getStatusIndex(currentStatus);

  return (
    <div className="w-full py-12"> {/* Increased padding for timestamp space */}
      {currentStatus === 'Cancelled' || currentStatus === 'Failed' ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-red-500"
        >
          <FaTimes className="text-4xl mb-2" />
          <p className="text-lg font-semibold">Order {currentStatus}</p>
          {statusTimestamps[currentStatus] && (
            <p className="text-sm text-gray-500 mt-2">
              {formatTime(statusTimestamps[currentStatus])}
            </p>
          )}
        </motion.div>
      ) : (
        <>
          <div className="flex justify-between items-center relative mb-4">
            {/* Progress Line */}
            <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-200 -z-10" />
            <motion.div
              className="absolute left-0 top-1/2 h-1 bg-orange-500 -z-10"
              initial={{ width: '0%' }}
              animate={{ 
                width: currentIndex >= 0 
                  ? `${(currentIndex / (orderStatuses.length - 1)) * 100}%` 
                  : '0%' 
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />

            {/* Status Icons with Timestamps */}
            {orderStatuses.map((status, index) => {
              const isCompleted = index <= currentIndex;
              const Icon = status.icon;
              const timestamp = statusTimestamps[status.id];

              return (
                <motion.div
                  key={status.id}
                  className="flex flex-col items-center relative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <motion.div
                    className={`w-12 h-12 rounded-full flex items-center justify-center 
                      ${isCompleted ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-400'}
                      transition-colors duration-300`}
                    whileHover={{ scale: 1.1 }}
                  >
                    <Icon className="text-xl" />
                  </motion.div>
                  <div className="flex flex-col items-center">
                    <motion.p
                      className={`mt-2 text-sm font-medium w-24 text-center
                        ${isCompleted ? 'text-orange-500' : 'text-gray-400'}`}
                    >
                      {status.label}
                    </motion.p>
                    {timestamp && (
                      <motion.p
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-gray-500 mt-1"
                      >
                        {formatTime(timestamp)}
                      </motion.p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default OrderTracker;