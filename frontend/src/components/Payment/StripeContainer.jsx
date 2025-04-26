import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import OrderUpdateStripeForm from './OrderUpdateStripeForm';

// Load stripe outside of component render to avoid recreating stripe object on every render
const stripePromise = loadStripe('pk_test_51R6qvWGgEvMbvRSODC04sIqooNr7K4aZDGLEGLHfFNDh2Ix6WyygElGZLRLTWf1KNHVWkx87cyQhCJasgyLn2fsh00x96Fewxs');

const StripeContainer = ({ amount, orderData, onPaymentSuccess, onPaymentError, setProcessing, buttonText }) => {
  const [clientSecret, setClientSecret] = useState('');
  
  return (
    <div className="stripe-container">
      <Elements stripe={stripePromise}>
        <OrderUpdateStripeForm
          amount={amount}
          orderData={orderData}
          onPaymentSuccess={onPaymentSuccess}
          onPaymentError={onPaymentError}
          setProcessing={setProcessing}
          buttonText={buttonText}
        />
      </Elements>
    </div>
  );
};

export default StripeContainer;