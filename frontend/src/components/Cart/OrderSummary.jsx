import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaShoppingCart, FaLock } from 'react-icons/fa';

const OrderSummary = ({ 
  subtotal = 0, 
  deliveryFee = 0, 
  total = 0, 
  handleCheckout, 
  loading = false, 
  itemVariants,
  itemCount = 0 
}) => {
  const [animateTotal, setAnimateTotal] = useState(false);
  
  // Animate total when it changes
  useEffect(() => {
    setAnimateTotal(true);
    const timer = setTimeout(() => setAnimateTotal(false), 500);
    return () => clearTimeout(timer);
  }, [total]);

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-xl shadow-md p-6 h-fit sticky top-28"
      aria-label="Order Summary"
    >
      <h2 className="text-xl font-bold mb-6 pb-4 border-b border-gray-100 flex items-center">
        <FaShoppingCart className="mr-2 text-orange-500" />
        Order Summary
        {itemCount > 0 && (
          <span className="ml-2 bg-orange-100 text-orange-500 text-sm py-1 px-2 rounded-full">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
        )}
      </h2>
      
      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-gray-600">
          <span>Delivery Fee</span>
          <span>${deliveryFee.toFixed(2)}</span>
        </div>
        
        {/* Optional: Add tax row if needed */}
        
        <div className="border-t pt-4 mt-4">
          <motion.div 
            className="flex justify-between font-bold text-lg"
            animate={{ scale: animateTotal ? [1, 1.05, 1] : 1 }}
            transition={{ duration: 0.5 }}
          >
            <span>Total</span>
            <span className="text-orange-500">${total.toFixed(2)}</span>
          </motion.div>
        </div>
      </div>
      
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleCheckout}
        disabled={loading || subtotal <= 0}
        className={`w-full bg-orange-500 text-white py-4 rounded-xl
          font-semibold flex items-center justify-center gap-2 text-lg
          ${(loading || subtotal <= 0) ? 'opacity-70 cursor-not-allowed' : 'hover:bg-orange-600'}
          transition-colors duration-300 shadow-md hover:shadow-lg`}
        aria-busy={loading}
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2" />
            Processing...
          </>
        ) : (
          <>
            <FaLock className="text-sm" />
            {subtotal <= 0 ? 'Cart is Empty' : 'Proceed to Checkout'}
          </>
        )}
      </motion.button>
      
      <p className="text-xs text-center text-gray-500 mt-4">
        Secure checkout · Free returns · 100% satisfaction guarantee
      </p>
    </motion.div>
  );
};

export default React.memo(OrderSummary);