import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLock, FaSignInAlt, FaHome, FaUserShield } from 'react-icons/fa';

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl w-full"
      >
        <div className="flex flex-col md:flex-row">
          {/* Content Side */}
          <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center">
            <div className="mx-auto w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mb-6">
              <FaLock className="text-4xl" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">Access Denied</h1>
            <p className="text-gray-600 text-center mb-8">
              You don't have permission to access this page. Please log in with appropriate credentials or contact an administrator.
            </p>
            
            <div className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-medium text-orange-800 mb-1">Need to login?</h3>
                <p className="text-orange-700 text-sm">Sign in to your account to access all features of DigiDine.</p>
                <div className="mt-3">
                  <Link to="/login" className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1">
                    <FaSignInAlt /> Sign In to Your Account
                  </Link>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-1">Return to safety</h3>
                <p className="text-blue-700 text-sm">Head back to the homepage to explore areas you can access.</p>
                <div className="mt-3">
                  <Link to="/" className="text-sm text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1">
                    <FaHome /> Back to Homepage
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Illustration Side */}
          <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white p-8 md:p-12 md:w-1/2 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-white"></div>
              <div className="absolute left-0 bottom-0 w-64 h-64 rounded-full bg-orange-600"></div>
            </div>
            
            <div className="text-center relative">
              <div className="mb-4">
                <motion.div
                  animate={{ 
                    rotateY: [0, 180, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "loop"
                  }}
                  className="inline-block"
                >
                  <FaUserShield className="text-[8rem] mx-auto" />
                </motion.div>
              </div>
              <h2 className="text-3xl font-bold mb-4">403</h2>
              <p className="text-xl font-medium text-orange-100 mb-6">This area is off-limits to your current user role.</p>
              
              <div className="mt-4 flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/login"
                  className="bg-white text-orange-500 hover:bg-orange-50 px-6 py-3 rounded-full font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <FaSignInAlt />
                  Login
                </Link>
                <button 
                  onClick={() => window.history.back()}
                  className="bg-orange-600 text-white hover:bg-orange-700 px-6 py-3 rounded-full font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  Go Back
                </button>
              </div>
              
              <div className="mt-8 text-orange-100 text-sm">
                <p>If you believe this is an error, please contact support.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UnauthorizedPage;