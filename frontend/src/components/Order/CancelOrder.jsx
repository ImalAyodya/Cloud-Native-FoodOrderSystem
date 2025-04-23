import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FaTimes, FaExclamationTriangle, FaArrowLeft, FaCheck } from 'react-icons/fa';

const COMMON_CANCEL_REASONS = [
  "Changed my mind",
  "Ordered by mistake",
  "Delivery time is too long",
  "Found better price elsewhere",
  "Need to modify my order",
  "Payment issues",
  "Ordered wrong items"
];

// Animations
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

const modalVariants = {
  hidden: { scale: 0.95, opacity: 0, y: 10 },
  visible: { scale: 1, opacity: 1, y: 0, 
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 25 
    } 
  },
  exit: { scale: 0.95, opacity: 0, y: 10 }
};

const CancelOrderModal = ({ 
  isOpen, 
  orderId, 
  onClose, 
  onCancel,
  onCancelComplete,
  orderDetails // Optional: could show order info in the modal
}) => {
  const [step, setStep] = useState(1); // 1: confirm, 2: reason
  const [cancelReason, setCancelReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSelectReason = (reason) => {
    setCancelReason(reason);
  };
  
  const handleProceedToReason = () => {
    setStep(2);
  };
  
  const handleGoBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      resetAndClose();
    }
  };
  
  const resetAndClose = () => {
    setCancelReason('');
    setOtherReason('');
    setStep(1);
    onClose();
  };
  
  const handleCancelOrder = async () => {
    // Get the final reason (either selected or custom)
    const finalReason = cancelReason === 'Other' 
      ? otherReason.trim() 
      : cancelReason;
      
    if (!finalReason) {
      toast.error('Please provide a reason for cancellation');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`http://localhost:5001/api/orders/cancel/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          reason: finalReason,
          cancelledBy: 'customer',
          additionalInfo: cancelReason === 'Other' ? 'Custom reason provided' : 'Selected from common reasons'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel order');
      }

      const data = await response.json();
      
      // Notify parent component of successful cancellation
      onCancelComplete && onCancelComplete(orderId);
      
      // Show success message
      toast.success('Order cancelled successfully');
      
      // Close and reset the modal
      resetAndClose();
      
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error(error.message || 'Failed to cancel order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // If modal is not open, don't render anything
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={backdropVariants}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 backdrop-blur-md bg-black/50"
            onClick={() => !isLoading && handleGoBack()}
          />
          
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
            className="relative z-10 w-11/12 max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header - Common for both steps */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {step === 2 && (
                    <button 
                      onClick={handleGoBack}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                      disabled={isLoading}
                    >
                      <FaArrowLeft size={16} />
                    </button>
                  )}
                  
                  <h3 className="text-lg font-bold text-gray-800">
                    {step === 1 ? 'Cancel Order' : 'Cancellation Reason'}
                  </h3>
                </div>
                
                <button 
                  onClick={resetAndClose}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                  disabled={isLoading}
                >
                  <FaTimes size={16} />
                </button>
              </div>
              
              {/* Optional: Order information if provided */}
              {orderDetails && (
                <div className="mt-2 pt-2 border-t border-gray-200 text-sm text-gray-500">
                  Order #{orderId}
                </div>
              )}
            </div>
            
            {/* Step 1: Confirmation */}
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-6"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-red-100 p-3 rounded-full shrink-0">
                      <FaExclamationTriangle className="text-red-500" size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Are you sure you want to cancel this order?</h4>
                      <p className="text-gray-600 text-sm">
                        This action cannot be undone. Once cancelled, your order will be permanently removed from processing.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={resetAndClose}
                      className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors"
                      disabled={isLoading}
                    >
                      No, Keep Order
                    </button>
                    <button
                      onClick={handleProceedToReason}
                      className="px-5 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-sm flex items-center gap-2"
                      disabled={isLoading}
                    >
                      <FaTimes size={14} />
                      <span>Yes, Cancel Order</span>
                    </button>
                  </div>
                </motion.div>
              )}
              
              {/* Step 2: Reason Selection */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-6"
                >
                  <div className="mb-4">
                    <p className="text-gray-600 text-sm mb-4">
                      Please select or provide a reason for cancelling your order:
                    </p>
                    
                    {/* Reason selection grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                      {COMMON_CANCEL_REASONS.map((reason) => (
                        <motion.button
                          key={reason}
                          onClick={() => handleSelectReason(reason)}
                          className={`text-left px-4 py-3 rounded-lg text-sm transition-all flex items-center gap-2 ${
                            cancelReason === reason
                              ? 'bg-red-50 border-red-300 border text-red-800 font-medium shadow-sm'
                              : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-transparent'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {cancelReason === reason && (
                            <FaCheck size={14} className="text-red-500" />
                          )}
                          <span>{reason}</span>
                        </motion.button>
                      ))}
                    </div>
                    
                    {/* Other reason option */}
                    <motion.button
                      onClick={() => handleSelectReason('Other')}
                      className={`text-left px-4 py-3 rounded-lg text-sm transition-all w-full flex items-center gap-2 ${
                        cancelReason === 'Other'
                          ? 'bg-red-50 border-red-300 border text-red-800 font-medium shadow-sm'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-transparent'
                      }`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      {cancelReason === 'Other' && (
                        <FaCheck size={14} className="text-red-500" />
                      )}
                      <span>Other reason</span>
                    </motion.button>
                  </div>
                  
                  {/* Custom reason textarea */}
                  <AnimatePresence>
                    {cancelReason === 'Other' && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mb-6 overflow-hidden"
                      >
                        <div className="relative">
                          <textarea
                            value={otherReason}
                            onChange={(e) => setOtherReason(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            placeholder="Please specify your reason..."
                            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 h-24 resize-none shadow-sm"
                            disabled={isLoading}
                          />
                          {otherReason.length > 0 && (
                            <span className="absolute bottom-2 right-3 text-xs text-gray-500">
                              {otherReason.length}/200 characters
                            </span>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Buttons */}
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={handleGoBack}
                      className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors"
                      disabled={isLoading}
                    >
                      Back
                    </button>
                    <motion.button
                      onClick={handleCancelOrder}
                      className="px-5 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                      disabled={
                        isLoading || 
                        !cancelReason || 
                        (cancelReason === 'Other' && !otherReason.trim())
                      }
                      whileHover={{ scale: !isLoading && cancelReason && (cancelReason !== 'Other' || otherReason.trim()) ? 1.03 : 1 }}
                      whileTap={{ scale: !isLoading && cancelReason && (cancelReason !== 'Other' || otherReason.trim()) ? 0.97 : 1 }}
                    >
                      {isLoading ? (
                        <>
                          <motion.span 
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                          />
                          <span>Cancelling...</span>
                        </>
                      ) : (
                        <>
                          <FaTimes size={14} />
                          <span>Confirm Cancellation</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CancelOrderModal;