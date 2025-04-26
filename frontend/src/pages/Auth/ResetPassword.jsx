import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaLock, FaShieldAlt, FaCheckCircle } from 'react-icons/fa';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { password, confirmPassword } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/reset-password`, {
        token,
        password
      });
      
      if (response.data.success) {
        setIsSuccess(true);
        toast.success('Password reset successful!');
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password reset failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="bg-orange-500 py-4">
            <h2 className="text-2xl font-bold text-center text-white">Invalid Reset Link</h2>
          </div>
          
          <div className="p-8 text-center">
            <p className="text-gray-600 mb-6">
              The password reset link is invalid or has expired. Please request a new password reset link.
            </p>
            
            <Link to="/forgot-password" className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out">
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-orange-500 py-4">
          <h2 className="text-2xl font-bold text-center text-white">Reset Your Password</h2>
        </div>
        
        <div className="p-6">
          {!isSuccess ? (
            <>
              <div className="flex justify-center mb-6">
                <div className="bg-orange-100 rounded-full p-3">
                  <FaShieldAlt className="text-orange-500 text-xl" />
                </div>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="relative">
                    <div className="flex items-center border-b-2 border-orange-200 py-2">
                      <FaLock className="text-orange-400 mr-3" />
                      <input
                        type="password"
                        name="password"
                        value={password}
                        onChange={handleChange}
                        placeholder="New Password"
                        required
                        className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <div className="flex items-center border-b-2 border-orange-200 py-2">
                      <FaLock className="text-orange-400 mr-3" />
                      <input
                        type="password"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm New Password"
                        required
                        className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
                  >
                    {isLoading ? 'Resetting Password...' : 'Reset Password'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center">
              <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Password Reset Successful!</h3>
              <p className="text-gray-600 mb-6">
                Your password has been successfully reset. You will be redirected to the login page shortly.
              </p>
              <p className="text-sm text-gray-500">Redirecting to login page...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;