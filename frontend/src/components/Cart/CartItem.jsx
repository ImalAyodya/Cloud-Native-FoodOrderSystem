// components/Cart/CartItem.js
import React from 'react';
import { motion } from 'framer-motion';
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';

const CartItem = ({ item, updateQuantity, removeItem, itemVariants }) => {
  return (
    <motion.div
      variants={itemVariants}
      className="bg-white rounded-xl shadow-md p-6 flex items-center gap-4 hover:shadow-lg transition-shadow duration-300"
    >
      <img
        src={item.image}
        alt={item.name}
        className="w-24 h-24 object-cover rounded-lg"
      />
      <div className="flex-1">
        <h3 className="font-semibold text-lg text-gray-800">{item.name}</h3>
        <p className="text-orange-500 font-bold text-xl">
          ${item.price.toFixed(2)}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => updateQuantity(item.id, -1)}
          className="p-2 text-gray-600 hover:text-orange-500 transition-colors"
        >
          <FaMinus />
        </motion.button>
        <span className="w-8 text-center font-medium">{item.quantity}</span>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => updateQuantity(item.id, 1)}
          className="p-2 text-gray-600 hover:text-orange-500 transition-colors"
        >
          <FaPlus />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => removeItem(item.id)}
          className="p-2 text-red-500 hover:text-red-600 transition-colors ml-2"
        >
          <FaTrash />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default CartItem;
