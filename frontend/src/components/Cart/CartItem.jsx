import React from 'react';
import { motion } from 'framer-motion';
import { FaTrashAlt } from 'react-icons/fa';

const CartItem = ({ item, updateQuantity, removeItem, itemVariants }) => {
  if (!item) return null; // Ensure item exists before rendering

  const { name, image, size, price, quantity } = item;

  return (
    <motion.div
      variants={itemVariants}
      className="flex items-center border rounded-lg p-4 shadow-sm bg-white"
    >
      <img
        src={image}
        alt={name}
        className="w-16 h-16 object-cover rounded mr-4"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'https://via.placeholder.com/150?text=Food';
        }}
      />
      <div className="flex-grow">
        <h4 className="font-medium text-lg">{name}</h4>
        <p className="text-sm text-gray-600">Size: {size}</p>
        <p className="text-sm text-gray-600">Quantity: {quantity}</p>
      </div>
      <div className="text-right font-semibold">
        ${price * quantity}
      </div>
      <div className="ml-4 flex items-center">
        <button
          className="px-2 py-1 bg-orange-500 text-white rounded-l hover:bg-orange-600"
          onClick={() => updateQuantity(item.foodId, -1)}
        >
          -
        </button>
        <span className="px-3 py-1 border-t border-b">{quantity}</span>
        <button
          className="px-2 py-1 bg-orange-500 text-white rounded-r hover:bg-orange-600"
          onClick={() => updateQuantity(item.foodId, 1)}
        >
          +
        </button>
        <button
          onClick={() => removeItem(item.foodId)}
          className="ml-2 text-red-500 hover:text-red-600"
        >
          <FaTrashAlt />
        </button>
      </div>
    </motion.div>
  );
};

export default CartItem;