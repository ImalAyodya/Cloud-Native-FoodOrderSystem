import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShoppingCart, FaUserCircle, FaMapMarkerAlt } from 'react-icons/fa';
import { BiMenu, BiX } from 'react-icons/bi';
import { FiPhone } from 'react-icons/fi';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigation items
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-md py-2' 
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className={`text-2xl font-bold ${isScrolled ? 'text-orange-500' : 'text-white'}`}>
                Digi<span className={isScrolled ? 'text-gray-800' : 'text-orange-500'}>Dine</span>
              </h1>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`font-medium transition-colors duration-300 relative ${
                    isScrolled ? 'text-gray-700 hover:text-orange-500' : 'text-white hover:text-orange-400'
                  } ${location.pathname === item.path ? 'font-bold' : ''}`}
                >
                  {item.name}
                  {location.pathname === item.path && (
                    <motion.div
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-orange-500"
                      layoutId="navbar-indicator"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Desktop Action Buttons */}
            <div className="flex items-center space-x-4">
              <div className={`hidden lg:flex items-center ${isScrolled ? 'text-gray-700' : 'text-white'}`}>
                <FaMapMarkerAlt className="mr-2 text-orange-500" />
                <span className="text-sm">Select Location</span>
              </div>
              
              <Link 
                to="/cart" 
                className={`relative p-2 rounded-full ${
                  isScrolled ? 'bg-orange-100 text-orange-500' : 'bg-white/20 text-white'
                } hover:bg-orange-500 hover:text-white transition-colors duration-300`}
              >
                <FaShoppingCart className="text-lg" />
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </Link>
              
              <Link 
                to="/profile" 
                className={`p-2 rounded-full ${
                  isScrolled ? 'bg-orange-100 text-orange-500' : 'bg-white/20 text-white'
                } hover:bg-orange-500 hover:text-white transition-colors duration-300`}
              >
                <FaUserCircle className="text-lg" />
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden p-2 rounded-full bg-orange-500 text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            whileTap={{ scale: 0.95 }}
          >
            {mobileMenuOpen ? <BiX size={24} /> : <BiMenu size={24} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white shadow-lg"
          >
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`font-medium py-2 px-4 rounded-md ${
                      location.pathname === item.path
                        ? 'bg-orange-100 text-orange-500'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
              
              {/* Mobile Action Buttons */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                <Link 
                  to="/cart" 
                  className="flex items-center text-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FaShoppingCart className="mr-2 text-orange-500" />
                  <span>Cart (3)</span>
                </Link>
                
                <Link 
                  to="/profile" 
                  className="flex items-center text-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FaUserCircle className="mr-2 text-orange-500" />
                  <span>Profile</span>
                </Link>
              </div>
              
              {/* Mobile Contact */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center text-gray-700 mb-4">
                  <FaMapMarkerAlt className="mr-2 text-orange-500" />
                  <span className="text-sm">123 Food Street, City</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <FiPhone className="mr-2 text-orange-500" />
                  <span className="text-sm">+1 234 567 8900</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;