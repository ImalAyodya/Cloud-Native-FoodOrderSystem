import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/request-password-reset`, { email });
      
      if (response.data.success) {
        setIsEmailSent(true);
        toast.success('Password reset instructions sent to your email');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset instructions');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-orange-500 py-4">
          <h2 className="text-2xl font-bold text-center text-white">Reset Your Password</h2>
        </div>
        
        <div className="p-6">
          {!isEmailSent ? (
            <>
              <p className="text-gray-600 mb-6 text-center">
                Enter your email address and we'll send you instructions to reset your password.
              </p>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="relative">
                    <div className="flex items-center border-b-2 border-orange-200 py-2">
                      <FaEnvelope className="text-orange-400 mr-3" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address"
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
                    {isLoading ? 'Sending...' : 'Send Reset Instructions'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="mx-auto bg-green-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
                <FaEnvelope className="text-green-500 text-2xl" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">Check Your Email</h3>
              
              <p className="text-gray-600 mb-6">
                We've sent password reset instructions to <span className="font-semibold">{email}</span>. 
                Please check your inbox and follow the link to reset your password.
              </p>
              
              <p className="text-sm text-gray-500 mb-4">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              
              <button 
                onClick={() => setIsEmailSent(false)} 
                className="w-full bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out mb-3"
              >
                Try Again
              </button>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center text-orange-500 hover:text-orange-700">
              <FaArrowLeft className="mr-2" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;