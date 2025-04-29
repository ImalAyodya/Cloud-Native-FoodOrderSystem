import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';
import { 
  FaUsers, 
  FaUserTie, 
  FaMotorcycle,
  FaUserShield, 
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaUserClock
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

import AdminSidebar from '../../../components/Admin/AminSideBar';
import UserRoleChart from '../../../components/Admin/Dashboard/UserRoleChart';

const UserDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    usersByRole: {
      customers: 0,
      restaurantOwners: 0,
      deliveryPersons: 0,
      admins: 0
    },
    recentUsers: [],
    userActivityStats: {
      todayJoined: 0,
      weekJoined: 0,
      monthJoined: 0
    },
    verificationStats: {
      verified: 0,
      unverified: 0
    }
  });

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        const headers = { Authorization: `Bearer ${token}` };
        
        // Main user data
        const response = await axios.get('http://localhost:5000/api/admin/users?limit=1000', { headers });
        
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
        
        // Calculate users joined today, this week, and this month
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const todayJoined = users.filter(user => 
          new Date(user.createdAt) >= todayStart
        ).length;
        
        const weekJoined = users.filter(user => 
          new Date(user.createdAt) >= weekStart
        ).length;
        
        const monthJoined = users.filter(user => 
          new Date(user.createdAt) >= monthStart
        ).length;
        
        // Calculate verification stats
        const verified = users.filter(user => user.isVerified).length;
        const unverified = users.filter(user => !user.isVerified).length;
        
        // Get recent users (newest first)
        const recentUsers = [...users]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 10);
        
        setDashboardData({
          totalUsers: users.length,
          activeUsers,
          inactiveUsers,
          usersByRole: {
            customers,
            restaurantOwners,
            deliveryPersons,
            admins
          },
          recentUsers,
          userActivityStats: {
            todayJoined,
            weekJoined,
            monthJoined
          },
          verificationStats: {
            verified,
            unverified
          }
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user dashboard data:', error);
        setError(error.message || 'Failed to load dashboard data');
        setIsLoading(false);
        toast.error(`Error: ${error.message || 'Failed to load dashboard data'}`);
      }
    };
    
    fetchUserData();
  }, []);

  // Get role display text with proper formatting
  const formatRole = (role) => {
    if (!role) return 'Unknown';
    
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get date display format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get badge classes based on role
  const getRoleBadgeClass = (role) => {
    switch(role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'restaurant_owner':
        return 'bg-blue-100 text-blue-800';
      case 'delivery_person':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-orange-100 text-orange-800';
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
              <p className="mt-4 text-gray-600 font-medium">Loading user dashboard data...</p>
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
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

  // Prepare data for the chart
  const userRoleChartData = [
    { name: 'Customers', value: dashboardData.usersByRole.customers, color: '#F97316' },
    { name: 'Restaurant Owners', value: dashboardData.usersByRole.restaurantOwners, color: '#3B82F6' },
    { name: 'Delivery Personnel', value: dashboardData.usersByRole.deliveryPersons, color: '#22C55E' },
    { name: 'Admins', value: dashboardData.usersByRole.admins, color: '#A855F7' }
  ].filter(item => item.value > 0);

  return (
    <div className="flex h-screen bg-gray-100 ml-20">
      <AdminSidebar />
      
      <div className="flex-1 overflow-auto p-8 lg:ml-64">
        <Toaster position="bottom-right" />
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800">User Management Dashboard</h1>
          <p className="text-gray-500">Overview of all users in the DigiDine platform</p>
        </motion.div>

        {/* Key User Statistics */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Total Users Card */}
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

          {/* Today's New Users */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Today's New Users</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">{dashboardData.userActivityStats.todayJoined}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  <span className="text-blue-500">{dashboardData.userActivityStats.weekJoined}</span> this week
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-500">
                <FaUserClock size={20} />
              </div>
            </div>
          </div>

          {/* Verified Users */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Verified Users</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">{dashboardData.verificationStats.verified}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  <span className="text-red-500">{dashboardData.verificationStats.unverified}</span> unverified
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-500">
                <FaCheckCircle size={20} />
              </div>
            </div>
          </div>

          {/* Monthly Growth */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">New This Month</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">{dashboardData.userActivityStats.monthJoined}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Users joined in {new Date().toLocaleString('default', { month: 'long' })}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-500">
                <FaCalendarAlt size={20} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* User Role Statistics */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Customers */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mr-3">
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
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 mr-3">
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
                <FaUserShield size={16} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Administrators</p>
                <p className="text-xl font-bold text-gray-800">{dashboardData.usersByRole.admins}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Charts and Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Role Distribution Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">User Role Distribution</h2>
            <div className="h-64">
              {userRoleChartData.length > 0 ? (
                <UserRoleChart data={userRoleChartData} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No data available</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent Users */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Recently Joined Users</h2>
              <Link to="/user/management" className="text-sm text-orange-500 hover:text-orange-600">View all users</Link>
            </div>

            <div className="overflow-hidden">
              {dashboardData.recentUsers.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <p className="text-gray-500">No recent users</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dashboardData.recentUsers.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                {user.avatar ? (
                                  <img src={user.avatar} alt={user.name} className="h-10 w-10 object-cover" />
                                ) : (
                                  <span className="text-gray-500 text-lg">{user.name.charAt(0)}</span>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeClass(user.role)}`}>
                              {formatRole(user.role)}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(user.createdAt)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                            {!user.isVerified && (
                              <span className="px-2 ml-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Unverified
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;