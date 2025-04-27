import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verifyEmailToken = async () => {
      try {
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('token');
        
        if (!token) {
          setVerificationStatus('error');
          setErrorMessage('Invalid verification link. Token is missing.');
          return;
        }
        
        const response = await axios.get(`http://localhost:5000/api/auth/verify-email?token=${token}`);
        
        if (response.data.success) {
          setVerificationStatus('success');
          toast.success('Email verified successfully!');
        } else {
          setVerificationStatus('error');
          setErrorMessage(response.data.message || 'Email verification failed.');
        }
      } catch (error) {
        setVerificationStatus('error');
        setErrorMessage(error.response?.data?.message || 'Email verification failed. Please try again.');
        toast.error('Email verification failed');
      }
    };
    
    verifyEmailToken();
  }, [location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-orange-100 to-orange-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 py-4">
          <h2 className="text-2xl font-bold text-center text-white">Email Verification</h2>
        </div>
        
        <div className="p-8 text-center">
          {verificationStatus === 'verifying' && (
            <div>
              <FaSpinner className="animate-spin text-orange-500 text-5xl mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Verifying Your Email...</h3>
              <p className="text-gray-600">Please wait while we confirm your email address.</p>
            </div>
          )}
          
          {verificationStatus === 'success' && (
            <div>
              <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Email Verified Successfully!</h3>
              <p className="text-gray-600 mb-6">Your email has been verified. You can now log in to your account.</p>
              <button
                onClick={() => navigate('/login')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Proceed to Login
              </button>
            </div>
          )}
          
          {verificationStatus === 'error' && (
            <div>
              <FaExclamationTriangle className="text-red-500 text-5xl mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Verification Failed</h3>
              <p className="text-gray-600 mb-6">{errorMessage || 'Unable to verify your email address. The link may be invalid or expired.'}</p>
              <div className="space-y-4">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Back to Login
                </button>
                <p className="text-sm text-gray-500">
                  Need help? Please contact <a href="mailto:support@digidine.com" className="text-orange-600 hover:text-orange-500">support@digidine.com</a>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;