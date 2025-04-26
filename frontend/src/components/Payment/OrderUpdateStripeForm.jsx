import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { motion } from 'framer-motion';

const OrderUpdateStripeForm = ({ amount, orderData, onPaymentSuccess, onPaymentError, setProcessing, buttonText }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [cardError, setCardError] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);

  // Check if stripe is loaded every 1 second for 10 seconds
  useEffect(() => {
    if (!stripe) {
      const timeoutId = setTimeout(() => {
        if (!stripe) {
          setCardError("Payment system is taking longer than expected to load. This may be due to security software blocking it.");
        }
      }, 5000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [stripe]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      setCardError("Payment system not loaded yet. Please try again in a moment.");
      return;
    }

    // Basic validation
    if (!orderData || !amount || amount <= 0) {
      setCardError("Invalid order information.");
      onPaymentError("Invalid order data");
      return;
    }

    setLoading(true);
    setProcessing && setProcessing(true);
    setCardError(null);

    try {
      console.log("Creating payment intent with amount:", Math.round(amount * 100));
      
      // Create payment intent on your backend
      const { data } = await axios.post('http://localhost:5000/api/payment/create-payment-intent', {
        amount: Math.round(amount * 100), // amount in cents
        orderData: {
          ...orderData,
          isUpdate: true // Mark this as an update payment
        }
      });
      
      if (!data || !data.clientSecret) {
        throw new Error("Invalid response from payment server");
      }
      
      console.log("Payment intent created successfully");
      const { clientSecret } = data;

      // Confirm card payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: orderData.customer?.name || "Customer",
            email: orderData.customer?.email || ""
          }
        }
      });

      if (result.error) {
        console.error("Payment confirmation error:", result.error);
        setCardError(result.error.message);
        onPaymentError(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        console.log("Payment succeeded:", result.paymentIntent);
        // Payment succeeded
        onPaymentSuccess(result.paymentIntent);
      } else {
        console.warn("Unexpected payment status:", result.paymentIntent.status);
        setCardError(`Payment status: ${result.paymentIntent.status}`);
        onPaymentError(`Unexpected payment status: ${result.paymentIntent.status}`);
      }
    } catch (error) {
      console.error('Payment error:', error);
      
      if (error.message && (
          error.message.includes('Stripe') || 
          error.message.includes('security') || 
          error.message.includes('blocked')
      )) {
        setCardError('Your security software may be blocking Stripe. Please temporarily disable it or add this site to exceptions.');
      } else if (axios.isAxiosError(error)) {
        if (!error.response) {
          setCardError('Network error. Please check your internet connection.');
        } else {
          setCardError(`Server error: ${error.response.data?.message || error.message}`);
        }
      } else {
        setCardError(error.message || 'An unexpected error occurred');
      }
      
      onPaymentError(error.message || 'Payment failed');
    } finally {
      setLoading(false);
      setProcessing && setProcessing(false);
    }
  };

  const handleCardChange = (event) => {
    setCardComplete(event.complete);
    if (event.error) {
      setCardError(event.error.message);
    } else {
      setCardError(null);
    }
  };

  const cardStyle = {
    base: {
      color: "#424770",
      fontFamily: 'Arial, sans-serif',
      fontSize: "16px",
      fontSmoothing: "antialiased",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#dc2626",
      iconColor: "#dc2626",
    },
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Details
        </label>
        <div className="p-4 border border-gray-300 rounded-md bg-white">
          <CardElement 
            options={{ style: cardStyle }} 
            onChange={handleCardChange}
          />
        </div>
      </div>
      
      {cardError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {cardError}
        </div>
      )}

      <motion.button
        type="submit"
        disabled={!stripe || loading || !cardComplete}
        className={`w-full py-3 rounded-lg transition-all flex items-center justify-center ${
          !stripe || loading || !cardComplete 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
        whileHover={stripe && !loading && cardComplete ? { scale: 1.02 } : {}}
        whileTap={stripe && !loading && cardComplete ? { scale: 0.98 } : {}}
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : buttonText || 'Pay Now'}
      </motion.button>
    </form>
  );
};

export default OrderUpdateStripeForm;