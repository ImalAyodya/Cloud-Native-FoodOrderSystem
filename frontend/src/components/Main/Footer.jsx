import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUtensils, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { FiMail, FiPhone, FiMapPin, FiClock } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  // Footer animation variants
  const footerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto">
        {/* Top section with newsletter */}
        <div className="bg-orange-600 py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-6 md:mb-0">
                <h3 className="text-white text-xl font-bold">Stay updated with DigiDine!</h3>
                <p className="text-orange-100 mt-2">Subscribe to our newsletter for exclusive offers and updates.</p>
              </div>
              <div className="flex-1 md:ml-6 max-w-md">
                <form className="flex">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="flex-1 py-3 px-4 rounded-l-md focus:outline-none text-gray-800"
                  />
                  <button 
                    type="submit" 
                    className="bg-gray-900 text-white py-3 px-6 rounded-r-md hover:bg-gray-800 transition duration-300"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main footer content */}
        <motion.div 
          className="py-12 px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10"
          variants={footerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {/* Brand column */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center space-x-2 mb-6">
              <FaUtensils className="text-orange-500 text-2xl" />
              <h2 className="text-white text-2xl font-bold">DigiDine</h2>
            </div>
            <p className="text-gray-400 mb-6">
              Delicious food delivered right to your doorstep. Experience the convenience of online ordering with premium quality meals prepared by expert chefs.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="bg-gray-800 hover:bg-orange-500 h-10 w-10 rounded-full flex items-center justify-center transition duration-300">
                <FaFacebookF className="text-white" />
              </a>
              <a href="#" className="bg-gray-800 hover:bg-orange-500 h-10 w-10 rounded-full flex items-center justify-center transition duration-300">
                <FaTwitter className="text-white" />
              </a>
              <a href="#" className="bg-gray-800 hover:bg-orange-500 h-10 w-10 rounded-full flex items-center justify-center transition duration-300">
                <FaInstagram className="text-white" />
              </a>
              <a href="#" className="bg-gray-800 hover:bg-orange-500 h-10 w-10 rounded-full flex items-center justify-center transition duration-300">
                <FaLinkedinIn className="text-white" />
              </a>
            </div>
          </motion.div>
          
          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h3 className="text-white text-lg font-semibold mb-6 border-b border-gray-700 pb-2">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-400 hover:text-orange-500 transition duration-300 flex items-center">
                  <span className="mr-2">›</span> Home
                </Link>
              </li>
              <li>
                <Link to="/menu" className="text-gray-400 hover:text-orange-500 transition duration-300 flex items-center">
                  <span className="mr-2">›</span> Our Menu
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-orange-500 transition duration-300 flex items-center">
                  <span className="mr-2">›</span> About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-orange-500 transition duration-300 flex items-center">
                  <span className="mr-2">›</span> Contact
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-orange-500 transition duration-300 flex items-center">
                  <span className="mr-2">›</span> FAQ
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-gray-400 hover:text-orange-500 transition duration-300 flex items-center">
                  <span className="mr-2">›</span> Privacy Policy
                </Link>
              </li>
            </ul>
          </motion.div>
          
          {/* Contact Info */}
          <motion.div variants={itemVariants}>
            <h3 className="text-white text-lg font-semibold mb-6 border-b border-gray-700 pb-2">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <FiMapPin className="text-orange-500 mt-1 mr-3" />
                <span className="text-gray-400">123 Main Street, Colombo, Sri Lanka</span>
              </li>
              <li className="flex items-center">
                <FiPhone className="text-orange-500 mr-3" />
                <span className="text-gray-400">+94 112 345 678</span>
              </li>
              <li className="flex items-center">
                <FiMail className="text-orange-500 mr-3" />
                <span className="text-gray-400">support@digidine.com</span>
              </li>
              <li className="flex items-start">
                <FiClock className="text-orange-500 mt-1 mr-3" />
                <div className="text-gray-400">
                  <p>Mon-Fri: 8:00 AM - 10:00 PM</p>
                  <p>Sat-Sun: 10:00 AM - 11:00 PM</p>
                </div>
              </li>
            </ul>
          </motion.div>
          
          {/* Download app section */}
          <motion.div variants={itemVariants}>
            <h3 className="text-white text-lg font-semibold mb-6 border-b border-gray-700 pb-2">Get Mobile App</h3>
            <p className="text-gray-400 mb-4">
              Download our mobile app for a better experience on your phone.
            </p>
            <div className="space-y-3">
              <a href="#" className="block">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                  alt="Get it on Google Play" 
                  className="h-10"
                />
              </a>
              <a href="#" className="block">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" 
                  alt="Download on the App Store" 
                  className="h-10"
                />
              </a>
            </div>
            <div className="mt-6">
              <h4 className="text-white text-sm font-semibold mb-2">We Accept</h4>
              <div className="flex space-x-2">
                <div className="h-8 w-12 bg-white rounded flex items-center justify-center">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                </div>
                <div className="h-8 w-12 bg-white rounded flex items-center justify-center">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4" />
                </div>
                <div className="h-8 w-12 bg-white rounded flex items-center justify-center">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4" />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Copyright */}
        <div className="border-t border-gray-800 py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm text-center md:text-left">
              © {currentYear} DigiDine. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <ul className="flex space-x-6 text-sm">
                <li>
                  <Link to="/terms" className="text-gray-500 hover:text-orange-500 transition duration-300">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-gray-500 hover:text-orange-500 transition duration-300">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/cookies" className="text-gray-500 hover:text-orange-500 transition duration-300">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;