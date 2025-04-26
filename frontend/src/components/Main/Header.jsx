import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaShoppingCart, FaUserCircle } from 'react-icons/fa';

const Header = ({ isNotHome }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Update cart count from localStorage when component mounts
    const storedCount = localStorage.getItem('cartCount');
    if (storedCount) {
      setCartCount(parseInt(storedCount, 10));
    }

    // Listen for cart updates
    const handleCartUpdate = (e) => {
      setCartCount(e.detail.count);
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  // Also check session storage directly in case we're on a page where Menu isn't loaded
  useEffect(() => {
    const checkCartItems = () => {
      const storedItems = sessionStorage.getItem('selectedItems');
      if (storedItems) {
        try {
          const parsedItems = JSON.parse(storedItems);
          const count = parsedItems.reduce((sum, item) => sum + item.quantity, 0);
          setCartCount(count);
        } catch (error) {
          console.error("Failed to parse cart items:", error);
        }
      }
    };
    
    checkCartItems();
  }, [location.pathname]); // Re-check when route changes

  const goToCart = () => {
    navigate('/cart');
  };

  const navItems = [
    { name: 'Home', path: '/home' },
    { name: 'Resturents', path: '/resturents' },
    { name: 'Menu', path: '/menu' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'My Orders', path: '/myOrders' },
  ];

  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isNotHome || isScrolled 
          ? 'bg-white shadow-md py-2' 
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className={`text-2xl font-bold ${isNotHome || isScrolled ? 'text-orange-500' : 'text-white'}`}>
                Digi<span className={isNotHome || isScrolled ? 'text-gray-800' : 'text-orange-500'}>Dine</span>
              </h1>
            </motion.div>
          </Link>

          <div className="flex items-center space-x-8">
            <nav className="flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`font-medium transition-colors duration-300 relative ${
                    isNotHome || isScrolled ? 'text-gray-700 hover:text-orange-500' : 'text-white hover:text-orange-400'
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

            <div className="flex items-center space-x-4">
              <button 
                onClick={goToCart}
                className={`relative p-2 rounded-full ${
                  isNotHome || isScrolled ? 'bg-orange-100 text-orange-500' : 'bg-white/20 text-white'
                } hover:bg-orange-500 hover:text-white transition-colors duration-300`}
                aria-label="View Cart"
              >
                <FaShoppingCart className="text-lg" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>
              
              <Link 
                to="/profile" 
                className={`p-2 rounded-full ${
                  isNotHome || isScrolled ? 'bg-orange-100 text-orange-500' : 'bg-white/20 text-white'
                } hover:bg-orange-500 hover:text-white transition-colors duration-300`}
                aria-label="User Profile"
              >
                <FaUserCircle className="text-lg" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;