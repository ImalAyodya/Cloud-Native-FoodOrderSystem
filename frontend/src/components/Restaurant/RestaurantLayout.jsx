import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import RestaurantHeader from './RestaurantHeader';
import RestaurantSidebar from './RestaurantSidebar';

const RestaurantLayout = ({ children }) => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const navigate = useNavigate();

  const toggleMobileSidebar = () => {
    setShowMobileSidebar(!showMobileSidebar);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <RestaurantSidebar onLogout={handleLogout} />
      
      {/* Mobile sidebar - shows on smaller screens */}
      <AnimatePresence>
        {showMobileSidebar && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
              onClick={toggleMobileSidebar}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed top-0 left-0 z-30 h-full w-64 bg-white md:hidden"
            >
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800">Menu</h2>
                <button onClick={toggleMobileSidebar}>
                  <FaTimes className="text-gray-500" />
                </button>
              </div>
              <RestaurantSidebar onLogout={handleLogout} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <RestaurantHeader 
          restaurantName="Restaurant Management" 
          toggleMobileSidebar={toggleMobileSidebar}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default RestaurantLayout;