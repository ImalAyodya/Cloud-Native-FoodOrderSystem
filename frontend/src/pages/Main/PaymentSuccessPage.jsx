import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaSpinner, FaShoppingBag } from 'react-icons/fa';
import { getPaymentStatus } from '../../services/paymentService';
import Header from '../../components/Main/Header';
import Footer from '../../components/Main/Footer';

const PaymentSuccessPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const sessionId = searchParams.get('session_id');
        
        if (!sessionId) {
          throw new Error('No session ID found');
        }
        
        const result = await getPaymentStatus(sessionId);
        
        if (result.success) {
          setPaymentStatus(result.status);
          setOrderId(result.orderId);
          
          // Clear cart on successful payment
          sessionStorage.removeItem('selectedItems');
        } else {
          throw new Error(result.message || 'Payment verification failed');
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setError(error.message || 'Failed to verify payment status');
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [location]);

  const handleViewOrders = () => {
    navigate('/myOrders');
  };

  const handleContinueShopping = () => {
    navigate('/menu');
  };

  return (
    <>
      <Header isNotHome={true} />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {loading ? (
              <div className="p-8 flex flex-col items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="text-orange-500 mb-4"
                >
                  <FaSpinner size={48} />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Payment</h2>
                <p className="text-gray-600 text-center">
                  Please wait while we verify your payment status...
                </p>
              </div>
            ) : error ? (
              <div className="p-8 flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-red-500 mb-4"
                >
                  <FaExclamationCircle size={64} />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Verification Failed</h2>
                <p className="text-gray-600 text-center mb-6">
                  {error}
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => navigate('/checkout')}
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => navigate('/contact')}
                    className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Get Help
                  </button>
                </div>
              </div>
            ) : paymentStatus === 'paid' ? (
              <div className="p-8">
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-green-500 mx-auto mb-6"
                  >
                    <FaCheckCircle size={72} />
                  </motion.div>
                  <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl font-bold text-gray-800 mb-2"
                  >
                    Payment Successful!
                  </motion.h2>
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-gray-600 mb-8"
                  >
                    Thank you for your order. Your payment has been processed successfully.
                  </motion.p>
                  
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gray-50 rounded-xl p-4 mb-8 inline-block"
                  >
                    <p className="text-gray-500">Order Reference</p>
                    <p className="text-lg font-medium text-gray-800">{orderId || 'N/A'}</p>
                  </motion.div>
                  
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                  >
                    <button
                      onClick={handleViewOrders}
                      className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <FaShoppingBag />
                      View My Orders
                    </button>
                    <button
                      onClick={handleContinueShopping}
                      className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors"
                    >
                      Continue Shopping
                    </button>
                  </motion.div>
                </div>
              </div>
            ) : (
              <div className="p-8 flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-yellow-500 mb-4"
                >
                  <FaExclamationCircle size={64} />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Incomplete</h2>
                <p className="text-gray-600 text-center mb-6">
                  Your payment is {paymentStatus || 'unconfirmed'}. Please contact us if you believe this is an error.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => navigate('/checkout')}
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => navigate('/contact')}
                    className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Get Help
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PaymentSuccessPage;