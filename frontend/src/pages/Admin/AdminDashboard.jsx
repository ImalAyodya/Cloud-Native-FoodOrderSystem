import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { FaShoppingBag, FaUsers, FaUtensils, FaMoneyBillWave, FaStore } from 'react-icons/fa';
import { MdRestaurantMenu } from 'react-icons/md';
import AdminSidebar from '../../components/Admin/AminSideBar';
import OrderStatusChart from '../../components/Admin/Order/OrderStatusChart';
import RevenueChart from '../../components/Admin/Order/RevenueChart';
import RecentOrders from '../../components/Admin/Order/RecentOrders';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    // Orders data
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    deliveredOrders: 0,
    recentOrders: [],
    ordersByStatus: [],
    dailyRevenue: [],

    // Users data
    totalUsers: 0,
    customerUsers: 0,
    restaurantAdmins: 0,
    newUsersToday: 0,

    // Restaurant data
    totalRestaurants: 0,
    activeRestaurants: 0,
    pendingRestaurants: 0,
    totalMenuItems: 0
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // 1. Fetch Orders Data
        const ordersResponse = await fetch('http://localhost:5001/api/orders/', {
          headers
        });

        if (!ordersResponse.ok) {
          throw new Error('Failed to fetch orders data');
        }

        const ordersData = await ordersResponse.json();
        const orders = Array.isArray(ordersData) ? ordersData :
          (ordersData.orders || []);

        // 2. Fetch Users Data - Using the correct endpoint
        const usersResponse = await fetch('http://localhost:5000/api/admin/users', {
          headers
        });

        if (!usersResponse.ok) {
          throw new Error('Failed to fetch users data');
        }

        const usersData = await usersResponse.json();
        const users = usersData.users || [];

        // 3. Fetch Restaurants Data - Using the correct endpoint
        const restaurantsResponse = await fetch('http://localhost:5003/api/restaurant/get');

        if (!restaurantsResponse.ok) {
          throw new Error('Failed to fetch restaurants data');
        }

        const restaurantsData = await restaurantsResponse.json();
        const restaurants = restaurantsData.restaurants || [];

        // 4. Fetch Menu Items Data
        const menuItemsResponse = await fetch('http://localhost:5003/api/menu/get');

        if (!menuItemsResponse.ok) {
          throw new Error('Failed to fetch menu items data');
        }

        const menuItemsData = await menuItemsResponse.json();
        const menuItems = menuItemsData.menuItems || [];

        // Calculate metrics
        // Orders metrics
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const pendingOrders = orders.filter(order => order.orderStatus === 'Pending').length;
        const deliveredOrders = orders.filter(order => order.orderStatus === 'Delivered').length;
        const completedOrders = orders.filter(order => order.orderStatus === 'Completed').length;
        const cancelledOrders = orders.filter(order => order.orderStatus === 'Cancelled').length;

        // Get recent orders - last 5
        const recentOrders = [...orders].sort((a, b) =>
          new Date(b.placedAt || b.createdAt || 0) - new Date(a.placedAt || a.createdAt || 0)
        ).slice(0, 5);

        // Orders by status for pie chart
        const statusList = ['Pending', 'Confirmed', 'Preparing', 'Ready for Pickup',
          'On the way', 'Delivered', 'Cancelled', 'Failed', 'Refunded', 'Completed'];
        const ordersByStatus = statusList.map(status => ({
          status,
          count: orders.filter(order => order.orderStatus === status).length
        })).filter(item => item.count > 0);

        // Daily revenue for the last 7 days
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

        // Users metrics
        const totalUsers = users.length;
        const customerUsers = users.filter(user => user.role === 'customer').length;
        const restaurantAdmins = users.filter(user => user.role === 'restaurant_admin').length;

        // Calculate new users today
        const today = new Date().toISOString().split('T')[0];
        const newUsersToday = users.filter(user => {
          const createdDate = user.createdAt || user.registeredAt;
          return createdDate && new Date(createdDate).toISOString().split('T')[0] === today;
        }).length;

        // Restaurants metrics
        const totalRestaurants = restaurants.length;
        const activeRestaurants = restaurants.filter(restaurant => restaurant.isAvailable && restaurant.status === 'active').length;
        const pendingRestaurants = restaurants.filter(restaurant => restaurant.status === 'pending').length;
        const totalMenuItems = menuItems.length;

        // Update dashboard state
        setDashboardData({
          // Orders data
          totalOrders: orders.length,
          totalRevenue,
          pendingOrders,
          deliveredOrders,
          completedOrders,
          cancelledOrders,
          recentOrders,
          ordersByStatus,
          dailyRevenue,

          // Users data
          totalUsers,
          customerUsers,
          restaurantAdmins,
          newUsersToday,

          // Restaurant data
          totalRestaurants,
          activeRestaurants,
          pendingRestaurants,
          totalMenuItems
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

  // Mock user for sidebar
  const user = {
    name: 'Admin User',
    email: 'admin@digidine.com'
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar user={user} />
        <div className="flex-1 lg:ml-[280px] flex justify-center items-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-t-4 border-orange-500 border-solid rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar user={user} />
        <div className="flex-1 lg:ml-[280px] flex justify-center items-center">
          <div className="bg-white p-8 rounded-xl shadow max-w-md text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
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
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar user={user} />
      <div className="flex-1 overflow-auto lg:ml-[280px]">
        <div className="container mx-auto px-4 py-8">
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

          {/* Main Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            {/* Orders Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">Orders</h3>
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-500">
                  <FaShoppingBag size={18} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800 mb-2">{dashboardData.totalOrders}</p>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-xs text-gray-500">Pending</p>
                  <p className="font-bold text-orange-500">{dashboardData.pendingOrders}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-xs text-gray-500">Completed</p>
                  <p className="font-bold text-green-500">{dashboardData.completedOrders}</p>
                </div>
              </div>
            </div>

            {/* Users Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">Users</h3>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
                  <FaUsers size={18} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800 mb-2">{dashboardData.totalUsers}</p>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-xs text-gray-500">Customers</p>
                  <p className="font-bold text-blue-500">{dashboardData.customerUsers}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-xs text-gray-500">Restaurant Admins</p>
                  <p className="font-bold text-purple-500">{dashboardData.restaurantAdmins}</p>
                </div>
              </div>
            </div>

            {/* Restaurants Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">Restaurants</h3>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-500">
                  <FaStore size={18} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800 mb-2">{dashboardData.totalRestaurants}</p>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-xs text-gray-500">Active</p>
                  <p className="font-bold text-green-500">{dashboardData.activeRestaurants}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-xs text-gray-500">Pending</p>
                  <p className="font-bold text-yellow-500">{dashboardData.pendingRestaurants}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Detailed Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
                  <h3 className="text-3xl font-bold text-gray-800 mt-1">
                    ${dashboardData.totalRevenue.toFixed(2)}
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
                  <p className="text-gray-500 text-sm font-medium">New Users Today</p>
                  <h3 className="text-3xl font-bold text-gray-800 mt-1">{dashboardData.newUsersToday}</h3>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
                  <FaUsers size={20} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Menu Items</p>
                  <h3 className="text-3xl font-bold text-gray-800 mt-1">{dashboardData.totalMenuItems}</h3>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-500">
                  <MdRestaurantMenu size={20} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Delivered Orders</p>
                  <h3 className="text-3xl font-bold text-gray-800 mt-1">{dashboardData.deliveredOrders}</h3>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-500">
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
              
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              
            </motion.div>
          </div>

          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            
          </motion.div>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
};

export default AdminDashboard;