import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaLock, 
  FaCreditCard, 
  FaExclamationTriangle, 
  FaShieldAlt, 
  FaCheck, 
  FaCcVisa, 
  FaCcMastercard, 
  FaCcAmex, 
  FaCcDiscover,
  FaRegCreditCard 
} from 'react-icons/fa';
import { HiOutlineChip } from 'react-icons/hi';
import { RiSecurePaymentLine } from 'react-icons/ri';
import { SiContactlesspayment } from 'react-icons/si';
import axios from 'axios';

// Enhanced card element styling to match DiigiDine theme
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#424770',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4'
      },
      ':-webkit-autofill': {
        color: '#424770'
      },
      iconColor: '#f97316', // Orange to match theme
    },
    invalid: {
      color: '#e25950',
      iconColor: '#e25950'
    }
  },
  hidePostalCode: true,
  iconStyle: 'solid'
};

const StripePaymentForm = ({ amount, orderData, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [cardError, setCardError] = useState(null);
  const [stripeLoaded, setStripeLoaded] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [secureAnimation, setSecureAnimation] = useState(false);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [cardBrand, setCardBrand] = useState(null);
  const [lastFour, setLastFour] = useState('');
  const [animatePulse, setAnimatePulse] = useState(false);
  
  // Periodically show secure animation
  useEffect(() => {
    const interval = setInterval(() => {
      setSecureAnimation(true);
      setTimeout(() => setSecureAnimation(false), 2000);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Pulse animation for contactless icon
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setAnimatePulse(true);
      setTimeout(() => setAnimatePulse(false), 1000);
    }, 5000);
    return () => clearInterval(pulseInterval);
  }, []);

  // Check if Stripe is properly loaded
  useEffect(() => {
    if (stripe) {
      setStripeLoaded(true);
    } else {
      console.warn("Stripe hasn't loaded yet.");
      
      const timeoutId = setTimeout(() => {
        if (!stripe) {
          console.error("Stripe failed to load within expected time");
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
    if (!orderData || !orderData.customer || !orderData.customer.name) {
      setCardError("Missing order information. Please fill all required fields.");
      onError("Invalid order data");
      setLoading(false);
      return;
    }

    setLoading(true);
    setCardError(null);

    try {
      console.log("Creating payment intent with amount:", Math.round(amount * 100));
      
      // Create payment intent on your backend
      const { data } = await axios.post('http://localhost:5000/api/payment/create-payment-intent', {
        amount: Math.round(amount * 100), // amount in cents
        orderData
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
            name: orderData.customer.name,
            email: orderData.customer.email || ''
          }
        }
      });

      if (result.error) {
        console.error("Payment confirmation error:", result.error);
        setCardError(result.error.message);
        onError(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        console.log("Payment succeeded:", result.paymentIntent);
        // Payment succeeded, place the order
        onSuccess(result.paymentIntent.id);
      } else {
        console.warn("Unexpected payment status:", result.paymentIntent.status);
        setCardError(`Payment status: ${result.paymentIntent.status}`);
        onError(`Unexpected payment status: ${result.paymentIntent.status}`);
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
      
      onError(error.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCardChange = (event) => {
    setCardComplete(event.complete);
    
    // Update card brand and last four digits if available
    if (event.brand) {
      setCardBrand(event.brand);
    }
    
    if (event.value && event.value.postalCode) {
      // For demo purposes only - in real implementation, this would be from Stripe's API
      setLastFour('4242'); // Demo last four digits
    }
    
    if (event.error) {
      setCardError(event.error.message);
    } else {
      setCardError(null);
    }
  };

  // The flip card effect
  const flipCard = () => {
    setCardFlipped(!cardFlipped);
  };

  // Map card brands to their icons
  const getCardIcon = () => {
    switch(cardBrand) {
      case 'visa': return <FaCcVisa />;
      case 'mastercard': return <FaCcMastercard />;
      case 'amex': return <FaCcAmex />;
      case 'discover': return <FaCcDiscover />;
      default: return <FaRegCreditCard />;
    }
  };

  if (!stripeLoaded) {
    return (
      <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 shadow-sm border border-orange-200">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-12 h-12 mb-4 relative">
            <div className="w-12 h-12 border-4 border-t-transparent border-orange-400 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FaCreditCard className="text-orange-500 w-5 h-5" />
            </div>
          </div>
          <p className="text-center text-gray-700 font-medium">Initializing secure payment system...</p>
          <p className="text-center text-gray-500 text-sm mt-2">This will just take a moment</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full"
    >
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-orange-50 shadow-md border border-orange-100">
        {/* Animated security indicators */}
        <AnimatePresence>
          {secureAnimation && (
            <motion.div 
              initial={{ top: -40 }}
              animate={{ top: 0 }}
              exit={{ top: -40 }}
              transition={{ duration: 0.3 }}
              className="absolute left-0 right-0 bg-green-50 border-b border-green-100 py-2 px-4 flex items-center justify-center text-green-600 text-sm font-medium z-10"
            >
              <FaShieldAlt className="mr-2" />
              Secured by 256-bit encryption
            </motion.div>
          )}
        </AnimatePresence>
        
        <form onSubmit={handleSubmit} className="p-6 pt-10">
          <div className="mb-8">
            {/* Virtual Card Display with Flip Effect */}
            <div 
              className="perspective-1000 cursor-pointer mb-6" 
              style={{ perspective: '1000px' }}
              onClick={flipCard}
            >
              <div 
                className="relative w-full max-w-[400px] mx-auto transition-transform duration-500 transform-style-preserve-3d"
                style={{ 
                  transformStyle: 'preserve-3d',
                  transform: cardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  aspectRatio: '1.58/1', // Standard credit card aspect ratio
                }}
              >
                {/* Front of card */}
                <div 
                  className="absolute w-full h-full rounded-xl shadow-lg p-5 backface-hidden"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    background: 'linear-gradient(135deg, #ff8f00 0%, #f97316 40%, #f59e0b 100%)',
                    boxShadow: '0 10px 30px -5px rgba(249, 115, 22, 0.3)'
                  }}
                >
                  {/* Glossy overlay */}
                  <div className="absolute top-0 left-0 right-0 h-1/3 bg-white opacity-10 rounded-t-xl"></div>
                  
                  {/* Background patterns */}
                  <div className="absolute top-0 left-0 w-full h-full">
                    <svg width="100%" height="100%" viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg" className="opacity-20">
                      <path d="M0,50 Q80,20 100,50 T200,50 T300,50 T400,50 V0 H0 Z" fill="white" />
                      <path d="M0,100 Q80,70 100,100 T200,100 T300,100 T400,100 V50 H0 Z" fill="white" opacity="0.5" />
                      <path d="M0,150 Q80,120 100,150 T200,150 T300,150 T400,150 V100 H0 Z" fill="white" opacity="0.3" />
                    </svg>
                  </div>
                  
                  {/* Modern circuit pattern */}
                  <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
                    <div className="absolute top-[20%] right-[10%] w-64 h-64">
                      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="white" strokeWidth="0.5">
                        <circle cx="50" cy="50" r="40" />
                        <circle cx="50" cy="50" r="35" />
                        <circle cx="50" cy="50" r="30" />
                        <path d="M50,10 L50,20 M50,80 L50,90 M10,50 L20,50 M80,50 L90,50" />
                        <path d="M29,29 L37,37 M29,71 L37,63 M71,29 L63,37 M71,71 L63,63" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Hologram effect - more vibrant and visible */}
                  <div className="absolute top-[40%] left-4 w-10 h-10" style={{
                    background: 'linear-gradient(45deg, #ff5757, #8c52ff, #36e2ff, #52ffa8)',
                    borderRadius: '50%',
                    opacity: '0.8',
                    filter: 'blur(2px)'
                  }}></div>
                  
                  {/* Glowing accent lines */}
                  <div className="absolute right-0 top-1/4 w-3/4 h-[0.5px] bg-gradient-to-r from-transparent via-white to-transparent"></div>
                  <div className="absolute right-0 top-3/4 w-1/2 h-[0.5px] bg-gradient-to-r from-transparent via-white to-transparent"></div>
                  
                  {/* Radial gradient overlay */}
                  <div className="absolute top-0 left-0 w-full h-full" style={{
                    background: 'radial-gradient(circle at 75% 30%, rgba(255,255,255,0.15), transparent 60%)'
                  }}></div>
                  
                  <div className="relative h-full flex flex-col justify-between z-10">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div className="relative">
                          <HiOutlineChip className="text-white text-2xl mr-2" style={{ filter: 'drop-shadow(0 0 1px rgba(255,255,255,0.6))' }} />
                          <div className="absolute top-0 left-0 right-0 bottom-0 bg-white opacity-10 rounded-sm blur-[1px]"></div>
                        </div>
                        <motion.div
                          animate={{ 
                            opacity: animatePulse ? [0.6, 1, 0.6] : 0.6,
                            scale: animatePulse ? [1, 1.1, 1] : 1
                          }}
                          transition={{ duration: 1 }}
                        >
                          <SiContactlesspayment className="text-white text-xl" style={{ filter: 'drop-shadow(0 0 1px rgba(255,255,255,0.6))' }} />
                        </motion.div>
                      </div>
                      <div className="flex items-center bg-white bg-opacity-20 px-2 py-1 rounded-md backdrop-blur-sm">
                        <FaLock className="text-white text-xs mr-1" />
                        <span className="text-white text-[10px] font-medium">Secure</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-white opacity-90 text-xs mb-1 font-medium tracking-wider">CARD NUMBER</div>
                      <div className="text-white text-base tracking-widest flex items-center font-medium" style={{ textShadow: '0 0 5px rgba(255,255,255,0.5)' }}>
                        {cardComplete ? 
                          <span>•••• •••• •••• {lastFour || '••••'}</span> :
                          <span>•••• •••• •••• ••••</span>
                        }
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-white opacity-80 text-[10px] mb-0.5 font-medium tracking-wider">CARDHOLDER NAME</div>
                        <div className="text-white text-xs font-medium truncate max-w-[150px]" style={{ textShadow: '0 0 5px rgba(255,255,255,0.3)' }}>
                          {orderData?.customer?.name || 'YOUR NAME'}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="text-white opacity-80 text-[10px] mb-0.5 text-right font-medium tracking-wider">VALID THRU</div>
                        <div className="text-white text-xs font-medium" style={{ textShadow: '0 0 5px rgba(255,255,255,0.3)' }}>
                          {cardComplete ? "**/**" : "MM/YY"}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* DiigiDine logo watermark - more distinctive */}
                  <div 
                    className="absolute bottom-4 right-4 text-white font-bold italic text-sm"
                    style={{ opacity: '0.6', textShadow: '0 0 3px rgba(255,255,255,0.5)' }}
                  >
                    DiigiDine
                  </div>
                  
                  {/* Custom card network logo */}
                  <div 
                    className="absolute top-4 right-4 text-white text-2xl"
                    style={{ filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.5))' }}
                  >
                    {cardBrand ? getCardIcon() : (
                      <div className="flex items-center space-x-1">
                        <FaCcVisa className="text-white" />
                      </div>
                    )}
                  </div>
                  
                  {/* Embossed effect for card numbers */}
                  <div className="absolute bottom-[65px] left-5 right-5 h-[1px] bg-black opacity-5"></div>
                </div>
                
                {/* Back of card */}
                <div 
                  className="absolute w-full h-full rounded-xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 shadow-lg backface-hidden"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  {/* Magnetic stripe */}
                  <div className="w-full h-10 bg-black bg-opacity-80 mt-6"></div>
                  
                  {/* Signature strip */}
                  <div className="mt-6 mr-4 ml-auto w-3/4">
                    <div className="h-8 bg-white bg-opacity-90 rounded-sm flex items-center justify-end px-4">
                      <div className="text-gray-800 tracking-wider font-mono text-sm">CVV</div>
                    </div>
                    <div className="mt-3 text-white text-xs opacity-90 text-right">
                      For security purposes, please enter the verification code
                    </div>
                  </div>
                  
                  {/* Security icon */}
                  <div className="absolute bottom-4 right-4 flex space-x-2 text-white opacity-70">
                    <RiSecurePaymentLine className="text-lg" />
                  </div>
                  
                  {/* DiigiDine watermark */}
                  <div className="absolute bottom-4 left-4 text-white opacity-30 font-bold italic text-sm">
                    DiigiDine Pay
                  </div>
                </div>
              </div>
              <div className="mt-1 text-center text-xs text-gray-500">Click card to flip</div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Card Details
                </label>
                <div 
                  className={`
                    p-4 rounded-xl border-2 transition-all duration-200 bg-white
                    ${cardError 
                      ? 'border-red-300 shadow-sm shadow-red-100' 
                      : cardComplete 
                        ? 'border-green-400 shadow-sm shadow-green-100' 
                        : 'border-gray-200 focus-within:border-orange-400 focus-within:shadow-sm focus-within:shadow-orange-100'
                    }
                  `}
                >
                  <CardElement 
                    options={CARD_ELEMENT_OPTIONS} 
                    onChange={handleCardChange} 
                    className="py-2"
                  />
                </div>
                
                <AnimatePresence mode="wait">
                  {cardError && (
                    <motion.div 
                      key="error"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-2 text-red-600 text-sm flex items-start"
                    >
                      <FaExclamationTriangle className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span>{cardError}</span>
                    </motion.div>
                  )}
                  
                  {!cardError && cardComplete && (
                    <motion.div 
                      key="success"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-green-600 text-sm flex items-start"
                    >
                      <FaCheck className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span>Card information is valid</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <motion.div 
                className="p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100"
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-700">Amount Due</div>
                  <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-amber-500">
                    LKR {amount ? amount.toFixed(2) : '0.00'}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
          
          <div>
            <motion.button
              type="submit"
              disabled={!stripe || loading || !cardComplete}
              className={`
                w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2
                transition-all duration-300
                ${loading || !stripe || !cardComplete
                  ? 'bg-gray-400 cursor-not-allowed text-white' 
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl shadow-orange-200/50'
                }
              `}
              whileHover={{ scale: loading || !cardComplete ? 1 : 1.02 }}
              whileTap={{ scale: loading || !cardComplete ? 1 : 0.98 }}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                  Processing Payment...
                </>
              ) : (
                <>
                  <FaCreditCard className="text-lg" />
                  Pay Securely ${amount ? amount.toFixed(2) : '0.00'}
                </>
              )}
            </motion.button>
            
            <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center">
                <FaLock className="text-gray-400 mr-1" />
                <span>Secure Payment</span>
              </div>
              <span>|</span>
              <span>PCI DSS Compliant</span>
            </div>
          </div>
        </form>
        
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
          <div className="flex flex-wrap justify-center gap-6">
            <FaCcVisa className="text-blue-600 text-3xl" />
            <FaCcMastercard className="text-[#EB001B] text-3xl" />
            <FaCcAmex className="text-blue-500 text-3xl" />
            <FaCcDiscover className="text-orange-500 text-3xl" />
          </div>
          <div className="text-center mt-3 text-xs text-gray-500">
            <p>For testing, use card number: 4242 4242 4242 4242 (any future date, any CVC)</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StripePaymentForm;