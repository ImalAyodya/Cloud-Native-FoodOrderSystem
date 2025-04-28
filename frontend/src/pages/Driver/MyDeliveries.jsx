import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { 
  FaTruck, 
  FaCheckCircle, 
  FaArrowLeft, 
  FaSpinner, 
  FaClock,
  FaSearch,
  FaFilter
} from 'react-icons/fa';

const MyDeliveries = () => {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, completed
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const fetchDeliveries = async () => {
      setLoading(true);
      try {
        // Get user data from local storage
        const rawUserData = localStorage.getItem('userData');
        console.log("Raw user data from localStorage:", rawUserData);
        
        // Parse the data and log for debugging
        let userData;
        try {
          userData = JSON.parse(rawUserData);
          console.log("Parsed userData:", userData);
        } catch (parseError) {
          console.error("Error parsing userData from localStorage:", parseError);
          throw new Error("Invalid user data format");
        }
        
        // Check all possible structures for the driver ID
        let driverId;
        if (userData?.id) {
          // Structure: {id: "123"}
          driverId = userData.id;
        } else if (userData?.user?.id) {
          // Structure: {user: {id: "123"}}
          driverId = userData.user.id;
        } else if (userData?._id) {
          // Structure: {_id: "123"}
          driverId = userData._id;
        } else if (userData?.user?._id) {
          // Structure: {user: {_id: "123"}}
          driverId = userData.user._id;
        } else {
          console.error("Could not find driver ID in userData:", userData);
          throw new Error('User ID not found');
        }
        
        console.log("Using driver ID:", driverId);
        
        // Fetch orders assigned to this driver
        const response = await fetch(`http://localhost:5001/api/orders/driver/${driverId}`);
        
        // Rest of your code remains the same...
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Deliveries data:", data);
        
        if (data.success && data.orders) {
          // Sort deliveries by date (newest first)
          const sortedDeliveries = data.orders.sort((a, b) => 
            new Date(b.placedAt || b.date) - new Date(a.placedAt || a.date)
          );
          
          setDeliveries(sortedDeliveries);
        } else {
          setDeliveries([]);
        }
      } catch (error) {
        console.error("Error fetching deliveries:", error);
        setError(error.message);
        toast.error(`Failed to fetch deliveries: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDeliveries();
  }, []);
  
  // Filter deliveries based on status and search term
  const filteredDeliveries = deliveries.filter(delivery => {
    // Filter by status
    if (filter === 'active' && !['On the way', 'Ready for Pickup'].includes(delivery.orderStatus)) {
      return false;
    }
    if (filter === 'completed' && delivery.orderStatus !== 'Delivered' && delivery.orderStatus !== 'Completed') {
      return false;
    }
    
    // Filter by search term (order ID, restaurant name or address)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        delivery.orderId.toLowerCase().includes(searchLower) || 
        delivery.restaurantName.toLowerCase().includes(searchLower) ||
        delivery.customer?.address?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });
  
  // Format date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };
  
  // Get appropriate status color
  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Delivered':
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'On the way':
        return 'bg-blue-100 text-blue-800';
      case 'Ready for Pickup':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Continue delivery functionality
  const handleContinueDelivery = (delivery) => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    navigate(`/driver/delivery/${userData.user.id}/${delivery.orderId}`);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/DeliveryDashboard')} 
                className="p-2 rounded-full hover:bg-orange-400 transition-colors"
              >
                <FaArrowLeft />
              </button>
              <div>
                <h1 className="text-2xl font-bold">My Deliveries</h1>
                <p className="text-sm opacity-90">View your delivery history</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Filters and Search */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex gap-2">
              <button 
                onClick={() => setFilter('all')} 
                className={`px-4 py-2 rounded-md ${
                  filter === 'all' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                All Orders
              </button>
              <button 
                onClick={() => setFilter('active')} 
                className={`px-4 py-2 rounded-md ${
                  filter === 'active' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Active
              </button>
              <button 
                onClick={() => setFilter('completed')} 
                className={`px-4 py-2 rounded-md ${
                  filter === 'completed' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Completed
              </button>
            </div>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Search deliveries..."
                className="pl-10 pr-4 py-2 border rounded-md w-full md:w-80"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
        </div>
        
        {/* Deliveries List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FaSpinner className="animate-spin text-4xl text-orange-500 mb-3" />
            <p className="text-gray-500">Loading your delivery history...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 p-6 rounded-lg text-center">
            <p className="text-red-700">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Retry
            </button>
          </div>
        ) : filteredDeliveries.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
              <FaTruck className="text-4xl text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">No deliveries found</h3>
            <p className="text-gray-500 mb-4">
              {filter !== 'all' 
                ? `You don't have any ${filter} deliveries yet.` 
                : searchTerm 
                  ? 'No deliveries match your search.' 
                  : 'Start accepting orders to see your delivery history here.'}
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
              >
                Show All Deliveries
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDeliveries.map(delivery => (
              <motion.div
                key={delivery.orderId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-4 md:p-6">
                  <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-lg">Order #{delivery.orderId}</h3>
                        <span className={`text-xs px-3 py-1 rounded-full ${getStatusBadgeClass(delivery.orderStatus)}`}>
                          {delivery.orderStatus}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                        <FaClock className="text-xs" />
                        <span>{formatDate(delivery.placedAt || delivery.date)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-lg">${delivery.totalAmount?.toFixed(2)}</div>
                      <div className="text-sm text-gray-600">{delivery.paymentMethod}</div>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm font-medium text-gray-500">Restaurant</div>
                      <div>{delivery.restaurantName}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Customer</div>
                      <div>{delivery.customer.name}</div>
                      <div className="text-sm text-gray-600">{delivery.customer.phone}</div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-500">Delivery Address</div>
                    <div className="text-gray-700">{delivery.customer.address}</div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mt-4">
                    {['On the way', 'Ready for Pickup'].includes(delivery.orderStatus) && (
                      <button
                        onClick={() => handleContinueDelivery(delivery)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
                      >
                        <FaTruck /> Continue Delivery
                      </button>
                    )}
                    
                    {delivery.orderStatus === 'Delivered' && (
                      <div className="flex items-center gap-2 text-green-600">
                        <FaCheckCircle />
                        <span>Successfully Delivered</span>
                      </div>
                    )}
                    
                    <button
                      onClick={() => navigate(`/order/${delivery.orderId}`)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {/* Stats Summary */}
        {!loading && !error && deliveries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-white rounded-lg shadow-md p-6"
          >
            <h3 className="font-medium text-lg mb-4">Delivery Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-orange-500 mb-1">
                  {deliveries.length}
                </div>
                <div className="text-sm text-gray-500">Total Deliveries</div>
              </div>
              
              <div className="border rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-500 mb-1">
                  {deliveries.filter(d => 
                    d.orderStatus === 'Delivered' || d.orderStatus === 'Completed'
                  ).length}
                </div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
              
              <div className="border rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-500 mb-1">
                  {deliveries.filter(d => 
                    d.orderStatus === 'On the way' || d.orderStatus === 'Ready for Pickup'
                  ).length}
                </div>
                <div className="text-sm text-gray-500">Active</div>
              </div>
              
              <div className="border rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-red-500 mb-1">
                  {deliveries.filter(d => d.orderStatus === 'Cancelled').length}
                </div>
                <div className="text-sm text-gray-500">Cancelled</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MyDeliveries;