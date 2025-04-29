import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import CountUp from 'react-countup';
import RestaurantLayout from '../../components/Restaurant/RestaurantLayout';
import axios from 'axios';

const RestaurantAnalyticsDashboard = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({
    totalMenuItems: 0,
    totalOrders: 0,
    totalRevenue: 0,
    revenueData: [],
    menuItemsByCategory: [],
    popularDishes: [],
    cuisineDistribution: [], // Add this default value
    orderTrends: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('week');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5003/api/restaurant/get/${id}`
        );
        setRestaurant(response.data.restaurant);
      } catch (err) {
        setError('Failed to fetch restaurant details');
        console.error(err);
      }
    };

    fetchRestaurantData();
  }, [id]);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      console.log('Fetching analytics for id:', id);
      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://localhost:5003/api/restaurant/${id}/analytics`,
        //   {
        //     params: { timeRange: selectedTimeRange },
        //   }
        );
        console.log('Analytics data:', response.data); // Log the response
        setAnalyticsData(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch analytics data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchAnalyticsData();
    }
  }, [id, selectedTimeRange]);

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];

  const StatCard = ({ title, value, icon, color }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl p-6 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800">
            <CountUp end={value} duration={2} separator="," />
          </h3>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );

  if (isLoading) {
    return (
      <RestaurantLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </RestaurantLayout>
    );
  }

  if (error) {
    return (
      <RestaurantLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="text-red-500 text-xl">{error}</div>
        </div>
      </RestaurantLayout>
    );
  }

  return (
    <RestaurantLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800">
              {restaurant?.name} - Analytics Dashboard
            </h1>
            <p className="text-gray-600">
              Track performance and insights for {restaurant?.name}
            </p>
          </div>
          <div className="mb-6 flex gap-4">
            {['week', 'month', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range)}
                className={`px-4 py-2 rounded-lg ${
                  selectedTimeRange === range
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Menu Items"
              value={analyticsData.totalMenuItems}
              icon={<span className="text-2xl">🍽️</span>}
              color="bg-blue-100 text-blue-600"
            />
            <StatCard
              title="Total Orders"
              value={analyticsData.totalOrders}
              icon={<span className="text-2xl">📦</span>}
              color="bg-green-100 text-green-600"
            />
            <StatCard
              title="Total Revenue"
              value={analyticsData.totalRevenue}
              icon={<span className="text-2xl">💰</span>}
              color="bg-purple-100 text-purple-600"
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow-sm"
            >
              <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#FF6B6B"
                      fill="#FF6B6B"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow-sm"
            >
              <h3 className="text-lg font-semibold mb-4">Menu Items by Category</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {analyticsData.menuItemsByCategory && analyticsData.menuItemsByCategory.length > 0 ? (
                    <PieChart>
                      <Pie
                        data={analyticsData.menuItemsByCategory || []} // Ensure the array is not undefined
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {(analyticsData.menuItemsByCategory || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  ) : (
                    <p className="text-gray-500 text-center">No data available for menu items by category.</p>
                  )}
                </ResponsiveContainer>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow-sm"
            >
              <h3 className="text-lg font-semibold mb-4">Popular Dishes</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.popularDishes || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#4ECDC4" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow-sm"
            >
              <h3 className="text-lg font-semibold mb-4">Cuisine Distribution</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {analyticsData.cuisineDistribution && analyticsData.cuisineDistribution.length > 0 ? (
                    <PieChart>
                      <Pie
                        data={analyticsData.cuisineDistribution || []} // Ensure the array is not undefined
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label
                      >
                        {(analyticsData.cuisineDistribution || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  ) : (
                    <p className="text-gray-500 text-center">No data available for cuisine distribution.</p>
                  )}
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </RestaurantLayout>
  );
};

export default RestaurantAnalyticsDashboard;
