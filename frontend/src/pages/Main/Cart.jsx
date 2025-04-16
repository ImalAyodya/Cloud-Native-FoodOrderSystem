// pages/Cart/Cart.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import Swal from 'sweetalert2';
import { FaShoppingCart, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Header from '../../components/Main/Header';
import Footer from '../../components/Main/Footer';
import CartItem from '../../components/Cart/CartItem';
import OrderSummary from '../../components/Cart/OrderSummary';
import 'react-toastify/dist/ReactToastify.css';

const Cart = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Chicken Burger",
      price: 12.99,
      quantity: 1,
      image: "burger-image-url.jpg"
    },
    {
      id: 2,
      name: "Pepperoni Pizza",
      price: 15.99,
      quantity: 1,
      image: "pizza-image-url.jpg"
    }
  ]);

  const [loading, setLoading] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 5.00;
  const total = subtotal + deliveryFee;

  const updateQuantity = (id, change) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
    toast.success('Cart updated successfully!');
  };

  const removeItem = (id) => {
    Swal.fire({
      title: 'Remove Item?',
      text: "Are you sure you want to remove this item?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f97316',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, remove it',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        setCartItems(items => items.filter(item => item.id !== id));
        toast.success('Item removed from cart');
      }
    });
  };

  const handleCheckout = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Swal.fire({
        title: 'Order Placed!',
        text: 'Your order has been placed successfully.',
        icon: 'success',
        confirmButtonColor: '#f97316'
      });
      setCartItems([]);
    }, 2000);
  };

  return (
    <>
      <Header isNotHome={true} />
      <div className="min-h-screen bg-gray-100 pt-12">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-orange-500 rounded-xl shadow-lg mb-8 p-8 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <motion.h1 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold mb-2"
                >
                  Your Cart
                </motion.h1>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-orange-100"
                >
                  {cartItems.length} items in your cart
                </motion.p>
              </div>
              <Link 
                to="/menu"
                className="flex items-center text-white hover:text-orange-200 transition-colors duration-300"
              >
                <FaArrowLeft className="mr-2" />
                Continue Shopping
              </Link>
            </div>
          </motion.div>

          {cartItems.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-8 md:grid-cols-3"
            >
              <motion.div className="md:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    updateQuantity={updateQuantity}
                    removeItem={removeItem}
                    itemVariants={itemVariants}
                  />
                ))}
              </motion.div>

              <OrderSummary
                subtotal={subtotal}
                deliveryFee={deliveryFee}
                total={total}
                handleCheckout={handleCheckout}
                loading={loading}
                itemVariants={itemVariants}
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl shadow-md p-16 text-center"
            >
              <FaShoppingCart className="text-6xl text-orange-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Your cart is empty
              </h2>
              <p className="text-gray-600 mb-8">
                Looks like you haven't added any items to your cart yet.
              </p>
              <Link to="/menu">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-orange-500 text-white px-8 py-4 rounded-xl
                    font-semibold hover:bg-orange-600 transition-colors duration-300
                    shadow-md hover:shadow-lg text-lg"
                >
                  Browse Menu
                </motion.button>
              </Link>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
      <ToastContainer 
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />
    </>
  );
};

export default Cart;
