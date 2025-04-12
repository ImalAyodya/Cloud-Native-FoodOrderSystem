import React from 'react';
import { motion } from 'framer-motion';

const AddItemsModal = ({ foods, onAddItem, onClose, restaurantName }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-white rounded-lg p-6 max-w-lg w-full shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Add Items</h2>
          <p className="text-sm text-gray-500">
            Restaurant: <span className="font-medium">{restaurantName || 'Unknown'}</span>
          </p>
        </div>

        {/* Food Items List */}
        <ul className="space-y-4">
          {foods.map((food, index) => (
            <li
              key={index}
              className="flex justify-between items-center bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                {/* Food Image */}
                <img
                  src={food.image || 'https://via.placeholder.com/50'}
                  alt={food.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <p className="font-medium text-gray-800">{food.name}</p>
                  <p className="text-sm text-gray-500">${food.price.toFixed(2)}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (food && food.price && food.name) {
                    onAddItem(food);
                  } else {
                    console.error('Invalid food item:', food);
                  }
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300"
              >
                Add
              </button>
            </li>
          ))}
        </ul>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-6 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-300 w-full"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
};

export default AddItemsModal;