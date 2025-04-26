import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaLock, FaCheckCircle } from 'react-icons/fa';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get token from URL query params
    const queryParams = new URLSearchParams(location.search);
    const tokenParam = queryParams.get('token');
    
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/reset-password', {
        token,
        password
      });
      
      if (response.data.success) {
        setResetComplete(true);
        toast.success('Password has been reset successfully');
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to reset password. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-orange-100 to-orange-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 py-4">
          <h2 className="text-2xl font-bold text-center text-white">Reset Your Password</h2>
        </div>
        
        {resetComplete ? (
          <div className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <FaCheckCircle className="text-green-500 text-5xl" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Password Reset Complete</h3>
            <p className="text-gray-600 mb-4">Your password has been reset successfully.</p>
            <p className="text-gray-500">You will be redirected to the login page shortly...</p>
          </div>
        ) : (
          <div className="p-8">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            {!token ? (
              <div className="text-center">
                <p className="text-gray-600 mb-4">Invalid or expired reset link.</p>
                <button
                  onClick={() => navigate('/request-password-reset')}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Request New Reset Link
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <div className="mt-1 relative">
                    <div className="flex items-center border-b-2 border-orange-200 py-2">
                      <FaLock className="text-orange-400 mr-3" />
                      <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
                        placeholder="Enter your new password"
                      />
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Password must be at least 6 characters long
                  </p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <div className="mt-1 relative">
                    <div className="flex items-center border-b-2 border-orange-200 py-2">
                      <FaLock className="text-orange-400 mr-3" />
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
                        placeholder="Confirm your new password"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Resetting Password...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Remember your password?{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="font-medium text-orange-600 hover:text-orange-500"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;