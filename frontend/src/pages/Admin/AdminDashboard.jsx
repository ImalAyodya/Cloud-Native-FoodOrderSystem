import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';
import { 
  FaUsers, FaUtensils, FaShoppingBag, FaMoneyBillWave, 
  FaUserTie, FaMotorcycle, FaCalendarCheck, FaExclamationTriangle,
  FaCheck, FaHourglassHalf, FaTruck, FaClipboardCheck
} from 'react-icons/fa';

import AdminSidebar from '../../components/Admin/AminSideBar';
import OrderStatusChart from '../../components/Admin/Dashboard/OrderStatusChart';
import RevenueChart from '../../components/Admin/Dashboard/RevenueChart';
import RecentOrders from '../../components/Admin/Dashboard/RecentOrders';
import RecentContacts from '../../components/Admin/Dashboard/RecentContacts';

const AdminDashboard = () => {
  // State variables for all dashboard data
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    // User stats
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    usersByRole: {
      customers: 0,
      restaurantOwners: 0,
      deliveryPersons: 0,
      admins: 0
    },
    
    // Restaurant stats
    totalRestaurants: 0,
    activeRestaurants: 0,
    
    // Order stats
    totalOrders: 0,
    ordersByStatus: [],
    recentOrders: [],
    totalRevenue: 0,
    monthlyRevenue: [],
    
    // Contact stats
    pendingContacts: 0,
    recentContacts: []
  });

  // Fetch all data when component mounts
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        // Get authentication token
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        const headers = { Authorization: `Bearer ${token}` };
        
        // Fetch Users Data
        const usersData = await fetchUsersData(headers);
        
        // Fetch Restaurant Data
        const restaurantsData = await fetchRestaurantsData(headers);
        
        // Fetch Orders Data
        const ordersData = await fetchOrdersData(headers);
        
        // Fetch Contacts Data
        const contactsData = await fetchContactsData(headers);
        
        // Combine all data
        setDashboardData({
          ...usersData,
          ...restaurantsData,
          ...ordersData,
          ...contactsData
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error.message || 'Failed to load dashboard data');
        setIsLoading(false);
        toast.error(`Error: ${error.message || 'Failed to load dashboard data'}`);
      }
    };
    
    fetchAllData();
  }, []);

  // Helper function to fetch users data
  const fetchUsersData = async (headers) => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/users', { headers });
      
      if (!response.data.success) {
        throw new Error('Failed to fetch users data');
      }
      
      const users = response.data.users || [];
      
      // Calculate user statistics
      const activeUsers = users.filter(user => user.isActive).length;
      const inactiveUsers = users.filter(user => !user.isActive).length;
      
      const customers = users.filter(user => user.role === 'customer').length;
      const restaurantOwners = users.filter(user => user.role === 'restaurant_owner').length;
      const deliveryPersons = users.filter(user => user.role === 'delivery_person').length;
      const admins = users.filter(user => user.role === 'admin').length;
      
      return {
        totalUsers: users.length,
        activeUsers,
        inactiveUsers,
        usersByRole: {
          customers,
          restaurantOwners,
          deliveryPersons,
          admins
        }
      };
    } catch (error) {
      console.error('Error fetching users data:', error);
      toast.error('Failed to fetch users data');
      return {
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        usersByRole: { customers: 0, restaurantOwners: 0, deliveryPersons: 0, admins: 0 }
      };
    }
  };

  // Helper function to fetch restaurants data
  const fetchRestaurantsData = async (headers) => {
    try {
      const response = await axios.get('http://localhost:5003/api/restaurant/get', { headers });
      
      // Extract restaurants from the response
      // Handle both formats: {restaurants: [...]} or directly [...]
      const restaurants = response.data.restaurants || response.data || [];
      
      // Ensure we're working with an array
      const restaurantsArray = Array.isArray(restaurants) ? restaurants : [];
      
      // Calculate active restaurants 
      const activeRestaurants = restaurantsArray.filter(restaurant => 
        restaurant.isAvailable === true || restaurant.status === 'active'
      ).length;
      
      // Log to debug
      console.log('Restaurants response:', response.data);
      console.log('Extracted restaurants:', restaurantsArray);
      console.log('Active restaurants:', activeRestaurants);
      
      return {
        totalRestaurants: restaurantsArray.length,
        activeRestaurants,
        restaurants: restaurantsArray.slice(0, 5) // Top 5 for display
      };
    } catch (error) {
      console.error('Error fetching restaurants data:', error);
      toast.error('Failed to fetch restaurants data');
      return {
        totalRestaurants: 0,
        activeRestaurants: 0,
        restaurants: []
      };
    }
  };

  // Helper function to fetch orders data
  const fetchOrdersData = async (headers) => {
    try {
      const response = await axios.get('http://localhost:5001/api/orders', { headers });
      
      const orders = response.data || [];
      
      // Make sure orders is an array
      const ordersArray = Array.isArray(orders) ? orders : 
                          (orders.orders && Array.isArray(orders.orders)) ? orders.orders : [];
      
      // Calculate orders by status
      const statusList = [
        'Pending', 'Confirmed', 'Preparing', 'Ready for Pickup', 
        'On the way', 'Delivered', 'Completed', 'Cancelled'
      ];
      
      const ordersByStatus = statusList.map(status => ({
        status,
        count: ordersArray.filter(order => order.orderStatus === status).length
      })).filter(item => item.count > 0);
      
      // Calculate total revenue
      const totalRevenue = ordersArray.reduce((sum, order) => {
        return sum + (Number(order.totalAmount) || 0);
      }, 0);
      
      // Get recent orders
      const recentOrders = [...ordersArray]
        .sort((a, b) => new Date(b.placedAt || b.createdAt) - new Date(a.placedAt || a.createdAt))
        .slice(0, 5);
      
      // Calculate monthly revenue
      const now = new Date();
      const monthlyRevenue = Array(6).fill().map((_, i) => {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = month.toLocaleString('default', { month: 'short' });
        
        const ordersInMonth = ordersArray.filter(order => {
          const orderDate = new Date(order.placedAt || order.createdAt);
          return orderDate.getMonth() === month.getMonth() && 
                 orderDate.getFullYear() === month.getFullYear();
        });
        
        const revenue = ordersInMonth.reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);
        
        return { month: monthName, revenue };
      }).reverse();
      
      return {
        totalOrders: ordersArray.length,
        ordersByStatus,
        recentOrders,
        totalRevenue,
        monthlyRevenue
      };
    } catch (error) {
      console.error('Error fetching orders data:', error);
      toast.error('Failed to fetch orders data');
      return {
        totalOrders: 0,
        ordersByStatus: [],
        recentOrders: [],
        totalRevenue: 0,
        monthlyRevenue: []
      };
    }
  };

  // Helper function to fetch contacts data
  const fetchContactsData = async (headers) => {
    try {
      const response = await axios.get('http://localhost:5000/api/contact', { headers });
      
      if (!response.data.success) {
        throw new Error('Failed to fetch contacts data');
      }
      
      const contacts = response.data.data || [];
      const pendingContacts = contacts.filter(contact => contact.status === 'pending').length;
      
      // Get recent contacts
      const recentContacts = [...contacts]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      
      return {
        pendingContacts,
        recentContacts
      };
    } catch (error) {
      console.error('Error fetching contacts data:', error);
      toast.error('Failed to fetch contacts data');
      return {
        pendingContacts: 0,
        recentContacts: []
      };
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 p-8 lg:ml-64">
          <div className="flex justify-center items-center h-full">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600 font-medium">Loading dashboard data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 p-8 lg:ml-64">
          <div className="flex justify-center items-center h-full">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
              <div className="text-red-500 text-5xl mb-4">
                <FaExclamationTriangle className="mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Dashboard</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 overflow-auto p-8 lg:ml-64">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-500">Welcome to DigiDine Master Control Panel</p>
        </motion.div>

        {/* Key Statistics Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Users Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Users</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">{dashboardData.totalUsers}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  <span className="text-green-500">{dashboardData.activeUsers}</span> active, 
                  <span className="text-red-500 ml-1">{dashboardData.inactiveUsers}</span> inactive
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
                <FaUsers size={20} />
              </div>
            </div>
          </div>

          {/* Restaurants Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Restaurants</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">{dashboardData.totalRestaurants}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  <span className="text-green-500">{dashboardData.activeRestaurants}</span> active restaurants
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-500">
                <FaUtensils size={20} />
              </div>
            </div>
          </div>

          {/* Orders Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Orders</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">{dashboardData.totalOrders}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {dashboardData.ordersByStatus.length > 0 && 
                    <span className="text-yellow-500">
                      {dashboardData.ordersByStatus.find(o => o.status === 'Pending')?.count || 0} pending
                    </span>
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-500">
                <FaShoppingBag size={20} />
              </div>
            </div>
          </div>

          {/* Revenue Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">
                  ${dashboardData.totalRevenue.toFixed(2)}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Lifetime earnings
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-500">
                <FaMoneyBillWave size={20} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* User Role Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Customers */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 mr-3">
                <FaUsers size={16} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Customers</p>
                <p className="text-xl font-bold text-gray-800">{dashboardData.usersByRole.customers}</p>
              </div>
            </div>
          </div>

          {/* Restaurant Owners */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mr-3">
                <FaUserTie size={16} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Restaurant Owners</p>
                <p className="text-xl font-bold text-gray-800">{dashboardData.usersByRole.restaurantOwners}</p>
              </div>
            </div>
          </div>

          {/* Delivery Personnel */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-500 mr-3">
                <FaMotorcycle size={16} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Delivery Personnel</p>
                <p className="text-xl font-bold text-gray-800">{dashboardData.usersByRole.deliveryPersons}</p>
              </div>
            </div>
          </div>

          {/* Admins */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-500 mr-3">
                <FaUserTie size={16} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Administrators</p>
                <p className="text-xl font-bold text-gray-800">{dashboardData.usersByRole.admins}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Order Status Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Pending Orders */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 mr-3">
                <FaHourglassHalf size={16} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending Orders</p>
                <p className="text-xl font-bold text-gray-800">
                  {dashboardData.ordersByStatus.find(o => o.status === 'Pending')?.count || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Confirmed Orders */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 mr-3">
                <FaCheck size={16} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Confirmed Orders</p>
                <p className="text-xl font-bold text-gray-800">
                  {dashboardData.ordersByStatus.find(o => o.status === 'Confirmed')?.count || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Ready for Pickup */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mr-3">
                <FaTruck size={16} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Ready for Pickup</p>
                <p className="text-xl font-bold text-gray-800">
                  {dashboardData.ordersByStatus.find(o => o.status === 'Ready for Pickup')?.count || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Completed */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-500 mr-3">
                <FaClipboardCheck size={16} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed Orders</p>
                <p className="text-xl font-bold text-gray-800">
                  {dashboardData.ordersByStatus.find(o => o.status === 'Completed')?.count || 0}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Order Status Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Orders by Status</h2>
            <div className="h-64">
              <OrderStatusChart data={dashboardData.ordersByStatus} />
            </div>
          </motion.div>

          {/* Revenue Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Monthly Revenue</h2>
            <div className="h-64">
              <RevenueChart data={dashboardData.monthlyRevenue} />
            </div>
          </motion.div>
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
              <a href="/admin/orders" className="text-sm text-orange-500 hover:text-orange-600">View all</a>
            </div>
            <RecentOrders orders={dashboardData.recentOrders} />
          </motion.div>

          {/* Recent Contacts */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Recent Contacts</h2>
              <div className="flex items-center">
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full mr-2">
                  {dashboardData.pendingContacts} pending
                </span>
                <a href="/admin/contacts" className="text-sm text-orange-500 hover:text-orange-600">View all</a>
              </div>
            </div>
            <RecentContacts contacts={dashboardData.recentContacts} />
          </motion.div>
        </div>

        <Toaster position="bottom-right" />
      </div>
    </div>
  );
};

export default AdminDashboard;