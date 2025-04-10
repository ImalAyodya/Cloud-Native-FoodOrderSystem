import React from 'react';
import { motion } from 'framer-motion';
import { FaStore, FaMotorcycle, FaClock, FaCheck, FaTimes } from 'react-icons/fa';

const OrderCard = ({ order, onViewDetails }) => {
  const statusIcons = {
    pending: <FaClock className="text-yellow-500" />,
    processing: <FaMotorcycle className="text-blue-500" />,
    delivered: <FaCheck className="text-green-500" />,
    cancelled: <FaTimes className="text-red-500" />
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FaStore className="text-orange-500" />
            <h3 className="font-semibold text-lg">{order.restaurant}</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">Order ID: {order.id}</p>
        </div>
        <div className="flex items-center gap-2">
          {statusIcons[order.status]}
          <span className="capitalize text-sm font-medium">
            {order.status}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-end mt-4">
        <div>
          <p className="text-gray-600 text-sm">
            {new Date(order.date).toLocaleDateString()}
          </p>
          <p className="font-bold text-lg">
            ${order.total.toFixed(2)}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onViewDetails}
          className="bg-orange-500 text-white px-6 py-2 rounded-lg
            hover:bg-orange-600 transition-colors duration-300"
        >
          View Details
        </motion.button>
      </div>
    </motion.div>
  );
};

export default OrderCard;