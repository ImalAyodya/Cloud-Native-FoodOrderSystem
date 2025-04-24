
// import { useState } from 'react';
// import axios from 'axios';
// import { useAuth } from '../../context/AuthContext';
// import { useNavigate } from 'react-router-dom';

// export default function Login() {
//   const [form, setForm] = useState({ email: '', password: '' });
//   const [msg, setMsg] = useState('');
//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = async e => {
//     e.preventDefault();
//     try {
//       const { data } = await axios.post('http://localhost:5000/api/auth/login', form);
//       login(data.user, data.token);
//       navigate('/');
//     } catch (err) {
//       setMsg(err.response?.data?.message || "Login error");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-400 via-gray-200 to-gray-100 relative">
//       {/* Background Image */}
//       <div
//         className="absolute inset-0 bg-cover bg-center filter blur-md"
//         style={{
//           backgroundImage: "url('https://source.unsplash.com/1600x900/?food')",
//         }}
//       ></div>

//       {/* Gradient Overlay */}
//       <div className="absolute inset-0 bg-gradient-to-br from-orange-400/30 to-gray-500/30"></div>

//       {/* Glassmorphic Form */}
//       <div className="relative bg-white/30 backdrop-blur-lg rounded-xl shadow-lg p-8 w-full max-w-md">
//         <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Login</h2>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="relative">
//             <input
//               name="email"
//               type="email"
//               placeholder="Email"
//               onChange={handleChange}
//               required
//               className="w-full px-4 py-3 rounded-lg bg-white/50 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
//             />
//           </div>
//           <div className="relative">
//             <input
//               name="password"
//               type="password"
//               placeholder="Password"
//               onChange={handleChange}
//               required
//               className="w-full px-4 py-3 rounded-lg bg-white/50 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
//             />
//           </div>
//           <button
//             type="submit"
//             className="w-full py-3 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition duration-300"
//           >
//             Login
//           </button>
//         </form>
//         {msg && <p className="text-center text-red-500 mt-4">{msg}</p>}
//       </div>
//     </div>
//   );
// }

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEnvelope, FaLock, FaGoogle } from 'react-icons/fa';
import axios from 'axios';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      
      // Store user data and token in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('loggedInUser', JSON.stringify({
        id: response.data.user._id,
        name: response.data.user.name,
        email: response.data.user.email,
        role: response.data.user.role,
      }));

      toast.success('Login successful!');
      
      // Redirect based on user role
      if (response.data.user.role === 'admin') {
        navigate('/admin');
      } else if (response.data.user.role === 'restaurant_admin') {
        navigate('/restaurant/dashboard');
      } else {
        navigate('/'); // Customer default
      }
      
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
      <ToastContainer position="top-center" autoClose={3000} />
      
      <div className="max-w-md w-full mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <Link to="/">
            <img 
              src="/main_logo.png" 
              alt="DigiDine Logo" 
              className="h-16 mx-auto mb-4" 
            />
          </Link>
          <h2 className="text-3xl font-bold text-gray-800">Welcome back</h2>
          <p className="text-gray-600 mt-2">Sign in to your DigiDine account</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-8">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    placeholder="your-email@example.com"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-gray-700 text-sm font-medium">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-sm text-orange-500 hover:text-orange-600 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg shadow transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </motion.button>
            </form>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or continue with</span>
                </div>
              </div>
              
              <div className="mt-6">
                <motion.button
                  type="button"
                  onClick={handleGoogleLogin}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <FaGoogle className="mr-2 text-red-500" />
                  Sign in with Google
                </motion.button>
              </div>
            </div>
          </div>
          
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
            <p className="text-center text-gray-600 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-orange-500 hover:text-orange-600 transition-colors">
                Create one now
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
      
      <p className="text-center text-gray-500 text-sm mt-8">
        &copy; {new Date().getFullYear()} DigiDine. All rights reserved.
      </p>
    </div>
  );
};

export default LoginPage;
