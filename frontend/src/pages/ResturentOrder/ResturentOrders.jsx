import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FaSearch, FaFilter, FaSync, FaEye, FaTrash, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RestaurantLayout from '../../components/Restaurant/RestaurantLayout';
import OrderDetails from '../../components/ResturentOrder/ResturentOrderDetails';
import RestaurantCancelOrder from '../../components/ResturentOrder/RestaurantCancelOrder';

const RestaurantOrdersPage = () => {
  const { id } = useParams();
  console.log("Restaurant ID from params:", id); // Add this log

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

  useEffect(() => {
    if (id) {
      console.log("Fetching orders for restaurant ID:", id);
      fetchOrders();
      console.log("Orders fetched successfully:", orders);
    } else {
      console.error("No restaurant ID provided");
      setError("No restaurant ID provided");
      setIsLoading(false);
    }
  }, [id]);

  // Apply filters and search to orders
  useEffect(() => {
    let result = [...orders];
    
    // Apply status filter
    if (filterStatus) {
      result = result.filter(order => order.orderStatus === filterStatus);
    }
    
    // Apply search term
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(order => 
        (order.orderId && order.orderId.toLowerCase().includes(lowercasedSearch)) ||
        (order.customer?.name && order.customer.name.toLowerCase().includes(lowercasedSearch)) ||
        (order.customer?.phone && order.customer.phone.includes(lowercasedSearch))
      );
    }
    
    setFilteredOrders(result);
  }, [orders, searchTerm, filterStatus]);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const requestUrl = `http://localhost:5001/api/orders/restaurant/${id}`;
      console.log("Making request to:", requestUrl);
      
      const response = await axios.get(
        requestUrl,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      console.log("Restaurant orders response:", response.data);
      
      if (response.data.success) {
        setOrders(response.data.orders || []);
        setFilteredOrders(response.data.orders || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching restaurant orders:', err);
      setError(err.message || 'Failed to fetch orders');
      toast.error(`Error loading orders: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (order) => {
    // Format the order for the OrderDetails component
    const formattedOrder = {
      id: order.orderId || 'N/A',
      orderId: order.orderId || 'N/A',
      orderStatus: order.orderStatus || 'Pending',
      statusTimestamps: order.statusTimestamps || {},
      items: Array.isArray(order.items) ? order.items.map((item, index) => ({
        id: item._id || index,
        name: item.name || 'Unknown Item',
        price: item.price || 0,
        quantity: item.quantity || 1,
        category: item.category || 'N/A',
        size: item.size || 'N/A'
      })) : [],
      total: order.totalAmount || 0,
      totalAmount: order.totalAmount || 0,
      deliveryAddress: order.customer?.address || 'No address provided',
      customer: order.customer || { name: 'N/A', email: 'N/A', phone: 'N/A' },
      restaurant: order.restaurant || 'N/A',
      restaurantName: order.restaurantName || 'N/A',
      paymentMethod: order.paymentMethod || 'N/A',
      paymentStatus: order.paymentStatus || 'N/A',
      paymentTransactionId: order.paymentTransactionId || '',
      placedAt: order.placedAt || null,
      date: order.placedAt || null,
      orderNote: order.orderNote || '',
      discount: order.discount || 0,
      promoCode: order.promoCode || '',
      loggedInUserName: order.loggedInUserName || '',
      // Include cancellation data if it exists
      cancellation: order.cancellation || null
    };
    
    console.log("Original order:", order);
    console.log("Formatted order with cancellation:", formattedOrder);
    
    setSelectedOrder(formattedOrder);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      // Show loading toast
      const loadingToast = toast.loading("Updating order status...");
      
      const token = localStorage.getItem('token');
      
      // Make the API call to your existing endpoint
      const response = await axios.put(
        `http://localhost:5001/api/orders/update-status/${orderId}`, 
        { newStatus }, // Note: your controller expects 'newStatus' not 'status'
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Dismiss the loading toast
      toast.dismiss(loadingToast);
      
      if (response.data.success) {
        // Update local state
        const updatedOrders = orders.map(order => {
          if (order.orderId === orderId) {
            return { 
              ...order, 
              orderStatus: newStatus,
              statusTimestamps: {
                ...order.statusTimestamps,
                [newStatus]: new Date()
              }
            };
          }
          return order;
        });
        
        setOrders(updatedOrders);
        
        // Show success message
        toast.success(`Order ${orderId} status updated to ${newStatus}`);
        
        // If we're looking at order details, update the selected order too
        if (selectedOrder && selectedOrder.orderId === orderId) {
          setSelectedOrder({
            ...selectedOrder,
            orderStatus: newStatus
          });
        }
      } else {
        throw new Error(response.data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(`Failed to update status: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    // First confirm with the user
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    try {
      // Show loading toast
      const loadingToast = toast.loading("Deleting order...");
      
      const token = localStorage.getItem('token');
      
      // Make the API call to delete the order
      const response = await axios.delete(
        `http://localhost:5001/api/orders/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Dismiss the loading toast
      toast.dismiss(loadingToast);
      
      if (response.data.success) {
        // Remove the order from local state
        const updatedOrders = orders.filter(order => order.orderId !== orderId);
        setOrders(updatedOrders);
        
        // Close the order details modal if it's open
        if (selectedOrder && selectedOrder.orderId === orderId) {
          setSelectedOrder(null);
        }
        
        // Show success message
        toast.success(`Order ${orderId} has been deleted`);
      } else {
        throw new Error(response.data.message || 'Failed to delete order');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      
      // Show specific error for status-related rejections
      if (error.response && error.response.status === 403) {
        toast.error('Only Completed or Cancelled orders can be deleted');
      } else {
        toast.error(`Failed to delete order: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const handleCancelOrder = (order) => {
    // Only allow cancellation of pending orders
    if (order.orderStatus.toLowerCase() !== 'pending') {
      toast.error('Only pending orders can be cancelled');
      return;
    }
    
    setOrderToCancel(order);
    setShowCancelModal(true);
  };

  const handleCancellationComplete = (orderId) => {
    // Update the orders list by changing the status to 'cancelled'
    const updatedOrders = orders.map(order => {
      if (order.orderId === orderId) {
        return {
          ...order,
          orderStatus: 'Cancelled',
          cancellation: {
            timestamp: new Date(),
            cancelledBy: 'restaurant'
          }
        };
      }
      return order;
    });
    
    setOrders(updatedOrders);
    
    // If we had a selected order and it was the one cancelled, update it too
    if (selectedOrder && selectedOrder.orderId === orderId) {
      setSelectedOrder({
        ...selectedOrder,
        orderStatus: 'Cancelled',
        cancellation: {
          timestamp: new Date(),
          cancelledBy: 'restaurant'
        }
      });
    }
    
    toast.success(`Order ${orderId} has been cancelled`);
  };

  // Get appropriate badge class based on status
  const getStatusBadgeClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready for pickup': return 'bg-purple-100 text-purple-800';
      case 'on the way': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Filter options
  const statusOptions = [
    'All',
    'Pending',
    'Confirmed',
    'Preparing',
    'Ready for Pickup',
    'On the way',
    'Delivered',
    'Cancelled',
    'Failed',
    'Refunded',
    'Completed'
  ];

  const RestaurantOrdersContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="bg-red-50 p-6 rounded-xl text-center">
          <div className="text-red-500 text-center mb-4 text-5xl">⚠️</div>
          <h3 className="text-red-800 font-bold text-xl mb-2">Error Loading Orders</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <button 
            onClick={fetchOrders}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }
    
    return (
      <div>
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Restaurant Orders</h2>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center gap-2 text-sm"
            >
              <FaFilter />
              Filters
            </button>
            
            <button
              onClick={fetchOrders}
              className="px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center gap-2 text-sm"
            >
              <FaSync />
              Refresh
            </button>
          </div>
        </div>
        
        {/* Search and filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search orders by ID or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            
            {filterStatus && (
              <div className="flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-800 rounded-lg">
                <span>Status: {filterStatus}</span>
                <button 
                  onClick={() => setFilterStatus('')}
                  className="text-orange-700 hover:text-orange-900"
                >
                  ×
                </button>
              </div>
            )}
          </div>
          
          {/* Filter dropdown */}
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 bg-gray-50 rounded-lg p-4"
            >
              <h3 className="font-medium text-gray-700 mb-2">Filter by Status</h3>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    className={`px-3 py-1 rounded-full text-sm ${
                      filterStatus === (status === 'All' ? '' : status)
                        ? 'bg-orange-500 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setFilterStatus(status === 'All' ? '' : status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Orders table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order, idx) => (
                    <motion.tr 
                      key={order._id || order.orderId || idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.orderId?.slice(-6) || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          <p className="font-medium">{order.customer?.name || 'N/A'}</p>
                          <p className="text-xs">{order.customer?.phone || 'No phone'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.placedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${order.totalAmount?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.paymentMethod || 'N/A'}
                        <p className="text-xs font-medium" style={{ color: order.paymentStatus === 'Completed' ? '#047857' : '#B45309' }}>
                          {order.paymentStatus || 'Unknown'}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end">
                          <button 
                            onClick={() => handleViewDetails(order)}
                            className="text-orange-600 hover:text-orange-900 mr-3"
                            title="View Details"
                          >
                            <FaEye size={18} />
                          </button>
                          
                          {/* Only show delete button for Completed or Cancelled orders */}
                          {(order.orderStatus === 'Completed' || order.orderStatus === 'Cancelled') && (
                            <button 
                              onClick={() => handleDeleteOrder(order.orderId)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Order"
                            >
                              <FaTrash size={16} />
                            </button>
                          )}

                          {/* Show cancel button for pending orders */}
                          {order.orderStatus.toLowerCase() === 'pending' && (
                            <button 
                              onClick={() => handleCancelOrder(order)}
                              className="text-red-600 hover:text-red-900 mr-2"
                              title="Cancel Order"
                            >
                              <FaTimes size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-xl font-medium mb-1">No orders found</p>
                        <p className="text-gray-400">
                          {searchTerm || filterStatus
                            ? 'Try changing your search or filter criteria'
                            : 'Your restaurant has no orders yet'
                          }
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Order details modal */}
        {selectedOrder && (
          <OrderDetails 
            order={selectedOrder} 
            onClose={() => setSelectedOrder(null)}
            onStatusChange={(id, status) => handleStatusChange(id, status)}
          />
        )}
      </div>
    );
  };

  return (
    <>
      <RestaurantLayout>
        <div className="p-6">
          <RestaurantOrdersContent />
        </div>
      </RestaurantLayout>
      
      {/* Order details modal */}
      {selectedOrder && (
        <OrderDetails 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)}
          onStatusChange={(id, status) => handleStatusChange(id, status)}
        />
      )}
      
      {/* Cancel order modal */}
      <RestaurantCancelOrder
        isOpen={showCancelModal}
        orderId={orderToCancel?.orderId}
        customerName={orderToCancel?.customer?.name}
        onClose={() => {
          setShowCancelModal(false);
          setOrderToCancel(null);
        }}
        onCancelComplete={handleCancellationComplete}
      />
      
      <ToastContainer position="bottom-right" />
    </>
  );
};

export default RestaurantOrdersPage;