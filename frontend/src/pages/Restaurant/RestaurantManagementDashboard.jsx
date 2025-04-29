import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaUtensils, FaStore, FaClipboardList, FaChartLine, FaChartBar } from 'react-icons/fa';
import { MdRestaurantMenu, MdReviews } from 'react-icons/md';
import { motion } from 'framer-motion';
import axios from 'axios';
import RestaurantLayout from '../../components/Restaurant/RestaurantLayout';

const RestaurantManagementDashboardContent = () => {
  const [restaurantData, setRestaurantData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  
  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  useEffect(() => {
    const fetchRestaurantData = async () => {
      setIsLoading(true);
      try {
        // Fetch restaurant details
        const restaurantResponse = await axios.get(`http://localhost:5003/api/restaurant/get/${id}`);
        
        if (!restaurantResponse.data.success) {
          throw new Error('Failed to fetch restaurant data');
        }
        
        const restaurant = restaurantResponse.data.restaurant;
        
        // For a real app, you would fetch these from appropriate endpoints
        // Here we're setting up the structure for the dashboard data
        setRestaurantData({
          name: restaurant.name,
          logo: restaurant.images?.logo || null,
          totalOrders: 0, // Would come from orders API
          pendingOrders: 0, // Would come from orders API
          totalRevenue: 0, // Would come from orders API
          popularItems: [], // Would come from menu items API with analytics
          recentReviews: [], // Would come from reviews API
          id: restaurant._id
        });
        
      } catch (err) {
        console.error('Error fetching restaurant data:', err);
        setError('Failed to load restaurant dashboard. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchRestaurantData();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full p-6">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
          <p className="mt-4 text-gray-600">Loading restaurant dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full p-6">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-500 text-center mb-4 text-5xl">⚠️</div>
          <h2 className="text-2xl font-bold text-center mb-4">Something went wrong</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <div className="flex justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurantData) {
    return (
      <div className="flex justify-center items-center h-full p-6">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <p className="text-xl text-gray-600">Restaurant not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Section */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to your Restaurant Dashboard!</h2>
          <p className="text-gray-600">Here's an overview of {restaurantData.name}</p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
            variants={cardVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Orders Today</h3>
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-500">
                <FaClipboardList />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">--</p>
            <p className="text-xs text-gray-500 mt-2">Connect your orders system to view data</p>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
            variants={cardVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Pending Orders</h3>
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-500">
                <FaClipboardList />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">--</p>
            <p className="text-xs text-gray-500 mt-2">Connect your orders system to view data</p>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
            variants={cardVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Today's Revenue</h3>
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-500">
                <span className="font-bold">$</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">--</p>
            <p className="text-xs text-gray-500 mt-2">Connect your payment system to view data</p>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
            variants={cardVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Customer Rating</h3>
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-500">
                <MdReviews />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">--</p>
            <p className="text-xs text-gray-500 mt-2">Connect your review system to view data</p>
          </motion.div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          className="mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4">Manage Your Restaurant</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to={`/restaurant/profile/${id}`} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center text-orange-500 mr-4">
                <FaStore />
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Restaurant Profile</h4>
                <p className="text-sm text-gray-500">Update your details</p>
              </div>
            </Link>

            <Link to={`/restaurant/${restaurantData.id}/menu`} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-green-500 mr-4">
                <MdRestaurantMenu />
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Menu Items</h4>
                <p className="text-sm text-gray-500">Manage your menu</p>
              </div>
            </Link>

            <Link to="/restaurant/orders" className="bg-white border border-gray-200 rounded-xl p-4 flex items-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-500 mr-4">
                <FaClipboardList />
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Orders</h4>
                <p className="text-sm text-gray-500">View customer orders</p>
              </div>
            </Link>

            <Link to="/restaurant/analytics" className="bg-white border border-gray-200 rounded-xl p-4 flex items-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center text-purple-500 mr-4">
                <FaChartLine />
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Analytics</h4>
                <p className="text-sm text-gray-500">Performance metrics</p>
              </div>
            </Link>
          </div>
        </motion.div>

        {/* Restaurant Data */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {/* Menu Management Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">Your Menu</h3>
                <Link to={`/restaurant/${restaurantData.id}/menu`} className="text-sm text-orange-500 hover:text-orange-600 font-medium">
                  Manage Menu
                </Link>
              </div>
              
              <div className="flex flex-col items-center justify-center h-48 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 mb-2">
                  <FaUtensils />
                </div>
                <p className="text-gray-600 mb-1">No menu items data available yet</p>
                <Link to={`/restaurant/${restaurantData.id}/menu`} className="text-sm text-orange-500 font-medium">
                  Add your first menu item
                </Link>
              </div>
            </div>
          </div>

          {/* Reviews Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">Customer Reviews</h3>
                <Link to="/restaurant/reviews" className="text-sm text-orange-500 hover:text-orange-600 font-medium">
                  View All
                </Link>
              </div>
              
              <div className="flex flex-col items-center justify-center h-48 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mb-2">
                  <MdReviews />
                </div>
                <p className="text-gray-600 mb-1">No reviews available yet</p>
                <p className="text-sm text-gray-500">Reviews will appear here as customers rate your restaurant</p>
              </div>
            </div>
          </div>

          {/* Analytics Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaChartBar className="text-2xl text-blue-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Restaurant Analytics
            </h3>
            <p className="text-gray-600 mb-4">
              View detailed analytics and insights about your restaurant's performance.
            </p>
            <Link
              to={`/restaurant/${restaurantData.id}/analytics`} // Dynamic route
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <FaChartBar className="mr-2" />
              View Analytics
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Main component that wraps the content with the layout
const RestaurantManagementDashboard = () => {
  return (
    <RestaurantLayout>
      <RestaurantManagementDashboardContent />
    </RestaurantLayout>
  );
};

export default RestaurantManagementDashboard;