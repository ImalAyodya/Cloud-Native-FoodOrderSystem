import React, { useEffect, useRef, useState } from 'react';

const SecureStripeFrame = ({ amount, orderId, onSuccess, onError }) => {
  const iframeRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleMessage = (event) => {
      // Only accept messages from your expected origin
      if (event.origin !== window.location.origin) return;

      const { type, payload } = event.data;
      
      if (type === 'payment-success') {
        setLoading(false);
        onSuccess(payload.paymentIntentId);
      } else if (type === 'payment-error') {
        setLoading(false);
        setError(payload.message);
        onError(payload.message);
      } else if (type === 'frame-loaded') {
        setLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSuccess, onError]);

  // Create a basic payment form HTML
  const secureFrameHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Secure Payment</title>
      <script src="https://js.stripe.com/v3/"></script>
      <style>
        * {
          box-sizing: border-box;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }
        body {
          margin: 0;
          padding: 0;
        }
        .form-container {
          padding: 1rem;
        }
        #payment-form {
          width: 100%;
        }
        .card-element {
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: white;
          margin-bottom: 16px;
        }
        #submit-button {
          width: 100%;
          padding: 12px;
          background: #f97316;
          color: white;
          font-weight: 600;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s;
        }
        #submit-button:hover {
          background: #ea580c;
        }
        #submit-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
        .error {
          color: #dc2626;
          font-size: 0.875rem;
          margin-top: 8px;
        }
      </style>
    </head>
    <body>
      <div class="form-container">
        <form id="payment-form">
          <div id="card-element" class="card-element"></div>
          <div id="card-errors" class="error" role="alert"></div>
          <button id="submit-button" type="submit">
            Pay $${(amount / 100).toFixed(2)}
          </button>
        </form>
      </div>
      
      <script>
        const stripe = Stripe('${process.env.STRIPE_PUBLIC_KEY || 'pk_test_51R6qvWGgEvMbvRSODC04sIqooNr7K4aZDGLEGLHfFNDh2Ix6WyygElGZLRLTWf1KNHVWkx87cyQhCJasgyLn2fsh00x96Fewxs'}');
        const elements = stripe.elements();
        const cardElement = elements.create('card');
        
        cardElement.mount('#card-element');
        
        window.parent.postMessage({ type: 'frame-loaded' }, '*');
        
        const form = document.getElementById('payment-form');
        const errorElement = document.getElementById('card-errors');
        const submitButton = document.getElementById('submit-button');
        
        cardElement.on('change', function(event) {
          if (event.error) {
            errorElement.textContent = event.error.message;
          } else {
            errorElement.textContent = '';
          }
        });
        
        form.addEventListener('submit', async function(event) {
          event.preventDefault();
          
          submitButton.disabled = true;
          submitButton.textContent = 'Processing...';
          
          try {
            // Replace with your actual backend API
            const response = await fetch('/api/payment/create-payment-intent', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                amount: ${amount},
                orderId: '${orderId}'
              }),
            });
            
            const data = await response.json();
            
            if (!data.clientSecret) {
              throw new Error('Failed to create payment intent');
            }
            
            const result = await stripe.confirmCardPayment(data.clientSecret, {
              payment_method: {
                card: cardElement,
              }
            });
            
            if (result.error) {
              throw result.error;
            }
            
            window.parent.postMessage({
              type: 'payment-success',
              payload: { paymentIntentId: result.paymentIntent.id }
            }, '*');
          } catch (error) {
            errorElement.textContent = error.message || 'Payment failed';
            submitButton.disabled = false;
            submitButton.textContent = 'Pay $${(amount / 100).toFixed(2)}';
            
            window.parent.postMessage({
              type: 'payment-error', 
              payload: { message: error.message || 'Payment failed' }
            }, '*');
          }
        });
      </script>
    </body>
    </html>
  `;

  // Create a blob URL to load the HTML in an iframe
  const createBlobURL = () => {
    const blob = new Blob([secureFrameHTML], { type: 'text/html' });
    return URL.createObjectURL(blob);
  };

  return (
    <div className="w-full">
      {loading && (
        <div className="p-4 text-center">
          <div className="inline-block w-6 h-6 border-2 border-t-transparent border-gray-300 rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-600">Loading payment form...</p>
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600 mb-4">
          {error}
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        src={createBlobURL()}
        className="w-full h-[300px] border-0 overflow-hidden"
        title="Secure Payment Form"
        sandbox="allow-scripts allow-forms allow-same-origin"
      />
    </div>
  );
};

export default SecureStripeFrame;