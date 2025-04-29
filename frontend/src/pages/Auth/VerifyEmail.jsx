import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmailToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. No token provided.');
        return;
      }

      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/verify-email?token=${token}`);
        
        if (response.data.success) {
          setStatus('success');
          setMessage(response.data.message || 'Email verified successfully!');
          
          // Redirect to login page after 3 seconds
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        }
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Email verification failed. Please try again.');
      }
    };

    verifyEmailToken();
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-orange-500 py-4">
          <h2 className="text-2xl font-bold text-center text-white">Email Verification</h2>
        </div>
        
        <div className="p-8 text-center">
          {status === 'verifying' && (
            <>
              <FaSpinner className="animate-spin text-orange-500 text-5xl mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Verifying your email</h3>
              <p className="text-gray-600">Please wait while we verify your email address...</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Verification Successful!</h3>
              <p className="text-gray-600 mb-6">{message}</p>
              <p className="text-sm text-gray-500">Redirecting you to login page...</p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <FaTimesCircle className="text-red-500 text-5xl mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Verification Failed</h3>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="space-y-3">
                <Link to="/register" className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out">
                  Try Registering Again
                </Link>
                
                <Link to="/login" className="block w-full bg-white border border-orange-500 hover:bg-orange-50 text-orange-500 font-medium py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out">
                  Go to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;