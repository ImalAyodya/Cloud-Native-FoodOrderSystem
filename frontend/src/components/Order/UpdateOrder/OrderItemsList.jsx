import React from 'react';
import { FaTrash } from 'react-icons/fa';

const OrderItemsList = ({ items, onRemoveItem, totalAmount }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-bold mb-4">Order Items</h2>
      <ul className="space-y-4">
        {items.map((item, index) => (
          <li key={index} className="flex justify-between items-center">
            <div>
              <p className="font-medium">{item.quantity}x {item.name}</p>
              <p className="text-sm text-gray-500">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
            <button
              onClick={() => onRemoveItem(item.name)}
              className="text-red-500 hover:text-red-700"
            >
              <FaTrash />
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-4 text-right">
        <p className="text-lg font-bold">Total: ${totalAmount.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default OrderItemsList;