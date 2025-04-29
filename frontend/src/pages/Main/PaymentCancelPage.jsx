import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaTimesCircle, FaArrowLeft, FaShoppingCart } from 'react-icons/fa';
import Header from '../../components/Main/Header';
import Footer from '../../components/Main/Footer';

const PaymentCancelPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <Header isNotHome={true} />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="p-8">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-red-500 mx-auto mb-6"
                >
                  <FaTimesCircle size={72} />
                </motion.div>
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold text-gray-800 mb-2"
                >
                  Payment Cancelled
                </motion.h2>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-600 mb-8"
                >
                  Your payment was cancelled and no money was charged.
                </motion.p>
                
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                  <button
                    onClick={() => navigate('/checkout')}
                    className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaArrowLeft />
                    Return to Checkout
                  </button>
                  <button
                    onClick={() => navigate('/menu')}
                    className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaShoppingCart />
                    Continue Shopping
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PaymentCancelPage;