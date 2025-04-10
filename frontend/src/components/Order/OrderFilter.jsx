import React from 'react';
import { motion } from 'framer-motion';

const OrderFilter = ({ selectedFilter, onFilterChange }) => {
  const filters = [
    { id: 'all', label: 'All Orders' },
    { id: 'pending', label: 'Pending' },
    { id: 'processing', label: 'Processing' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancelled' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-4 overflow-x-auto pb-4"
    >
      {filters.map(filter => (
        <motion.button
          key={filter.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onFilterChange(filter.id)}
          className={`px-6 py-2 rounded-full font-medium transition-colors duration-300 ${
            selectedFilter === filter.id
              ? 'bg-orange-500 text-white'
              : 'bg-white text-gray-600 hover:bg-orange-50'
          }`}
        >
          {filter.label}
        </motion.button>
      ))}
    </motion.div>
  );
};

export default OrderFilter;