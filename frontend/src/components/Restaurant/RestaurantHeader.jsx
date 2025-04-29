import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaSearch, 
  FaBell, 
  FaUserCircle, 
  FaBars, 
  FaTimes 
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const RestaurantHeader = ({ restaurantName, restaurantLogo, toggleMobileSidebar }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const handleUserMenuToggle = () => {
    setShowUserMenu(!showUserMenu);
  };
  
  return (
    <header className="bg-white border-b border-gray-200 w-full">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Mobile menu button */}
        <button 
          className="md:hidden text-gray-600 hover:text-gray-900"
          onClick={toggleMobileSidebar}
        >
          <FaBars className="text-xl" />
        </button>
        
        {/* Restaurant info - visible on bigger screens */}
        <div className="hidden md:flex items-center">
          {restaurantLogo ? (
            <img 
              src={restaurantLogo} 
              alt={restaurantName} 
              className="w-10 h-10 rounded-full object-cover mr-3" 
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-3">
              <span className="font-bold text-orange-500">
                {restaurantName ? restaurantName.charAt(0) : 'R'}
              </span>
            </div>
          )}
          <h2 className="text-lg font-medium text-gray-800">{restaurantName || 'Restaurant Dashboard'}</h2>
        </div>
        
        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="text-gray-600 hover:text-gray-900 relative">
            <FaBell />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              0
            </span>
          </button>
          
          {/* User menu */}
          <div className="relative">
            <button 
              className="flex items-center text-gray-600 hover:text-gray-900"
              onClick={handleUserMenuToggle}
            >
              <FaUserCircle className="text-2xl" />
              <span className="ml-2 hidden md:inline">Admin</span>
            </button>
            
            {/* Dropdown menu */}
            <AnimatePresence>
              {showUserMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 w-48 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10"
                >
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    Your Profile
                  </Link>
                  <Link 
                    to="/account-settings" 
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    Account Settings
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <Link 
                    to="/logout" 
                    className="block px-4 py-2 text-red-600 hover:bg-gray-50"
                  >
                    Sign out
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default RestaurantHeader;