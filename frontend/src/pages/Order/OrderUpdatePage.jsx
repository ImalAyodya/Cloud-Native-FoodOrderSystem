import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import OrderItemsList from '../../components/Order/UpdateOrder/OrderItemsList';
import AddItemsModal from '../../components/Order/UpdateOrder/AddItemsModal';
import PaymentSection from '../../components/Order/UpdateOrder/PaymentSection';
import CancelOrderModal from '../../components/Order/CancelOrder';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js'; 
import StripeContainer from '../../components/Payment/StripeContainer';
import axios from 'axios';

const OrderUpdatePage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [originalItems, setOriginalItems] = useState([]);
  const [newlyAddedItems, setNewlyAddedItems] = useState([]);
  const [removedOriginalItems, setRemovedOriginalItems] = useState([]);
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantId, setRestaurantId] = useState('');
  const [showAddItemsModal, setShowAddItemsModal] = useState(false);
  const [showCancelReasonModal, setShowCancelReasonModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showStripePayment, setShowStripePayment] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);

  // Create a persistent reference to track original item IDs
  const originalItemIds = React.useMemo(() => {
    return originalItems.map(item => ({
      id: item._id,
      size: item.size,
      key: `${item._id}-${item.size}`
    }));
  }, [originalItems]);

  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:5001/api/orders/orders/${orderId}`);
        const data = await response.json();
        setOrder(data.order);
        setOriginalItems(data.order.items);
        
        // Store restaurant ID from the order
        const restaurantId = data.order.restaurant;
        setRestaurantId(restaurantId);
        
        // Set restaurant name from order data if available
        if (data.order.restaurantName) {
          setRestaurantName(data.order.restaurantName);
        }
      } catch (error) {
        toast.error('Failed to load order details', {
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        console.error('Error fetching order details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const calculateTotal = (items) =>
    items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const mergedItems = [
    // First include all original items unchanged
    ...originalItems,
    
    // Then add all newly added items separately without merging with original items
    ...newlyAddedItems
  ];

  const handleAddItem = (item) => {
    setNewlyAddedItems((prev) => {
      // Create a unique identifier for the item
      const itemKey = `${item._id}-${item.size}`;
      
      // Find existing item in newly added items only
      const existingItemIndex = prev.findIndex(
        (i) => `${i._id}-${i.size}` === itemKey
      );
      
      if (existingItemIndex !== -1) {
        // Update quantity if item exists
        return prev.map((i, index) =>
          index === existingItemIndex
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        // Add new item with quantity 1
        return [...prev, { ...item, quantity: 1 }];
      }
    });
    
    // Do NOT call toast.success here - let the AddItemsModal handle the notification
    // This prevents duplicate notifications
  };

  const handleRemoveItem = (itemId) => {
    // Check if the item is in the original items
    const isOriginalItem = originalItemIds.some(item => item.key === itemId);
    
    if (isOriginalItem) {
      // Check payment method to determine if original items can be removed
      if (order.paymentMethod === 'Cash on delivery') {
        // Find the item in original items
        const itemToRemove = originalItems.find(item => `${item._id}-${item.size}` === itemId);
        
        if (itemToRemove) {
          // Add to removed original items
          setRemovedOriginalItems(prev => [...prev, itemToRemove]);
          
          // Remove from displayed original items
          setOriginalItems(prev => prev.filter(item => `${item._id}-${item.size}` !== itemId));
          
          toast.info('Original item removed from order', {
            autoClose: 3000,
            closeOnClick: true,
          });
        }
      } else {
        // For non-cash payment methods, don't allow removing original items
        toast.warning('You cannot remove original items when paying with ' + order.paymentMethod, {
          autoClose: 3000,
          closeOnClick: true,
        });
        return;
      }
    } else {
      // For newly added items, always allow removal regardless of payment method
      setNewlyAddedItems((prev) => prev.filter((item) => {
        const newItemId = item._id ? `${item._id}-${item.size}` : item.name;
        return newItemId !== itemId;
      }));
      
      toast.info('Item removed from the order', {
        autoClose: 3000,
        closeOnClick: true,
      });
    }
  };

  const allItemsRemoved = () => {
    return originalItems.length === 0 && newlyAddedItems.length === 0;
  };

  const handleCancelUpdate = () => {
    // Navigate back to the previous page or order details page
    navigate(`/myOrders`);
    toast.info('Order update canceled.', {
      autoClose: 3000,
      closeOnClick: true,
    });
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Make API call to cancel the order
      const response = await fetch(`http://localhost:5001/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cancellationReason: cancelReason,
          cancelledBy: 'customer'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel order');
      }
      
      toast.success('Order cancelled successfully!', {
        autoClose: 3000,
        closeOnClick: true
      });
      
      // Navigate back to orders page after short delay
      setTimeout(() => navigate('/myOrders'), 2000);
      
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error(`Cancellation failed: ${error.message}`, {
        autoClose: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancellationComplete = () => {
    // Navigate back to orders page
    navigate('/myOrders');
  };

  // Function to handle payment success
  const handlePaymentSuccess = (paymentIntent) => {
    toast.success('Payment successful!');
    processOrderUpdate(paymentIntent.id);
  };

  // Function to handle payment error
  const handlePaymentError = (errorMessage) => {
    toast.error(`Payment failed: ${errorMessage}`);
    setPaymentProcessing(false);
  };

  // Modified update order function to check for payment method
  const handleUpdateOrder = async () => {
    // Don't update if no changes have been made
    if (newlyAddedItems.length === 0 && removedOriginalItems.length === 0) {
      toast.info('No changes made to the order');
      return;
    }
    
    // If payment method is Credit Card and we have new items, show Stripe payment
    if (order.paymentMethod === 'Credit Card' && newlyAddedItems.length > 0) {
      const newItemsTotal = calculateTotal(newlyAddedItems);
      setPaymentAmount(newItemsTotal);
      setShowStripePayment(true);
      return;
    }
    
    // For Cash on Delivery or no new items, proceed with update directly
    await processOrderUpdate();
  };

  // Process the order update (with or without payment)
  const processOrderUpdate = async (paymentId = null) => {
    setIsLoading(true);
    
    try {
      // Prepare updated items data
      const updatedItems = [
        ...originalItems, 
        ...newlyAddedItems
      ];
      
      // Calculate new total amount
      const newTotalAmount = calculateTotal(updatedItems);
      
      // Make API call to update order
      const response = await fetch(`http://localhost:5001/api/orders/${orderId}/items`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          items: updatedItems,
          totalAmount: newTotalAmount,
          paymentTransactionId: paymentId || undefined
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update order');
      }
      
      toast.success('Order updated successfully!');
      setTimeout(() => navigate('/myOrders'), 2000);
      
    } catch (error) {
      toast.error(`Update failed: ${error.message}`);
    } finally {
      setIsLoading(false);
      setShowStripePayment(false);
    }
  };

  const CancelReasonModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 px-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg p-6 max-w-md w-full"
      >
        <h3 className="text-xl font-bold mb-4">Cancel Order</h3>
        <p className="text-gray-600 mb-4">
          Please provide a reason for cancelling this order:
        </p>
        <textarea
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-3 h-32 resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="Enter your reason for cancellation..."
        ></textarea>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => setShowCancelReasonModal(false)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
          <button
            onClick={handleCancelOrder}
            disabled={!cancelReason.trim() || isLoading}
            className={`px-4 py-2 rounded-lg text-white ${
              !cancelReason.trim() || isLoading
                ? "bg-red-400"
                : "bg-red-600 hover:bg-red-700"
            } flex items-center`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Cancelling...
              </>
            ) : (
              "Confirm Cancellation"
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-lg shadow-lg bg-white"
        >
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
          <p className="text-gray-600 mt-4 text-center">Loading order details...</p>
        </motion.div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-6 rounded-lg shadow-lg bg-white"
        >
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-bold text-gray-800 mt-4">Order Not Found</h2>
            <p className="text-gray-600 mt-2">We couldn't find the order details you're looking for.</p>
            <button 
              onClick={() => navigate('/myOrders')}
              className="mt-6 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition shadow-md"
            >
              Back to My Orders
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false} 
        newestOnTop 
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <motion.div 
        className="w-full" 
        initial="hidden"
        animate="visible"
        variants={staggerChildren}
      >
        {/* Breadcrumb Nav */}
        <motion.nav 
          variants={fadeInUpVariants}
          className="py-4 px-4 bg-white border-b border-gray-200"
        >
          <div className="max-w-7xl mx-auto">
            <ol className="list-none p-0 flex text-gray-500">
              <li className="flex items-center">
                <button onClick={() => navigate('/myOrders')} className="hover:text-orange-500 transition font-medium">My Orders</button>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </li>
              <li className="text-orange-500 font-medium">Update Order #{orderId}</li>
            </ol>
          </div>
        </motion.nav>
        
        {/* Page Header */}
        <motion.div 
          variants={fadeInUpVariants}
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-8"
        >
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Update Order</h1>
                <p className="mt-1 text-orange-100">{restaurantName || 'Restaurant'} • Order #{orderId}</p>
              </div>
              <div>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-white text-orange-600 shadow-md">
                  {order.status}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
        
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div 
              variants={fadeInUpVariants}
              className="lg:col-span-2"
            >
              {/* Order Items Section */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center bg-gray-50">
                  <h2 className="text-xl font-semibold text-gray-800">Current Order Items</h2>
                  <motion.span 
                    className="text-sm font-medium px-3 py-1 bg-orange-100 text-orange-800 rounded-full"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    {mergedItems.length} items
                  </motion.span>
                </div>
                <motion.div 
                  className="p-6"
                  variants={staggerChildren}
                >
                  <OrderItemsList
                    items={mergedItems}
                    onRemoveItem={handleRemoveItem}
                    totalAmount={calculateTotal(mergedItems)}
                    originalItemIds={originalItemIds}
                    paymentMethod={order.paymentMethod} // Pass the payment method
                  />
                  
                  <motion.button
                    onClick={() => setShowAddItemsModal(true)}
                    className="w-full mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center shadow-md"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add More Items
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
            
            <motion.div 
              variants={fadeInUpVariants}
              className="lg:col-span-1"
            >
              {/* Order Summary Panel */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6 sticky top-6">
                <div className="border-b border-gray-100 px-6 py-4 bg-gray-50">
                  <h2 className="text-xl font-semibold text-gray-800">Order Summary</h2>
                </div>
                
                {/* New Items Summary Section */}
                <div className="p-6 space-y-5">
                  <motion.div 
                    className="bg-orange-50 rounded-lg p-4 border border-orange-100"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className="text-lg font-medium text-orange-800 mb-2">Newly Added Items</h3>
                    <AnimatePresence>
                      {newlyAddedItems.length > 0 ? (
                        <motion.div className="space-y-2">
                          {newlyAddedItems.map((item, idx) => (
                            <motion.div 
                              key={idx} 
                              className="flex justify-between items-center text-sm"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <span className="text-gray-700">{item.name} ({item.size}) x{item.quantity}</span>
                              <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                            </motion.div>
                          ))}
                        </motion.div>
                      ) : (
                        <motion.p 
                          className="text-gray-500 text-sm"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          No new items added yet
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  
                  <motion.div 
                    className="border-t border-gray-100 pt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Original Total:</span>
                      <span className="text-lg font-semibold">${calculateTotal(originalItems).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-600 font-medium">Additional Amount:</span>
                      <motion.span 
                        className="text-lg font-semibold text-blue-600"
                        key={calculateTotal(newlyAddedItems)}
                        initial={{ scale: 1 }}
                        animate={{ 
                          scale: [1, 1.1, 1],
                          transition: { duration: 0.3 }
                        }}
                      >
                        ${calculateTotal(newlyAddedItems).toFixed(2)}
                      </motion.span>
                    </div>
                    <div className="flex justify-between items-center mt-4 border-t border-gray-100 pt-4">
                      <span className="text-gray-800 font-semibold">New Total:</span>
                      <motion.span 
                        className="text-xl font-bold text-orange-600"
                        key={calculateTotal(mergedItems)}
                        initial={{ scale: 1 }}
                        animate={{ 
                          scale: [1, 1.1, 1],
                          transition: { duration: 0.3 }
                        }}
                      >
                        ${calculateTotal(mergedItems).toFixed(2)}
                      </motion.span>
                    </div>
                  </motion.div>
                  
                  {/* Payment Section */}
                  <motion.div 
                    className="border-t border-gray-100 pt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Payment Method</h3>
                    <PaymentSection
                      paymentMethod={order.paymentMethod}
                      totalAmount={calculateTotal(newlyAddedItems)}
                      onUpdateOrder={handleUpdateOrder}
                    />
                  </motion.div>
                  
                  {/* Action Buttons */}
                  <motion.div 
                    className="border-t border-gray-100 pt-4 space-y-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {allItemsRemoved() ? (
                      <motion.button
                        onClick={() => setShowCancelModal(true)}
                        className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition flex items-center justify-center shadow-md"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        Cancel Order
                      </motion.button>
                    ) : (
                      <motion.button
                        onClick={handleUpdateOrder}
                        className="w-full bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition flex items-center justify-center shadow-md"
                        disabled={newlyAddedItems.length === 0 && removedOriginalItems.length === 0 || isLoading}
                        whileHover={{ scale: !isLoading && (newlyAddedItems.length > 0 || removedOriginalItems.length > 0) ? 1.02 : 1 }}
                        whileTap={{ scale: !isLoading && (newlyAddedItems.length > 0 || removedOriginalItems.length > 0) ? 0.98 : 1 }}
                      >
                        {isLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Updating...
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 101.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Update Order
                          </>
                        )}
                      </motion.button>
                    )}
                    <motion.button
                      onClick={handleCancelUpdate}
                      className="w-full bg-white text-gray-700 px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition flex items-center justify-center shadow-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Back
                    </motion.button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
      
      {/* Add Items Modal */}
      <AnimatePresence>
        {showAddItemsModal && (
          <AddItemsModal
            onAddItem={handleAddItem}
            onClose={() => setShowAddItemsModal(false)}
            restaurantName={restaurantName}
            restaurantId={restaurantId} // Pass the restaurant ID
          />
        )}
      </AnimatePresence>

      {/* Cancel Reason Modal */}
      <AnimatePresence>
        {showCancelReasonModal && <CancelReasonModal />}
      </AnimatePresence>

      {/* Cancel Order Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <CancelOrderModal 
            isOpen={showCancelModal}
            orderId={orderId}
            onClose={() => setShowCancelModal(false)}
            onCancelComplete={handleCancellationComplete}
            orderDetails={{ 
              restaurantName: restaurantName,
              orderNumber: orderId
            }}
          />
        )}
      </AnimatePresence>

      {/* Stripe Payment Modal */}
      <AnimatePresence>
        {showStripePayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 px-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Payment for Added Items</h3>
                {!paymentProcessing && (
                  <button 
                    onClick={() => setShowStripePayment(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              <div className="mb-4 bg-blue-50 border border-blue-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-800">New items total:</span>
                  <span className="font-bold text-blue-800">${paymentAmount.toFixed(2)}</span>
                </div>
                <p className="text-xs text-blue-600">You'll only be charged for the newly added items.</p>
              </div>

              <StripeContainer 
                amount={paymentAmount}
                orderData={order}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
                setProcessing={setPaymentProcessing}
                buttonText="Pay for Added Items"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderUpdatePage;