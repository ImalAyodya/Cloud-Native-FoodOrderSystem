import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Main/Header';
import Footer from '../../components/Main/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FaPlus, 
  FaMinus, 
  FaTrash, 
  FaShoppingBag, 
  FaChevronRight, 
  FaShieldAlt, 
  FaCreditCard,
  FaMoneyBillWave
} from 'react-icons/fa';
import { HiOutlineReceiptRefund, HiOutlineShieldCheck } from 'react-icons/hi';
import { BsArrowRightShort } from 'react-icons/bs';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [groupedItems, setGroupedItems] = useState({});

  useEffect(() => {
    // Simulate loading for smoother transitions
    const timer = setTimeout(() => {
      const stored = sessionStorage.getItem('selectedItems');
      if (stored) {
        const items = JSON.parse(stored);
        setCartItems(items);
        
        // Group items by restaurant
        const grouped = items.reduce((acc, item) => {
          const id = item.restaurantId;
          if (!acc[id]) {
            acc[id] = {
              restaurantName: item.restaurantName,
              items: []
            };
          }
          acc[id].items.push(item);
          return acc;
        }, {});
        
        setGroupedItems(grouped);
      }
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  const updateQuantity = (index, delta) => {
    const updated = [...cartItems];
    updated[index].quantity = Math.max(1, updated[index].quantity + delta);
    setCartItems(updated);
    
    // Update both cart items and grouped items
    sessionStorage.setItem('selectedItems', JSON.stringify(updated));
    
    // Re-group items
    const grouped = updated.reduce((acc, item) => {
      const id = item.restaurantId;
      if (!acc[id]) {
        acc[id] = {
          restaurantName: item.restaurantName,
          items: []
        };
      }
      acc[id].items.push(item);
      return acc;
    }, {});
    
    setGroupedItems(grouped);
    
    toast.info('Quantity updated!', {
      position: 'bottom-right',
      autoClose: 2000,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const removeItem = (index) => {
    Swal.fire({
      title: 'Remove from cart?',
      text: "This item will be removed from your cart.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f97316',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, remove it',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'rounded-xl',
        confirmButton: 'rounded-lg',
        cancelButton: 'rounded-lg'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const updated = cartItems.filter((_, i) => i !== index);
        setCartItems(updated);
        
        // Update session storage
        sessionStorage.setItem('selectedItems', JSON.stringify(updated));
        
        // Re-group items
        const grouped = updated.reduce((acc, item) => {
          const id = item.restaurantId;
          if (!acc[id]) {
            acc[id] = {
              restaurantName: item.restaurantName,
              items: []
            };
          }
          acc[id].items.push(item);
          return acc;
        }, {});
        
        setGroupedItems(grouped);
        
        toast.success('Item removed successfully', {
          position: 'bottom-right',
          autoClose: 2000,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    });
  };

  const getSubtotal = () =>
    cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
  
  const getDeliveryFee = () => (cartItems.length > 0 ? 2.50 : 0).toFixed(2);
  
  const getTotal = () => 
    (parseFloat(getSubtotal()) + parseFloat(getDeliveryFee())).toFixed(2);
    
  const getTotalItems = () =>
    cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (isLoading) {
    return (
      <>
        <Header isNotHome={true} />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12 px-4">
          <div className="max-w-6xl mx-auto mt-12">
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-orange-500 border-opacity-20 border-t-orange-500 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 mt-4">Loading your cart...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header isNotHome={true} />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12 px-4">
        <div className="max-w-6xl mx-auto mt-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-orange-600 inline-block">
              Your Cart
            </h2>
            <p className="text-gray-600 mt-2 max-w-xl mx-auto">
              Review your items before checkout
            </p>
          </motion.div>

          {cartItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-10 text-center max-w-2xl mx-auto"
            >
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center mb-6">
                  <FaShoppingBag className="text-orange-400 text-3xl" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h3>
                <p className="text-gray-600 mb-8 max-w-md">
                  Looks like you haven't added any items to your cart yet. Explore our menu to find delicious meals!
                </p>
                
                <Link to="/menu">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold flex items-center shadow-md hover:shadow-lg transition-all"
                  >
                    Browse Menu <FaChevronRight className="ml-2" />
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
                >
                  <div className="p-6 bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center">
                      <FaShoppingBag className="mr-2 text-orange-500" />
                      Cart Items ({getTotalItems()})
                    </h3>
                  </div>
                  
                  <div className="divide-y divide-gray-100">
                    {Object.keys(groupedItems).map(restaurantId => (
                      <div key={restaurantId} className="p-6">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                            <motion.div
                              animate={{ rotate: [0, 5, 0, -5, 0] }}
                              transition={{ repeat: Infinity, repeatDelay: 5, duration: 0.5 }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                                <path fillRule="evenodd" d="M10 6a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 100-2h-2V7a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </motion.div>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-700">
                              {groupedItems[restaurantId].restaurantName}
                            </h4>
                            <p className="text-xs text-gray-500">
                              Estimated delivery time: 30-45 minutes
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          {groupedItems[restaurantId].items.map((item, idx) => {
                            const index = cartItems.findIndex(cartItem => 
                              cartItem.id === item.id && 
                              cartItem.size === item.size &&
                              cartItem.restaurantId === restaurantId
                            );
                            
                            return (
                              <motion.div
                                key={`${item.id}-${idx}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:border-orange-200 transition-all shadow-sm hover:shadow"
                              >
                                <div className="flex items-start sm:items-center mb-4 sm:mb-0">
                                  <div className="relative group">
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-16 h-16 object-cover rounded-lg shadow-sm border border-gray-200"
                                    />
                                    <motion.div 
                                      initial={{ opacity: 0 }}
                                      whileHover={{ opacity: 1 }}
                                      className="absolute inset-0 bg-black bg-opacity-30 rounded-lg flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
                                    >
                                      <FaTrash className="text-white text-sm" />
                                    </motion.div>
                                  </div>
                                  
                                  <div className="ml-4">
                                    <h5 className="font-bold text-gray-800">{item.name}</h5>
                                    <p className="text-sm text-gray-500 mt-1">
                                      {item.size && `Size: ${item.size}`}
                                      {item.additionalNotes && ` • ${item.additionalNotes}`}
                                    </p>
                                    <p className="text-orange-500 font-semibold mt-1">
                                      LKR {item.price.toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-1">
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => updateQuantity(index, -1)}
                                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center border border-gray-200"
                                    >
                                      <FaMinus className="text-gray-600 text-xs" />
                                    </motion.button>
                                    
                                    <span className="w-8 text-center font-semibold text-gray-800">
                                      {item.quantity}
                                    </span>
                                    
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => updateQuantity(index, 1)}
                                      className="w-8 h-8 rounded-full bg-orange-100 hover:bg-orange-200 flex items-center justify-center border border-orange-200"
                                    >
                                      <FaPlus className="text-orange-600 text-xs" />
                                    </motion.button>
                                  </div>
                                  
                                  <div className="ml-6 flex items-center">
                                    <span className="font-bold text-gray-800">
                                      LKR {(item.price * item.quantity).toFixed(2)}
                                    </span>
                                    
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => removeItem(index)}
                                      className="ml-4 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                      <FaTrash size={14} />
                                    </motion.button>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-6 bg-gray-50">
                    <Link to="/menu">
                      <button className="text-orange-500 hover:text-orange-600 font-medium flex items-center">
                        <FaPlus size={12} className="mr-2" />
                        Add more items
                      </button>
                    </Link>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6"
                >
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200 shadow-sm flex flex-col items-center sm:items-start text-center sm:text-left">
                    <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                      <HiOutlineShieldCheck className="text-blue-600 text-xl" />
                    </div>
                    <h4 className="font-bold text-blue-800 text-sm">Secure Checkout</h4>
                    <p className="text-blue-600 text-xs mt-1">Your data is protected with 256-bit encryption</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border border-green-200 shadow-sm flex flex-col items-center sm:items-start text-center sm:text-left">
                    <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                      <HiOutlineReceiptRefund className="text-green-600 text-xl" />
                    </div>
                    <h4 className="font-bold text-green-800 text-sm">Easy Refund</h4>
                    <p className="text-green-600 text-xs mt-1">Not satisfied? Get a refund within 30 minutes</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 border border-purple-200 shadow-sm flex flex-col items-center sm:items-start text-center sm:text-left">
                    <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                      <FaMoneyBillWave className="text-purple-600 text-xl" />
                    </div>
                    <h4 className="font-bold text-purple-800 text-sm">Multiple Payment Options</h4>
                    <p className="text-purple-600 text-xs mt-1">Pay with card or cash on delivery</p>
                  </div>
                </motion.div>
              </div>
              
              {/* Order Summary */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 sticky top-24"
                >
                  <div className="p-6 bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200">
                    <h3 className="text-lg font-bold text-gray-800">Order Summary</h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-3">
                      {cartItems.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div className="flex items-center">
                            <span className="font-medium text-gray-800 mr-1">{item.quantity}x</span>
                            <span className="text-sm text-gray-600 truncate max-w-[150px]">{item.name}</span>
                          </div>
                          <span className="text-sm font-medium text-gray-800">LKR {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      
                      {cartItems.length > 3 && (
                        <div className="text-sm text-gray-500 italic">
                          + {cartItems.length - 3} more items
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">LKR {getSubtotal()}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Delivery Fee</span>
                        <span className="font-medium">LKR {getDeliveryFee()}</span>
                      </div>
                      <div className="flex justify-between mt-4 pt-4 border-t border-dashed border-gray-200">
                        <span className="text-lg font-semibold text-gray-800">Total</span>
                        <span className="text-lg font-bold text-orange-500">LKR {getTotal()}</span>
                      </div>
                    </div>
                    
                    <div className="mt-8">
                      <Link to="/checkout">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
                        >
                          <span>Proceed to Checkout</span>
                          <BsArrowRightShort className="ml-2 text-xl" />
                        </motion.button>
                      </Link>
                      
                      <div className="mt-4 flex items-center justify-center space-x-2 text-gray-500 text-xs">
                        <FaShieldAlt />
                        <span>Safe & Secure Checkout</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center">
                        <FaCreditCard className="text-blue-500 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-medium text-blue-700">Payment Options</h4>
                          <p className="text-xs text-blue-600 mt-1">
                            We accept all major credit cards and cash on delivery.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
      <ToastContainer
        position="bottom-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};

export default Cart;