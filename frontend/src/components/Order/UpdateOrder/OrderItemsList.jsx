import React from 'react';
import { FaTrash, FaCheck, FaShoppingBag } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const OrderItemsList = ({ items, onRemoveItem, totalAmount, disableRemoveForOriginalItems }) => {
  // Animation variants
  const listVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
    exit: { 
      opacity: 0, 
      x: -20,
      transition: { duration: 0.2 }
    }
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.1, transition: { duration: 0.2 } },
    tap: { scale: 0.9, transition: { duration: 0.1 } }
  };

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center py-8 px-4"
        >
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <FaShoppingBag className="text-gray-400" size={24} />
          </div>
          <p className="text-gray-500 font-medium">No items in this order yet.</p>
          <p className="text-gray-400 text-sm mt-2">Add some items to get started</p>
        </motion.div>
      ) : (
        <motion.div 
          variants={listVariants}
          initial="hidden"
          animate="visible"
          className="rounded-xl border border-gray-200 overflow-hidden shadow-sm"
        >
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 px-4 py-3 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-700">Order Items</h3>
              <span className="text-sm text-gray-500">{items.length} item{items.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          <div className="divide-y divide-gray-100 px-4">
            <AnimatePresence>
              {items.map((item, index) => {
                const isOriginalItem = disableRemoveForOriginalItems && index < items.length - (items.length - index);
                
                return (
                  <motion.div 
                    key={`${item.name}-${index}`}
                    variants={itemVariants}
                    exit="exit"
                    layout
                    className="flex justify-between items-center py-4"
                  >
                    <div className="flex items-center">
                      <div className="bg-orange-100 text-orange-600 rounded-full h-9 w-9 flex items-center justify-center mr-3 font-medium shadow-sm">
                        {item.quantity}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <div className="flex items-center mt-1">
                          <span className="text-sm text-gray-500 mr-2">{item.size}</span>
                          {isOriginalItem && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                              <FaCheck className="mr-1" size={10} />
                              Original
                            </span>
                          )}
                          {!isOriginalItem && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              Added
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="font-medium text-gray-800 mr-6">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                      <motion.button
                        variants={buttonVariants}
                        initial="initial"
                        whileHover={!isOriginalItem ? "hover" : "initial"}
                        whileTap={!isOriginalItem ? "tap" : "initial"}
                        onClick={() => onRemoveItem(item.name)}
                        className={`p-2 rounded-full transition ${
                          isOriginalItem 
                            ? 'text-gray-300 cursor-not-allowed' 
                            : 'text-red-500 hover:bg-red-50 hover:text-red-600'
                        }`}
                        disabled={isOriginalItem}
                        title={isOriginalItem ? "Can't remove original items" : "Remove item"}
                      >
                        <FaTrash size={16} />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
      
      {items.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="border rounded-xl border-gray-200 p-4 mt-4 bg-white shadow-sm"
        >
          <div className="flex justify-between items-center pb-3">
            <span className="text-gray-700">Subtotal</span>
            <span className="font-medium">${totalAmount.toFixed(2)}</span>
          </div>
          
        
        </motion.div>
      )}
    </div>
  );
};

export default OrderItemsList;