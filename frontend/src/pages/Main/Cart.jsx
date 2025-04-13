import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Main/Header';
import Footer from '../../components/Main/Footer';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const stored = sessionStorage.getItem('selectedItems');
    if (stored) {
      setCartItems(JSON.parse(stored));
    }
  }, []);

  const updateQuantity = (index, delta) => {
    const updated = [...cartItems];
    updated[index].quantity = Math.max(1, updated[index].quantity + delta);
    setCartItems(updated);
    sessionStorage.setItem('selectedItems', JSON.stringify(updated));
    toast.info('Quantity updated!', {
      position: 'bottom-right',
      autoClose: 2000,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const removeItem = (index) => {
    Swal.fire({
      title: 'Remove this item?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f97316', // orange
      cancelButtonColor: '#3b82f6', // blue
      confirmButtonText: 'Yes, remove it',
    }).then((result) => {
      if (result.isConfirmed) {
        const updated = cartItems.filter((_, i) => i !== index);
        setCartItems(updated);
        sessionStorage.setItem('selectedItems', JSON.stringify(updated));
        toast.success('Item removed!', {
          position: 'bottom-right',
          autoClose: 2000,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    });
  };

  const getTotal = () =>
    cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);

  const emptyIllustration =
    'https://cdn-icons-png.flaticon.com/512/102/102661.png';

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
            🛒 Your Cart
          </motion.h2>

          {cartItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center justify-center text-center py-20"
            >
              <img src={emptyIllustration} alt="Empty Cart" className="w-28 mb-4" />
              <h3 className="text-2xl font-semibold text-gray-600">Cart is empty</h3>
              <p className="text-sm text-gray-500 mt-2">Start shopping to fill it up.</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {cartItems.map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-between bg-white shadow-md rounded-2xl p-6 border border-gray-200"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-xl border"
                    />
                    <div>
                      <h4 className="font-semibold text-lg text-gray-800">{item.name}</h4>
                      <p className="text-gray-500 text-sm">Size: {item.size}</p>
                      <div className="flex items-center mt-2 gap-2">
                        <button
                          onClick={() => updateQuantity(index, -1)}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold rounded px-3"
                        >
                          -
                        </button>
                        <span className="px-2">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(index, 1)}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold rounded px-3"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-orange-500">
                      ${item.price * item.quantity}
                    </p>
                    <button
                      onClick={() => removeItem(index)}
                      className="text-sm text-red-500 hover:underline mt-3"
                    >
                      Remove
                    </button>
                  </div>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col md:flex-row items-center justify-between mt-10 bg-orange-50 border border-orange-200 rounded-2xl p-6 shadow-md"
              >
                <div className="text-xl font-semibold text-gray-800">
                  Total:{' '}
                  <span className="text-2xl text-orange-600">${getTotal()}</span>
                </div>
                <Link to="/checkout">
                  <button className="mt-4 md:mt-0 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg transition duration-300">
                    Proceed to Checkout
                  </button>
                </Link>
              </motion.div>
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

export default Cart;
