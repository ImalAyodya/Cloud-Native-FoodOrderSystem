import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHome, FaArrowLeft, FaUtensils } from 'react-icons/fa';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl w-full"
      >
        <div className="flex flex-col md:flex-row">
          {/* Illustration Side */}
          <div className="bg-orange-500 text-white p-8 md:p-12 md:w-1/2 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -left-12 -top-12 w-40 h-40 rounded-full bg-white"></div>
              <div className="absolute right-0 bottom-0 w-64 h-64 rounded-full bg-orange-600"></div>
              <div className="absolute left-20 bottom-10 w-28 h-28 rounded-full bg-orange-300"></div>
            </div>
            
            <div className="text-center relative">
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 5, 0],
                  y: [0, -10, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="text-[10rem] font-bold leading-none mb-4"
              >
                404
              </motion.div>
              <p className="text-xl font-medium text-orange-100 mb-6">Oops! Looks like this page has wandered off the menu.</p>
              
              <div className="mt-4 flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/home"
                  className="bg-white text-orange-500 hover:bg-orange-50 px-6 py-3 rounded-full font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <FaHome />
                  Go Home
                </Link>
                <button 
                  onClick={() => window.history.back()}
                  className="bg-orange-600 text-white hover:bg-orange-700 px-6 py-3 rounded-full font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <FaArrowLeft />
                  Go Back
                </button>
              </div>
            </div>
          </div>
          
          {/* Content Side */}
          <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center">
            <div className="mx-auto w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mb-6">
              <FaUtensils className="text-4xl" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">Page Not Found</h1>
            <p className="text-gray-600 text-center mb-8">
              The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            
            <div className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-medium text-orange-800 mb-1">Hungry for something else?</h3>
                <p className="text-orange-700 text-sm">Check out our delicious menu or explore popular restaurants.</p>
                <div className="mt-3 flex gap-3">
                  <Link to="/menu" className="text-sm text-orange-500 hover:text-orange-600 font-medium">Browse Menu →</Link>
                  <Link to="/resturents" className="text-sm text-orange-500 hover:text-orange-600 font-medium">Find Restaurants →</Link>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-1">Need assistance?</h3>
                <p className="text-blue-700 text-sm">Our support team is ready to help you with any questions or concerns.</p>
                <div className="mt-3">
                  <Link to="/contact" className="text-sm text-blue-500 hover:text-blue-600 font-medium">Contact Support →</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;