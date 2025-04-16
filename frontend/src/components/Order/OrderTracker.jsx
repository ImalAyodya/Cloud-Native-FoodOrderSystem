import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaClipboardList, 
  FaCheck, 
  FaUtensils, 
  FaBiking, 
  FaBoxOpen,
  FaTimes,
  FaExclamationTriangle,
  FaUndo
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
    { id: 'Pending', label: 'Order Placed', icon: FaClipboardList, color: 'bg-blue-500' },
    { id: 'Confirmed', label: 'Confirmed', icon: FaCheck, color: 'bg-purple-500' },
    { id: 'Preparing', label: 'Preparing', icon: FaUtensils, color: 'bg-orange-500' },
    { id: 'On the way', label: 'On the Way', icon: FaBiking, color: 'bg-indigo-500' },
    { id: 'Delivered', label: 'Delivered', icon: FaBoxOpen, color: 'bg-green-500' }
  ];

  const specialStatuses = {
    'Cancelled': { icon: FaTimes, color: 'bg-red-500', textColor: 'text-red-500' },
    'Failed': { icon: FaExclamationTriangle, color: 'bg-red-500', textColor: 'text-red-500' },
    'Refunded': { icon: FaUndo, color: 'bg-blue-500', textColor: 'text-blue-500' },
    'Completed': { icon: FaCheck, color: 'bg-green-500', textColor: 'text-green-500' }
  };

  const getStatusIndex = (status) => {
    if (specialStatuses[status]) return -1;
    return orderStatuses.findIndex(s => s.id === status);
  };

  const currentIndex = getStatusIndex(currentStatus);
  const isSpecialStatus = specialStatuses[currentStatus];

  // Calculate progress for animation
  const progress = currentIndex >= 0 
    ? (currentIndex / (orderStatuses.length - 1)) * 100
    : (currentStatus === 'Delivered' || currentStatus === 'Completed') ? 100 : 0;

  return (
    <div className="w-full py-8">
      {isSpecialStatus ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${specialStatuses[currentStatus].color} text-white shadow-lg mb-4`}>
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20
              }}
            >
              {React.createElement(specialStatuses[currentStatus].icon, { size: 28 })}
            </motion.div>
          </div>
          <p className={`text-lg font-bold ${specialStatuses[currentStatus].textColor}`}>
            Order {currentStatus}
          </p>
          {statusTimestamps[currentStatus] && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-gray-500 mt-2"
            >
              {formatTime(statusTimestamps[currentStatus])}
            </motion.p>
          )}
        </motion.div>
      ) : (
        <div className="relative">
          {/* Progress Line Container */}
          <div className="absolute left-0 top-12 w-full h-2 bg-gray-100 rounded-full -z-10" />
          
          {/* Animated Progress Line */}
          <motion.div
            className="absolute left-0 top-12 h-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full -z-10"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />

          {/* Status Markers */}
          <div className="flex justify-between items-start">
            {orderStatuses.map((status, index) => {
              const isCompleted = index <= currentIndex;
              const isCurrent = index === currentIndex;
              const Icon = status.icon;
              const timestamp = statusTimestamps[status.id];
              
              return (
                <motion.div
                  key={status.id}
                  className="flex flex-col items-center relative"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15 }}
                >
                  {/* Circle with Icon */}
                  <motion.div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md
                      ${isCompleted ? status.color || 'bg-orange-500' : 'bg-white border-2 border-gray-200'}
                      ${isCurrent ? 'ring-4 ring-orange-200' : ''}
                      transition-all duration-300`}
                    whileHover={{ scale: 1.1 }}
                    initial={{ scale: 0.8 }}
                    animate={{ 
                      scale: isCurrent ? 1.1 : 1,
                      rotate: isCompleted ? [0, 10, -10, 0] : 0
                    }}
                    transition={isCompleted ? { duration: 0.5, delay: index * 0.15 } : {}}
                  >
                    <Icon className={`text-lg ${isCompleted ? 'text-white' : 'text-gray-400'}`} />
                  </motion.div>
                  
                  {/* Status Label */}
                  <div className="flex flex-col items-center mt-4">
                    <motion.p
                      className={`text-sm font-semibold w-24 text-center
                        ${isCompleted ? 'text-gray-800' : 'text-gray-400'}
                        ${isCurrent ? 'text-orange-500 font-bold' : ''}`}
                    >
                      {status.label}
                    </motion.p>
                    
                    {/* Timestamp */}
                    {timestamp && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className={`text-xs mt-1 ${isCurrent ? 'text-orange-500' : 'text-gray-500'}`}
                      >
                        {formatTime(timestamp)}
                      </motion.p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracker;