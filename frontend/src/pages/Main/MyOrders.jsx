import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import Header from '../../components/Main/Header';
import Footer from '../../components/Main/Footer';
import OrderCard from '../../components/Order/OrderCard';
import OrderFilter from '../../components/Order/OrderFilter';
import OrderDetails from '../../components/Order/OrderDetails';
import { useOrders } from '../../hooks/useOrders';
import 'react-toastify/dist/ReactToastify.css';

const MyOrders = () => {
  const { orders, loading, error } = useOrders();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
  };

  const filteredOrders = orders.filter(order => {
    if (selectedFilter === 'all') return true;
    return order.orderStatus.toLowerCase() === selectedFilter;
  });

  if (loading) {
    return (
      <>
        <Header isNotHome={true} />
        <div className="min-h-screen bg-gray-100 pt-28">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">Loading orders...</div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header isNotHome={true} />
        <div className="min-h-screen bg-gray-100 pt-28">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center text-red-500">{error}</div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header isNotHome={true} />
      <div className="min-h-screen bg-gray-100 pt-28">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-orange-500 rounded-xl shadow-lg mb-8 p-8 text-white"
          >
            <h1 className="text-3xl font-bold mb-2">My Orders</h1>
            <p className="text-orange-100">Track and manage your orders</p>
          </motion.div>

          <OrderFilter 
            selectedFilter={selectedFilter} 
            onFilterChange={handleFilterChange}
          />

          {filteredOrders.length > 0 ? (
            <div className="grid gap-6 mt-8">
              {filteredOrders.map(order => (
                <OrderCard
                  key={order._id}
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
                />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="text-gray-500 text-lg">No orders found</p>
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