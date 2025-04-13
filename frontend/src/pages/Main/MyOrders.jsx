import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import { FaBoxOpen, FaSearch } from 'react-icons/fa';
import Header from '../../components/Main/Header';
import Footer from '../../components/Main/Footer';
import OrderCard from '../../components/Order/OrderCard';
import OrderFilter from '../../components/Order/OrderFilter';
import OrderDetails from '../../components/Order/OrderDetails';
import { useOrders } from '../../hooks/useOrders';
import 'react-toastify/dist/ReactToastify.css';

const MyOrders = () => {
  // Existing state and hooks remain unchanged
  const { orders, loading, error } = useOrders();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [animateCards, setAnimateCards] = useState(false);
  const [localOrders, setLocalOrders] = useState([]);

  // Existing useEffect and handler functions remain unchanged
  useEffect(() => {
    if (!loading && orders.length > 0) {
      setAnimateCards(true);
      setLocalOrders(orders);
      console.log('Orders fetched:', orders);
    }
  }, [loading, orders]);

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    setAnimateCards(false);
    setTimeout(() => setAnimateCards(true), 100);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleOrderStatusChange = (orderId, newStatus) => {
    setLocalOrders(prevOrders =>
      prevOrders.map(order =>
        order.orderId === orderId
          ? { ...order, orderStatus: newStatus }
          : order
      )
    );
  };

  // Filtering logic remains unchanged
  const filteredOrders = localOrders.filter(order => {
    const status = order.orderStatus?.toLowerCase() || '';
    const matchesFilter = selectedFilter === 'all' || status === selectedFilter;

    const matchesSearch = searchQuery === '' ||
      order.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderId.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Loading and error components remain unchanged
  const LoadingSkeleton = () => (
    <div className="space-y-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
          <div className="flex justify-between items-start">
            <div>
              <div className="h-5 bg-gray-200 rounded w-40 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="flex justify-between items-end mt-4">
            <div>
              <div className="h-4 bg-gray-200 rounded w-28 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const ErrorDisplay = ({ message }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-50 border border-red-200 rounded-xl p-8 text-center"
    >
      <div className="inline-flex justify-center items-center w-16 h-16 bg-red-100 rounded-full mb-4">
        <FaBoxOpen className="text-red-500 text-2xl" />
      </div>
      <h3 className="text-lg font-bold text-red-800 mb-2">Unable to load orders</h3>
      <p className="text-red-600">{message}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
      >
        Try Again
      </button>
    </motion.div>
  );

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* Updated Hero Section - matches ContactUs page */}
        <section className="relative h-[300px] bg-orange-500">
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="container mx-auto px-4 h-full flex items-center justify-center relative z-10">
            <div className="text-center">
              <motion.h1 
                className="text-4xl md:text-5xl font-bold text-white mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                My Orders
              </motion.h1>
              <motion.p 
                className="text-xl text-white/90 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Track and manage your food delivery orders
              </motion.p>
              
              <motion.div 
                className="mt-6 max-w-md mx-auto relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <input
                  type="text"
                  placeholder="Search by restaurant or order ID..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm placeholder-white/70 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                />
                <FaSearch className="absolute left-3 top-3.5 text-white text-opacity-70" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Main Content Section */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <OrderFilter
              selectedFilter={selectedFilter}
              onFilterChange={handleFilterChange}
            />
          </motion.div>

          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <ErrorDisplay message={error} />
          ) : filteredOrders.length > 0 ? (
            <AnimatePresence>
              {animateCards && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid gap-6 mt-6"
                >
                  {filteredOrders.map((order, index) => (
                    <motion.div
                      key={order._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                    >
                      <OrderCard
                        order={{
                          id: order.orderId,
                          restaurant: order.restaurantName,
                          status: order.orderStatus.toLowerCase(),
                          date: order.placedAt,
                          total: order.totalAmount,
                          items: order.items,
                          deliveryAddress: order.customer.address
                        }}
                        onViewDetails={() => setSelectedOrder(order)}
                        onOrderStatusChange={handleOrderStatusChange}
                        onDelete={(orderId) => {
                          setLocalOrders(prevOrders => prevOrders.filter(o => o.orderId !== orderId));
                        }}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100"
            >
              <div className="inline-flex justify-center items-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <FaBoxOpen className="text-gray-400 text-2xl" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">No orders found</h3>
              <p className="text-gray-500">
                {searchQuery ? 'Try a different search term or filter' : 'You have no orders matching the selected filter'}
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {selectedOrder && (
        <OrderDetails
          order={{
            id: selectedOrder.orderId,
            items: selectedOrder.items,
            total: selectedOrder.totalAmount,
            deliveryAddress: selectedOrder.customer.address,
            orderStatus: selectedOrder.orderStatus,
            statusTimestamps: selectedOrder.statusTimestamps || {},
            restaurant: selectedOrder.restaurantName,
            customer: selectedOrder.customer,
            paymentMethod: selectedOrder.paymentMethod,
            orderNote: selectedOrder.orderNote
          }}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      <Footer />
      <ToastContainer position="bottom-right" />
    </>
  );
};

export default MyOrders;