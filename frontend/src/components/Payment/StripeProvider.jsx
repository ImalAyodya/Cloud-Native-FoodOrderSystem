import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import stripePromise from '../../utils/Stripe';
import { FaExclamationCircle } from 'react-icons/fa';

const StripeProvider = ({ children }) => {
  const [stripeError, setStripeError] = useState(null);

  useEffect(() => {
    // Handle error if Stripe fails to load
    stripePromise.catch(error => {
      console.error("Failed to load Stripe:", error);
      setStripeError("Payment system failed to load. Please refresh the page or try again later.");
    });

    // Add this to handle Kaspersky interference
    const handleSecuritySoftwareError = (event) => {
      if (event.message && event.message.includes('Refused to load')) {
        console.warn('Security software may be blocking Stripe. See error:', event.message);
      }
    };

    window.addEventListener('error', handleSecuritySoftwareError);
    return () => window.removeEventListener('error', handleSecuritySoftwareError);
  }, []);

  if (stripeError) {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50 text-red-700 flex items-center">
        <FaExclamationCircle className="text-red-500 mr-3" />
        <div>
          <p className="font-medium">Payment Error</p>
          <p className="text-sm mt-1">{stripeError}</p>
          <p className="text-sm mt-1">If you're using Kaspersky antivirus, please temporarily disable it or add this site to exceptions.</p>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
};

export default StripeProvider;