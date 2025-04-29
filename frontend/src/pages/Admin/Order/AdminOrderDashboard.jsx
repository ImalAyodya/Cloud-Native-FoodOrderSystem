import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { FaShoppingBag, FaMoneyBillWave, FaUsers, FaUtensils } from 'react-icons/fa';
import OrdersOverview from '../../../components/Admin/Order/OrdersOverview';
import RecentOrders from '../../../components/Admin/Order/RecentOrders';
import OrderStatusChart from '../../../components/Admin/Order/OrderStatusChart';
import RevenueChart from '../../../components/Admin/Order/RevenueChart';
import AdminSidebar from '../../../components/Admin/AminSideBar';

const AdminOrderDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    recentOrders: [],
    ordersByStatus: [],
    dailyRevenue: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock user for sidebar
  const user = {
    name: 'Admin User',
    email: 'admin@digidine.com'
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch all orders
        const response = await fetch('http://localhost:5001/api/orders/');
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const data = await response.json();
        console.log('API Response:', data); // Debug log to see response structure
        
        // Check if data exists and extract orders array
        // Handle different possible response formats
        let orders = [];
        if (Array.isArray(data)) {
          // If the response is directly an array of orders
          orders = data;
        } else if (data && Array.isArray(data.orders)) {
          // If the response has an 'orders' property that is an array
          orders = data.orders;
        } else if (data && typeof data === 'object') {
          // Try to find any array in the response that might be orders
          const possibleOrdersArray = Object.values(data).find(val => Array.isArray(val));
          if (possibleOrdersArray && possibleOrdersArray.length > 0) {
            orders = possibleOrdersArray;
          } else {
            throw new Error('Could not find orders array in API response');
          }
        } else {
          throw new Error('Invalid data format received from API');
        }
        
        if (!orders.length) {
          console.warn('No orders found in the response');
        }
        
        // Calculate metrics
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const pendingOrders = orders.filter(order => order.orderStatus === 'Pending').length;
        const deliveredOrders = orders.filter(order => order.orderStatus === 'Delivered').length;
        const completedOrders = orders.filter(order => order.orderStatus === 'Completed').length;
        const cancelledOrders = orders.filter(order => order.orderStatus === 'Cancelled').length;
        
        // Get recent orders
        const recentOrders = [...orders].sort((a, b) => 
          new Date(b.placedAt || b.createdAt || 0) - new Date(a.placedAt || a.createdAt || 0)
        ).slice(0, 5);
        
        // Calculate orders by status
        const statusList = ['Pending', 'Confirmed', 'Preparing', 'Ready for Pickup', 
                           'On the way', 'Delivered', 'Cancelled', 'Failed', 'Refunded', 'Completed'];
        
        const ordersByStatus = statusList.map(status => ({
          status,
          count: orders.filter(order => order.orderStatus === status).length
        })).filter(item => item.count > 0);
        
        // Calculate daily revenue for the last 7 days
        const last7Days = Array(7).fill().map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return date.toISOString().split('T')[0];
        }).reverse();
        
        const dailyRevenue = last7Days.map(date => {
          const filteredOrders = orders.filter(order => {
            const orderDate = order.placedAt || order.createdAt;
            return orderDate && new Date(orderDate).toISOString().split('T')[0] === date;
          });
          
          return {
            date,
            revenue: filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
            orders: filteredOrders.length
          };
        });
        
        setDashboardData({
          totalOrders: orders.length,
          totalRevenue,
          pendingOrders,
          deliveredOrders,
          completedOrders,
          cancelledOrders,
          recentOrders,
          ordersByStatus,
          dailyRevenue
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error.message);
        setIsLoading(false);
        toast.error(`Failed to load dashboard data: ${error.message}`);
      }
    };

    fetchDashboardData();
  }, []);

  // Content component to use with sidebar layout
  const DashboardContent = () => (
    <div className="p-6">
      <div className="mb-8">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-3xl font-bold text-gray-800"
        >
          Dashboard
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="text-gray-500"
        >
          Welcome to DigiDine admin dashboard
        </motion.p>
      </div>

      {/* Stats Overview Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Orders</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">{dashboardData.totalOrders}</h3>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-500">
              <FaShoppingBag size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">
                LKR {dashboardData.totalRevenue.toFixed(2)}
              </h3>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-500">
              <FaMoneyBillWave size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Pending Orders</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">{dashboardData.pendingOrders}</h3>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500">
              <FaShoppingBag size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Completed Orders</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">{dashboardData.completedOrders}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
              <FaShoppingBag size={20} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <OrderStatusChart ordersByStatus={dashboardData.ordersByStatus} />
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <RevenueChart dailyRevenue={dashboardData.dailyRevenue} />
        </motion.div>
      </div>

      {/* Orders Overview Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="mb-6"
      >
        <OrdersOverview 
          pendingOrders={dashboardData.pendingOrders}
          deliveredOrders={dashboardData.deliveredOrders}
          completedOrders={dashboardData.completedOrders}
          cancelledOrders={dashboardData.cancelledOrders}
        />
      </motion.div>

      {/* Recent Orders Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <RecentOrders orders={dashboardData.recentOrders} />
      </motion.div>

      <Toaster position="bottom-right" />
    </div>
  );

  // Loading state component
  if (isLoading) {
    return (
      <div className="flex h-screen">
        <AdminSidebar user={user} />
        <div className="flex-1 lg:ml-[280px]">
          <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 font-medium">Loading dashboard data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state component
  if (error) {
    return (
      <div className="flex h-screen">
        <AdminSidebar user={user} />
        <div className="flex-1 lg:ml-[280px]">
          <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center p-8 bg-white rounded-xl shadow-md max-w-md mx-4">
              <div className="text-red-500 text-5xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Failed to Load Dashboard</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard with sidebar
  return (
    <div className="flex h-screen">
      <AdminSidebar user={user} />
      <div className="flex-1 overflow-auto lg:ml-[280px]">
        <DashboardContent />
      </div>
    </div>
  );
};

export default AdminOrderDashboard;