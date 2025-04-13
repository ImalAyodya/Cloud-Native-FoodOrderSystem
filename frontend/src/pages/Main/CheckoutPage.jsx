import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import Swal from 'sweetalert2';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../../components/Main/Header';
import Footer from '../../components/Main/Footer';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    address: '',
    email: '',
    phone: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('Credit Card'); // Default payment method
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate(); // For redirection

  useEffect(() => {
    // Fetch items from session storage
    const stored = sessionStorage.getItem('selectedItems');
    if (stored) {
      const parsedItems = JSON.parse(stored);
      setCartItems(parsedItems);
      console.log('Fetched items from session storage:', parsedItems); // Log items to console
    }
  }, []);

  const getTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
  };

  const handleCustomerInput = (e) => {
    const { name, value } = e.target;
    setCustomerInfo({ ...customerInfo, [name]: value });
  };

  const groupItemsByRestaurant = () => {
    return cartItems.reduce((grouped, item) => {
      if (!grouped[item.restaurantId]) {
        grouped[item.restaurantId] = {
          restaurantName: item.restaurantName,
          items: [],
        };
      }
      grouped[item.restaurantId].items.push(item);
      return grouped;
    }, {});
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    if (!customerInfo.address || !customerInfo.email || !customerInfo.phone) {
      toast.error('Please fill in all the fields.');
      return;
    }

    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser || !loggedInUser.id || !loggedInUser.name) {
      toast.error('User information is missing. Please log in again.');
      return;
    }

    const groupedItems = groupItemsByRestaurant();

    const orders = Object.keys(groupedItems).map((restaurantId) => {
      const restaurantData = groupedItems[restaurantId];
      const totalAmount = restaurantData.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      return {
        orderId: `DGD-${Date.now()}-${Math.floor(Math.random() * 10000)}`, // Generate unique order ID
        restaurant: restaurantId,
        restaurantName: restaurantData.restaurantName,
        loggedInUser: loggedInUser.id,
        loggedInUserName: loggedInUser.name,
        customer: {
          name: loggedInUser.name, // Use logged-in user's name
          email: customerInfo.email,
          phone: customerInfo.phone,
          address: customerInfo.address,
        },
        items: restaurantData.items.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          category: item.category || 'General', // Default category if not provided
          size: item.size,
        })),
        totalAmount,
        paymentMethod, // Include selected payment method
        orderNote: '', // Optional note
      };
    });

    try {
      setLoading(true); // Show loading screen
      const promises = orders.map((order) =>
        axios.post('http://localhost:5001/api/orders/', order)
      );
      await Promise.all(promises);

      Swal.fire({
        title: 'Order Placed!',
        text: 'Your orders have been placed successfully.',
        icon: 'success',
        confirmButtonColor: '#f97316',
      });

      // Clear cart and reset customer info
      setCartItems([]);
      sessionStorage.removeItem('selectedItems');

      // Redirect to menu page
      navigate('/menu');
    } catch (error) {
      console.error('Error placing orders:', error);
      toast.error('Failed to place orders. Please try again.');
    } finally {
      setLoading(false); // Hide loading screen
    }
  };

  return (
    <>
      <Header isNotHome={true} />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12 px-4">
        <div className="max-w-5xl mx-auto mt-12">
          <motion.h2
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-gray-800 mb-10 text-center"
          >
            🛍️ Checkout
          </motion.h2>

          {loading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <div className="loader border-t-4 border-orange-500 rounded-full w-16 h-16 animate-spin"></div>
              <p className="ml-4 text-lg font-semibold text-gray-700">Placing your order...</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Customer Information</h3>

              <form onSubmit={handlePaymentSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="address" className="text-gray-700">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={customerInfo.address}
                      onChange={handleCustomerInput}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg mt-2"
                      placeholder="1234 Main St"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={customerInfo.email}
                      onChange={handleCustomerInput}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg mt-2"
                      placeholder="johndoe@example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="text-gray-700">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={customerInfo.phone}
                      onChange={handleCustomerInput}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg mt-2"
                      placeholder="(123) 456-7890"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="text-gray-700 font-semibold mb-2 block">Payment Method</label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Credit Card')}
                      className={`px-4 py-2 rounded-lg border ${
                        paymentMethod === 'Credit Card'
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-gray-100 text-gray-700 border-gray-300'
                      }`}
                    >
                      Credit Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Cash on delivery')}
                      className={`px-4 py-2 rounded-lg border ${
                        paymentMethod === 'Cash on delivery'
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-gray-100 text-gray-700 border-gray-300'
                      }`}
                    >
                      Cash on Delivery
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-6">
                  <div className="text-lg font-semibold text-gray-800">
                    Total: <span className="text-2xl text-orange-600">${getTotal()}</span>
                  </div>
                  <button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg transition duration-300"
                  >
                    Place Orders
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
      <ToastContainer
        position="bottom-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};

export default Checkout;