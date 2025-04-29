import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import Swal from 'sweetalert2';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../../components/Main/Header';
import Footer from '../../components/Main/Footer';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import stripePromise from '../../utils/Stripe';
import { 
  FaCreditCard, 
  FaMoneyBill, 
  FaShieldAlt, 
  FaLock, 
  FaShoppingBag, 
  FaStore, 
  FaMapMarkerAlt, 
  FaEnvelope, 
  FaPhone,
  FaCheck,
  FaChevronRight,
  FaRegCreditCard,
  FaArrowRight
} from 'react-icons/fa';
import { HiOutlineShoppingBag, HiCash } from 'react-icons/hi';
import { RiSecurePaymentLine } from 'react-icons/ri';
import StripeProvider from '../../components/Payment/StripeProvider';
import StripePaymentForm from './StripePaymentForm';
import { toast as hotToast } from 'react-hot-toast';
import SecuritySoftwareHelper from '../../components/Payment/SecuritySoftwareHelper';

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    address: '',
    email: '',
    phone: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [activeStep, setActiveStep] = useState(1); // 1: Review, 2: Customer Info, 3: Payment
  const [showOrderSummary, setShowOrderSummary] = useState(true);

  useEffect(() => {
    // Fetch items from session storage
    const stored = sessionStorage.getItem('selectedItems');
    if (stored) {
      const parsedItems = JSON.parse(stored);
      setCartItems(parsedItems);
    } else {
      // No items in cart, redirect to menu
      navigate('/menu');
    }
    
    // Load saved customer info if exists
    const savedInfo = localStorage.getItem('customerInfo');
    if (savedInfo) {
      setCustomerInfo(JSON.parse(savedInfo));
    }
  }, [navigate]);

  const getSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
  };

  const getTotal = () => {
    return (parseFloat(getSubtotal()) + 250).toFixed(2); // Adding 250 LKR delivery fee
  };

  const handleCustomerInput = (e) => {
    const { name, value } = e.target;
    setCustomerInfo({ ...customerInfo, [name]: value });
  };

  const groupItemsByRestaurant = () => {
    return cartItems.reduce((grouped, item) => {
      if (!grouped[item.restaurantId]) {
        grouped[item.restaurantId] = {
          restaurantName: item.restaurantName,
          items: [],
        };
      }
      grouped[item.restaurantId].items.push(item);
      return grouped;
    }, {});
  };

  const generateOrdersData = () => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')) || {};
    if (!loggedInUser || !loggedInUser.id || !loggedInUser.name) {
      toast.error('User information is missing. Please log in again.');
      return [];
    }

    const groupedItems = groupItemsByRestaurant();
    
    return Object.keys(groupedItems).map((restaurantId) => {
      const restaurantData = groupedItems[restaurantId];
      const totalAmount = restaurantData.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      return {
        orderId: `DGD-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        restaurant: restaurantId,
        restaurantName: restaurantData.restaurantName,
        loggedInUser: loggedInUser.id,
        loggedInUserName: loggedInUser.name,
        customer: {
          name: loggedInUser.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
          address: customerInfo.address,
        },
        items: restaurantData.items.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          category: item.category || 'General',
          size: item.size,
        })),
        totalAmount,
        paymentMethod,
        orderNote: '',
      };
    });
  };

  useEffect(() => {
    if (cartItems.length > 0 && customerInfo.email) {
      const generatedOrders = generateOrdersData();
      setOrders(generatedOrders);
    }
  }, [cartItems, customerInfo]);

  const handlePaymentSuccess = async (paymentIntentId) => {
    try {
      console.log("Payment successful with ID:", paymentIntentId);
      
      // Make sure we're using the latest orders data
      const currentOrders = orders.length > 0 ? orders : generateOrdersData();
      
      if (currentOrders.length === 0) {
        throw new Error('No order data available');
      }
      
      console.log("Processing orders:", currentOrders);
      
      // Update all orders with payment information
      const updatedOrders = currentOrders.map((order) => ({
        ...order,
        paymentTransactionId: paymentIntentId,
        paymentStatus: 'Completed',
      }));
      
      console.log("Sending orders to API:", updatedOrders);
      
      setLoading(true);
      
      // Create orders one by one to better handle errors
      for (const order of updatedOrders) {
        try {
          const response = await axios.post('http://localhost:5001/api/orders/', order);
          console.log(`Order created successfully:`, response.data);
        } catch (orderError) {
          console.error(`Error creating order:`, orderError);
          throw orderError;
        }
      }
      
      // Success handling
      setCartItems([]);
      sessionStorage.removeItem('selectedItems');
      
      Swal.fire({
        title: 'Order Confirmed!',
        text: 'Your orders have been placed successfully.',
        icon: 'success',
        confirmButtonColor: '#f97316',
        background: '#ffffff',
        iconColor: '#10b981',
        showClass: {
          popup: 'animate__animated animate__fadeIn'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOut'
        }
      });
      
      navigate('/myOrders');
    } catch (error) {
      console.error('Error processing order after payment:', error);
      hotToast.error('Payment successful but order processing failed. Please contact support with your payment ID: ' + paymentIntentId);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentError = (errorMessage) => {
    hotToast.error(`Payment failed: ${errorMessage}`);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    if (!customerInfo.address || !customerInfo.email || !customerInfo.phone) {
      toast.error('Please fill in all the fields.');
      return;
    }
    
    // Basic validation
    if (!/^\S+@\S+\.\S+$/.test(customerInfo.email)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    
    if (!/^[0-9]{10}$/.test(customerInfo.phone.replace(/[^0-9]/g, ''))) {
      toast.error('Please enter a valid phone number.');
      return;
    }
    
    // Save customer info for convenience
    localStorage.setItem('customerInfo', JSON.stringify(customerInfo));

    // Generate orders using our helper function
    const generatedOrders = generateOrdersData();
    
    if (generatedOrders.length === 0) {
      return; // Error already shown in generateOrdersData
    }
    
    setOrders(generatedOrders);

    try {
      setLoading(true);
      
      if (paymentMethod === 'Credit Card') {
        // For Credit Card, just update orders state and let Stripe handle it
        setActiveStep(3);
        setLoading(false);
      } else {
        // Cash on delivery
        const updatedOrders = generatedOrders.map((order) => ({
          ...order,
          paymentMethod: 'Cash on delivery', // Changed from 'Cash on Delivery'
          paymentStatus: 'Pending',
        }));
        
        // Create orders one by one
        for (const order of updatedOrders) {
          try {
            const response = await axios.post('http://localhost:5001/api/orders/', order);
            console.log(`Order created successfully:`, response.data);
          } catch (orderError) {
            console.error(`Error creating order:`, orderError);
            throw orderError;
          }
        }
        
        // Success handling
        setCartItems([]);
        sessionStorage.removeItem('selectedItems');
        
        Swal.fire({
          title: 'Order Confirmed!',
          text: 'Your order has been placed. Please have cash ready for delivery.',
          icon: 'success',
          confirmButtonColor: '#f97316',
        });
        
        navigate('/myOrders');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const moveToNextStep = () => {
    // Validate current step
    if (activeStep === 1) {
      if (cartItems.length === 0) {
        toast.error('Your cart is empty.');
        return;
      }
      setActiveStep(2);
    } else if (activeStep === 2) {
      if (!customerInfo.address || !customerInfo.email || !customerInfo.phone) {
        toast.error('Please fill in all the fields.');
        return;
      }
      
      // Basic validation
      if (!/^\S+@\S+\.\S+$/.test(customerInfo.email)) {
        toast.error('Please enter a valid email address.');
        return;
      }
      
      if (!/^[0-9]{10}$/.test(customerInfo.phone.replace(/[^0-9]/g, ''))) {
        toast.error('Please enter a valid phone number.');
        return;
      }
      
      localStorage.setItem('customerInfo', JSON.stringify(customerInfo));
      setActiveStep(3);
    }
    // Step 3 is handled by the payment form or COD button
  };
  
  const moveToPrevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  const groupedItems = groupItemsByRestaurant();

  return (
    <>
      <Header isNotHome={true} />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-12 pb-24 px-4">
        <div className="max-w-7xl mx-auto mt-12">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-pink-600 inline-block">
              Complete Your Order
            </h2>
            <p className="text-gray-600 mt-2 max-w-xl mx-auto">
              Just a few more steps to enjoy your delicious meal
            </p>
          </motion.div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div 
                className={`flex flex-col items-center ${activeStep >= 1 ? 'text-orange-500' : 'text-gray-400'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeStep >= 1 ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}>
                  <HiOutlineShoppingBag size={20} />
                </div>
                <span className="text-xs mt-1 font-medium">Review Order</span>
              </div>
              
              <div className={`flex-1 h-1 mx-2 ${activeStep >= 2 ? 'bg-orange-500' : 'bg-gray-200'}`}></div>
              
              <div 
                className={`flex flex-col items-center ${activeStep >= 2 ? 'text-orange-500' : 'text-gray-400'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeStep >= 2 ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}>
                  <FaMapMarkerAlt size={18} />
                </div>
                <span className="text-xs mt-1 font-medium">Delivery Info</span>
              </div>
              
              <div className={`flex-1 h-1 mx-2 ${activeStep >= 3 ? 'bg-orange-500' : 'bg-gray-200'}`}></div>
              
              <div 
                className={`flex flex-col items-center ${activeStep >= 3 ? 'text-orange-500' : 'text-gray-400'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeStep >= 3 ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}>
                  <FaRegCreditCard size={18} />
                </div>
                <span className="text-xs mt-1 font-medium">Payment</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col justify-center items-center min-h-[300px]">
              <div className="relative w-20 h-20">
                <div className="w-20 h-20 border-4 border-gray-200 border-opacity-50 rounded-full"></div>
                <div className="absolute top-0 left-0 w-20 h-20 border-4 border-t-orange-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-lg font-semibold text-gray-700 mt-6">
                {paymentMethod === 'Credit Card' 
                  ? 'Preparing secure payment...' 
                  : 'Processing your order...'}
              </p>
              <p className="text-gray-500 mt-2">This will just take a moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <AnimatePresence mode="wait">
                  {activeStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
                    >
                      <div className="p-6 bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center">
                          <FaShoppingBag className="mr-2 text-orange-500" />
                          Review Your Order
                        </h3>
                      </div>
                      
                      <div className="p-6">
                        {Object.keys(groupedItems).map((restaurantId) => (
                          <div key={restaurantId} className="mb-8 last:mb-0">
                            <div className="flex items-center mb-4">
                              <FaStore className="text-orange-500 mr-2" />
                              <h4 className="font-semibold">{groupedItems[restaurantId].restaurantName}</h4>
                            </div>
                            
                            <div className="space-y-4">
                              {groupedItems[restaurantId].items.map((item, index) => (
                                <motion.div 
                                  key={`${item.id}-${index}`}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: index * 0.05 }}
                                  className="flex justify-between items-center p-4 rounded-xl bg-white border border-gray-100 hover:border-orange-200 transition-all shadow-sm"
                                >
                                  <div className="flex items-center">
                                    <div 
                                      className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4 text-orange-500 font-bold"
                                    >
                                      {item.quantity}x
                                    </div>
                                    <div>
                                      <h5 className="font-medium text-gray-800">{item.name}</h5>
                                      <p className="text-sm text-gray-500">
                                        {item.size && `Size: ${item.size}`}
                                        {item.additionalNotes && ` • ${item.additionalNotes}`}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="font-semibold text-gray-800">
                                    LKR {(item.price * item.quantity).toFixed(2)}
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                        <div className="flex justify-between">
                          <button
                            onClick={() => navigate('/cart')}
                            className="px-4 py-2 text-orange-500 font-medium hover:underline flex items-center"
                          >
                            <FaShoppingBag className="mr-2" /> Back to Cart
                          </button>
                          
                          <button
                            onClick={moveToNextStep}
                            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold flex items-center shadow-md hover:shadow-lg transition-all"
                          >
                            Continue <FaChevronRight className="ml-2" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {activeStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
                    >
                      <div className="p-6 bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center">
                          <FaMapMarkerAlt className="mr-2 text-orange-500" />
                          Delivery Information
                        </h3>
                      </div>
                      
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="col-span-2"
                          >
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                              Delivery Address <span className="text-orange-500">*</span>
                            </label>
                            <div className="relative">
                              <FaMapMarkerAlt className="absolute top-3 left-4 text-gray-400" />
                              <input
                                type="text"
                                id="address"
                                name="address"
                                value={customerInfo.address}
                                onChange={handleCustomerInput}
                                className="w-full pl-11 pr-4 py-3 border border-gray-300 focus:border-orange-400 focus:ring focus:ring-orange-200 focus:ring-opacity-50 rounded-xl text-gray-800"
                                placeholder="123 Main Street, Apartment 4B"
                              />
                            </div>
                          </motion.div>
                          
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                              Email Address <span className="text-orange-500">*</span>
                            </label>
                            <div className="relative">
                              <FaEnvelope className="absolute top-3 left-4 text-gray-400" />
                              <input
                                type="email"
                                id="email"
                                name="email"
                                value={customerInfo.email}
                                onChange={handleCustomerInput}
                                className="w-full pl-11 pr-4 py-3 border border-gray-300 focus:border-orange-400 focus:ring focus:ring-orange-200 focus:ring-opacity-50 rounded-xl text-gray-800"
                                placeholder="you@example.com"
                              />
                            </div>
                          </motion.div>
                          
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                              Phone Number <span className="text-orange-500">*</span>
                            </label>
                            <div className="relative">
                              <FaPhone className="absolute top-3 left-4 text-gray-400" />
                              <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={customerInfo.phone}
                                onChange={handleCustomerInput}
                                className="w-full pl-11 pr-4 py-3 border border-gray-300 focus:border-orange-400 focus:ring focus:ring-orange-200 focus:ring-opacity-50 rounded-xl text-gray-800"
                                placeholder="(123) 456-7890"
                              />
                            </div>
                          </motion.div>
                        </div>
                        
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="mt-8"
                        >
                          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <FaRegCreditCard className="mr-2 text-orange-500" />
                            Select Payment Method
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div
                              className={`border-2 rounded-xl p-4 flex items-center cursor-pointer transition-all ${
                                paymentMethod === 'Credit Card'
                                  ? 'border-orange-500 bg-orange-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => setPaymentMethod('Credit Card')}
                            >
                              <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                                paymentMethod === 'Credit Card' ? 'border-orange-500' : 'border-gray-400'
                              }`}>
                                {paymentMethod === 'Credit Card' && (
                                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                )}
                              </div>
                              <div className="flex items-center">
                                <FaCreditCard className="text-orange-500 mr-3" />
                                <span className="font-medium">Credit Card</span>
                              </div>
                            </div>
                            
                            <div
                              className={`border-2 rounded-xl p-4 flex items-center cursor-pointer transition-all ${
                                paymentMethod === 'Cash on Delivery'
                                  ? 'border-orange-500 bg-orange-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => setPaymentMethod('Cash on Delivery')}
                            >
                              <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                                paymentMethod === 'Cash on Delivery' ? 'border-orange-500' : 'border-gray-400'
                              }`}>
                                {paymentMethod === 'Cash on Delivery' && (
                                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                )}
                              </div>
                              <div className="flex items-center">
                                <HiCash className="text-orange-500 mr-3" />
                                <span className="font-medium">Cash on Delivery</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                      
                      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                        <div className="flex justify-between">
                          <button
                            onClick={moveToPrevStep}
                            className="px-4 py-2 text-orange-500 font-medium hover:underline flex items-center"
                          >
                            <FaChevronRight className="mr-2 rotate-180" /> Back
                          </button>
                          
                          <button
                            onClick={moveToNextStep}
                            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold flex items-center shadow-md hover:shadow-lg transition-all"
                          >
                            Continue <FaChevronRight className="ml-2" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {activeStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
                    >
                      <div className="p-6 bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center">
                          <FaCreditCard className="mr-2 text-orange-500" />
                          Complete Payment
                        </h3>
                      </div>
                      
                      <div className="p-6">
                        {paymentMethod === 'Credit Card' ? (
                          <>
                            <SecuritySoftwareHelper />
                            <div className="mt-4">
                              <StripeProvider>
                                <StripePaymentForm 
                                  amount={parseFloat(getTotal())}
                                  orderData={orders[0]} 
                                  onSuccess={handlePaymentSuccess}
                                  onError={handlePaymentError}
                                />
                              </StripeProvider>
                            </div>
                          </>
                        ) : (
                          <div className="py-6">
                            <div className="bg-green-50 border border-green-100 rounded-xl p-5 mb-6">
                              <h4 className="flex items-center text-green-700 font-medium mb-2">
                                <FaCheck className="mr-2 text-green-500" /> Cash on Delivery Selected
                              </h4>
                              <p className="text-green-600 text-sm">
                                You'll pay in cash when your order is delivered. Please have the exact amount ready.
                              </p>
                            </div>
                            
                            <div className="mt-6">
                              <button
                                onClick={handlePaymentSubmit}
                                className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold flex items-center justify-center shadow-md hover:shadow-lg transition-all"
                              >
                                <HiCash className="mr-2 text-xl" />
                                Complete Order with Cash on Delivery
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {paymentMethod === 'Cash on Delivery' && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                          <div className="flex justify-between">
                            <button
                              onClick={moveToPrevStep}
                              className="px-4 py-2 text-orange-500 font-medium hover:underline flex items-center"
                            >
                              <FaChevronRight className="mr-2 rotate-180" /> Back
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 sticky top-24"
                >
                  <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">Order Summary</h3>
                    <button 
                      onClick={() => setShowOrderSummary(!showOrderSummary)}
                      className="lg:hidden text-gray-500 hover:text-gray-700"
                    >
                      {showOrderSummary ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  
                  <AnimatePresence>
                    {(showOrderSummary || window.innerWidth >= 1024) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6">
                          <div className="space-y-3">
                            {cartItems.map((item, index) => (
                              <div key={index} className="flex justify-between items-center">
                                <div className="flex items-center">
                                  <span className="font-medium text-gray-800 mr-1">{item.quantity}x</span>
                                  <span className="text-sm text-gray-600 truncate max-w-[150px]">{item.name}</span>
                                </div>
                                <span className="text-sm font-medium text-gray-800">LKR {(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                          
                          <div className="mt-6 pt-6 border-t border-gray-100">
                            <div className="flex justify-between mb-2">
                              <span className="text-gray-600">Subtotal</span>
                              <span className="font-medium">LKR {getSubtotal()}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                              <span className="text-gray-600">Delivery Fee</span>
                              <span className="font-medium">LKR 250</span>
                            </div>
                            <div className="flex justify-between mt-4 pt-4 border-t border-dashed border-gray-200">
                              <span className="text-lg font-semibold text-gray-800">Total</span>
                              <span className="text-lg font-bold text-orange-500">LKR {getTotal()}</span>
                            </div>
                          </div>
                          
                          <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
                            <div className="flex items-start">
                              <FaShieldAlt className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                              <p className="text-sm text-blue-700">
                                Your order is protected by our secure checkout system.
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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

export default Checkout;