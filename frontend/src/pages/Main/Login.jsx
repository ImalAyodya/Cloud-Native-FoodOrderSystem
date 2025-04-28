import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEnvelope, FaLock, FaGoogle, FaUtensils } from 'react-icons/fa';
import { BiRestaurant } from 'react-icons/bi';
import axios from 'axios';
import { MdDeliveryDining } from 'react-icons/md';
import authService from '../../services/authService';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const navigate = useNavigate();
  
  // Floating food icons for decoration
  const [floatingIcons] = useState([
    { icon: '🍕', x: '10%', y: '20%', size: '2rem', delay: 0 },
    { icon: '🍔', x: '80%', y: '15%', size: '2.5rem', delay: 0.5 },
    { icon: '🍜', x: '20%', y: '70%', size: '3rem', delay: 1.2 },
    { icon: '🥗', x: '75%', y: '65%', size: '2.2rem', delay: 1.7 },
    { icon: '🍣', x: '60%', y: '40%', size: '2.3rem', delay: 2.3 },
  ]);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };
  
  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const floatVariants = {
    animate: (i) => ({
      y: [0, -15, 0],
      transition: {
        delay: i * 0.5,
        duration: 3.5,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut'
      }
    })
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Login attempt:", formData.email);
      const response = await authService.login(formData.email, formData.password);
      console.log("Login response:", response);

      // Store user data properly
      if (response && response.user) {
        console.log("Storing user data:", response);
        localStorage.setItem('userData', JSON.stringify(response));
        
        console.log("Checking stored data immediately after setting");
        const storedData = localStorage.getItem('userData');
        console.log("Raw stored data:", storedData);
        console.log("Parsed stored data:", JSON.parse(storedData));
      }
      
      toast.success('Login successful!');
      
      setTimeout(() => {
        // Re-read data from localStorage to ensure it's current
        const userData = JSON.parse(localStorage.getItem('userData'));
        console.log("userData before navigation:", userData);
        
        if (userData && userData.user) {
          const role = userData.user.role;
          console.log(`User role: ${role}, navigating to appropriate dashboard`);
          
          if (role === 'admin') {
            navigate('/admin');
          } 
          else if (role === 'delivery_person') {
            console.log("Navigating to DeliveryDashboard");
            navigate('/DeliveryDashboard');
          }
          else if (role === 'restaurant_admin') {
            navigate('/restaurant/my-restaurants');
          } 
          else {
            navigate('/home');
          }
        } else {
          console.error("Invalid user data structure after login");
          navigate('/login');
        }
      }, 1000);
    } catch (error) {
      console.error("Login error:", error);
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100">
      <ToastContainer position="top-center" autoClose={3000} theme="colored" />
      
      {/* Left Side - Decorative Content */}
      <div className="hidden lg:block lg:w-1/2 relative">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-400 to-amber-300">
          <div className="absolute inset-0 bg-[url('/patterns/food-pattern.png')] opacity-5 mix-blend-overlay"></div>
        </div>
        
        {/* Decorative circles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[10%] left-[20%] w-64 h-64 bg-orange-600/20 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-[20%] right-[10%] w-80 h-80 bg-amber-400/20 rounded-full filter blur-3xl"></div>
        </div>

        {/* Floating food icons */}
        <div className="absolute inset-0">
          {floatingIcons.map((item, index) => (
            <motion.div
              key={index}
              custom={item.delay}
              variants={floatVariants}
              animate="animate"
              className="absolute text-white/90"
              style={{
                left: item.x,
                top: item.y,
                fontSize: item.size,
                filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.3))'
              }}
            >
              {item.icon}
            </motion.div>
          ))}
        </div>
        
        {/* Glass effect card */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-10 max-w-md w-full shadow-2xl border border-white/20"
          >
            <motion.div
              whileHover={{ scale: 1.05, rotate: [0, 5, 0] }}
              transition={{ duration: 0.5 }}
            >
              <BiRestaurant className="text-6xl text-white mx-auto mb-4 filter drop-shadow-lg" />
            </motion.div>
            
            <motion.h1 
              className="text-5xl font-bold mb-3 text-white text-center tracking-tight"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              DigiDine
            </motion.h1>
            
            <motion.div 
              className="h-1.5 w-16 bg-white/60 mx-auto rounded-full mb-5"
              initial={{ width: 0 }}
              animate={{ width: 64 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />
            
            <motion.p 
              className="text-lg mb-8 text-white/90 text-center leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Experience the future of food delivery with our cloud-native platform
            </motion.p>
            
            {/* Feature cards */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <motion.div 
                whileHover={{ scale: 1.03, y: -5 }}
                className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-xl"
              >
                <MdDeliveryDining className="text-3xl text-white mx-auto mb-3 filter drop-shadow-md" />
                <h3 className="font-semibold text-white text-center text-sm">Fast Delivery</h3>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.03, y: -5 }}
                className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-xl"
              >
                <FaUtensils className="text-2xl text-white mx-auto mb-3 filter drop-shadow-md" />
                <h3 className="font-semibold text-white text-center text-sm">Premium Quality</h3>
              </motion.div>
            </div>
            
            {/* Testimonial */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md rounded-xl p-5 border border-white/20 shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-white/70 to-white/0"></div>
              <p className="text-white/90 italic text-sm leading-relaxed">
                "DigiDine has transformed how I order food. The entire experience is seamless and delightful!"
              </p>
              <div className="flex items-center mt-3 justify-end">
                <div className="w-7 h-7 rounded-full bg-white/20 flex-shrink-0 mr-2"></div>
                <p className="text-white/80 font-medium text-xs">Sarah T.</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          <motion.div variants={itemVariants} className="text-center mb-7">
            <Link to="/" className="inline-block">
              <motion.img 
                src="/main_logo.png" 
                alt="DigiDine Logo" 
                className="h-16 mx-auto mb-4" 
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
            </Link>
            <h2 className="text-3xl font-extrabold text-gray-800 mb-2 tracking-tight">Welcome back</h2>
            <p className="text-gray-500">Sign in to your account</p>
          </motion.div>
          
          <motion.div 
            variants={itemVariants} 
            className="transform perspective-1000"
          >
            <div className="rounded-2xl shadow-2xl p-7 backdrop-blur-sm bg-white/90 border border-gray-100">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <div className="relative">
                    <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-300 ${activeField === 'email' ? 'text-orange-500' : 'text-orange-400'}`}>
                      <FaEnvelope />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setActiveField('email')}
                      onBlur={() => setActiveField(null)}
                      required
                      className={`w-full pl-10 pr-4 py-3.5 border rounded-xl transition-all duration-300 bg-gray-50 text-gray-800 ${
                        activeField === 'email' 
                          ? 'border-orange-400 ring-2 ring-orange-100' 
                          : 'border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100'
                      }`}
                      placeholder="Email address"
                    />
                    <AnimatePresence>
                      {activeField === 'email' && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-400"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                
                <div>
                  <div className="relative">
                    <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-300 ${activeField === 'password' ? 'text-orange-500' : 'text-orange-400'}`}>
                      <FaLock />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => setActiveField('password')}
                      onBlur={() => setActiveField(null)}
                      required
                      className={`w-full pl-10 pr-12 py-3.5 border rounded-xl transition-all duration-300 bg-gray-50 text-gray-800 ${
                        activeField === 'password' 
                          ? 'border-orange-400 ring-2 ring-orange-100' 
                          : 'border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100'
                      }`}
                      placeholder="Password"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <motion.div whileTap={{ scale: 0.9 }}>
                        {showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </motion.div>
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link to="/forgot-password" className="text-xs text-orange-500 hover:text-orange-600 transition-colors font-medium">
                    Forgot password?
                  </Link>
                </div>
                
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(249, 115, 22, 0.2)" }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-3.5 px-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-xl shadow-lg shadow-orange-500/30 transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </div>
                  ) : 'Sign In'}
                </motion.button>
              </form>
              
              <div className="mt-5">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-white text-gray-500">or</span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <motion.button
                    type="button"
                    onClick={handleGoogleLogin}
                    whileHover={{ scale: 1.02, y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center py-3.5 px-4 border border-gray-200 rounded-xl shadow-sm bg-white text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    <FaGoogle className="mr-2 text-red-500" />
                    <span className="text-sm font-medium">Continue with Google</span>
                  </motion.button>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-center text-gray-600 text-sm">
                  Don't have an account?{' '}
                  <Link to="/register" className="font-medium text-orange-500 hover:text-orange-600 transition-colors">
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
          
          {/* Footer with copyright */}
          <motion.div 
            variants={itemVariants} 
            className="text-center text-xs text-gray-400 mt-6 flex items-center justify-center"
          >
            <span>&copy; {new Date().getFullYear()} DigiDine</span>
            <span className="mx-2">•</span>
            <Link to="/privacy" className="hover:text-gray-500 transition-colors">Privacy</Link>
            <span className="mx-2">•</span>
            <Link to="/terms" className="hover:text-gray-500 transition-colors">Terms</Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;