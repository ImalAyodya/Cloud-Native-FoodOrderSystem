import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { 
  FaUtensils, FaCheckCircle, FaExclamationTriangle, 
  FaBan, FaChartPie, FaMapMarkerAlt, FaStar, FaDollarSign
} from 'react-icons/fa';
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend
} from 'recharts';
import RestaurantSidebar from '../../../components/Admin/AminSideBar';

const RestaurantAdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const COLORS = ['#FF6B35', '#4ECDC4', '#FF8B8B', '#1A535C', '#6B0F1A', '#F9C784'];
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5003/api/restaurant/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setDashboardData(response.data.data);
          setError(null);
        } else {
          setError(response.data.message || 'Failed to fetch dashboard data');
        }
      } catch (err) {
        console.error('Error fetching restaurant dashboard data:', err);
        setError(err.response?.data?.message || 'Failed to fetch dashboard data');
        toast.error('Error loading dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen">
        <RestaurantSidebar />
        <div className="flex-1 p-8 ml-64">
          <div className="flex justify-center items-center h-full">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
              <p className="mt-4 text-gray-600 font-medium">Loading restaurant dashboard data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="flex h-screen">
        <RestaurantSidebar />
        <div className="flex-1 p-8 ml-64">
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
    <div className="flex h-screen">
      <RestaurantSidebar />
      <div className="flex-1 overflow-auto p-8 ml-64">
        <Toaster position="top-right" />
        
        {/* Dashboard Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800">Restaurant Management Dashboard</h1>
          <p className="text-gray-500">Overview of all restaurants in the DigiDine platform</p>
        </motion.div>
        
        {/* Stats Overview Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Total Restaurants */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Restaurants</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">
                  {dashboardData?.counts?.totalRestaurants || 0}
                </h3>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-500">
                <FaUtensils size={20} />
              </div>
            </div>
          </div>
          
          {/* Active Restaurants */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Active Restaurants</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">
                  {dashboardData?.counts?.activeRestaurants || 0}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {dashboardData?.counts?.totalRestaurants ? 
                    `${Math.round((dashboardData.counts.activeRestaurants / dashboardData.counts.totalRestaurants) * 100)}% of total` : 
                    '0% of total'}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-500">
                <FaCheckCircle size={20} />
              </div>
            </div>
          </div>
          
          {/* Pending Restaurants */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Pending Restaurants</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">
                  {dashboardData?.counts?.pendingRestaurants || 0}
                </h3>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500">
                <FaExclamationTriangle size={20} />
              </div>
            </div>
          </div>
          
          {/* Suspended Restaurants */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Suspended Restaurants</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">
                  {dashboardData?.counts?.suspendedRestaurants || 0}
                </h3>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-500">
                <FaBan size={20} />
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Cuisine Distribution Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center mb-4">
              <FaChartPie size={20} className="text-orange-500 mr-2" />
              <h2 className="text-xl font-bold text-gray-800">Restaurants by Cuisine</h2>
            </div>
            <div className="h-64">
              {dashboardData?.cuisineStats?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dashboardData.cuisineStats.slice(0, 7)}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 70, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip />
                    <Bar dataKey="count" fill="#FF6B35" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full justify-center items-center">
                  <p className="text-gray-400">No cuisine data available</p>
                </div>
              )}
            </div>
          </motion.div>
          
          {/* Location Distribution Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center mb-4">
              <FaMapMarkerAlt size={20} className="text-blue-500 mr-2" />
              <h2 className="text-xl font-bold text-gray-800">Restaurants by Location</h2>
            </div>
            <div className="h-64">
              {dashboardData?.locationStats?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData.locationStats}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) => entry.name}
                    >
                      {dashboardData.locationStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name, props) => [`${value} restaurants`, props.payload.name]} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full justify-center items-center">
                  <p className="text-gray-400">No location data available</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
        
        {/* Recent and Top Restaurants Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Restaurants */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recently Added Restaurants</h2>
            <div className="divide-y divide-gray-100">
              {dashboardData?.recentRestaurants?.map((restaurant) => (
                <div key={restaurant._id} className="py-3 flex items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg mr-4 overflow-hidden">
                    {restaurant.image ? (
                      <img 
                        src={restaurant.image.startsWith('http') ? restaurant.image : `http://localhost:5003${restaurant.image}`} 
                        alt={restaurant.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/100?text=DigiDine';
                        }} 
                      />
                    ) : (
                      <div className="w-12 h-12 bg-orange-100 flex items-center justify-center">
                        <FaUtensils className="text-orange-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{restaurant.name}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                        restaurant.status === 'active' ? 'bg-green-500' : 
                        restaurant.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></span>
                      <span className="capitalize">{restaurant.status}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(restaurant.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {(!dashboardData?.recentRestaurants || dashboardData.recentRestaurants.length === 0) && (
                <div className="py-4 text-center text-gray-400">
                  No recent restaurants found
                </div>
              )}
            </div>
          </motion.div>
          
          {/* Top Rated Restaurants */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Top Rated Restaurants</h2>
            <div className="divide-y divide-gray-100">
              {dashboardData?.topRatedRestaurants?.map((restaurant) => (
                <div key={restaurant._id} className="py-3 flex items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg mr-4 overflow-hidden">
                    {restaurant.image ? (
                      <img 
                        src={restaurant.image.startsWith('http') ? restaurant.image : `http://localhost:5003${restaurant.image}`} 
                        alt={restaurant.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/100?text=DigiDine';
                        }} 
                      />
                    ) : (
                      <div className="w-12 h-12 bg-orange-100 flex items-center justify-center">
                        <FaUtensils className="text-orange-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{restaurant.name}</p>
                    <div className="flex items-center text-sm">
                      <div className="flex text-yellow-400 mr-1">
                        <FaStar />
                      </div>
                      <span className="text-gray-700 font-medium">{restaurant.rating.toFixed(1)}</span>
                      <span className="mx-2 text-gray-500">•</span>
                      <span className={`capitalize text-gray-500 ${
                        restaurant.status === 'active' ? 'text-green-500' : 
                        restaurant.status === 'pending' ? 'text-yellow-500' : 'text-red-500'
                      }`}>{restaurant.status}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {(!dashboardData?.topRatedRestaurants || dashboardData.topRatedRestaurants.length === 0) && (
                <div className="py-4 text-center text-gray-400">
                  No rated restaurants found
                </div>
              )}
            </div>
          </motion.div>
        </div>
        
        {/* Restaurant List Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">All Restaurants</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  {/* <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th> */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData?.restaurants?.map((restaurant) => (
                  <tr key={restaurant._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md overflow-hidden">
                          {restaurant.image ? (
                            <img 
                              src={restaurant.image.startsWith('http') ? restaurant.image : `http://localhost:5003${restaurant.image}`} 
                              alt={restaurant.name} 
                              className="h-10 w-10 object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/100?text=R';
                              }} 
                            />
                          ) : (
                            <div className="h-10 w-10 bg-orange-100 flex items-center justify-center">
                              <FaUtensils className="text-orange-500" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{restaurant.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <FaStar className="text-yellow-400 mr-1" />
                        {restaurant.rating.toFixed(1)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 truncate max-w-xs">{restaurant.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        restaurant.status === 'active' ? 'bg-green-100 text-green-800' : 
                        restaurant.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {restaurant.status.charAt(0).toUpperCase() + restaurant.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        restaurant.isAvailable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {restaurant.isAvailable ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(restaurant.createdAt).toLocaleDateString()}
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a href={`/restaurant/profile/${restaurant._id}`} className="text-orange-600 hover:text-orange-900 mr-4">
                        View
                      </a>
                      <a href={`/restaurant/dashboard/${restaurant._id}`} className="text-blue-600 hover:text-blue-900">
                        Dashboard
                      </a>
                    </td> */}
                  </tr>
                ))}
                
                {(!dashboardData?.restaurants || dashboardData.restaurants.length === 0) && (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      No restaurants found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
        
        {/* Price Range Distribution */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8"
        >
          <div className="flex items-center mb-4">
            <FaDollarSign size={20} className="text-green-500 mr-2" />
            <h2 className="text-xl font-bold text-gray-800">Restaurants by Price Range</h2>
          </div>
          <div className="h-64">
            {dashboardData?.priceRangeStats?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dashboardData.priceRangeStats.map(item => ({
                    name: item.range === '$' ? 'Budget' : 
                           item.range === '$$' ? 'Moderate' : 
                           item.range === '$$$' ? 'Premium' : 'Luxury',
                    count: item.count,
                    priceRange: item.range
                  }))}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value, name, props) => [`${value} restaurants`, props.payload.name]} />
                  <Legend />
                  <Bar dataKey="count" fill="#4ECDC4" name="Number of Restaurants" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full justify-center items-center">
                <p className="text-gray-400">No price range data available</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RestaurantAdminDashboard;