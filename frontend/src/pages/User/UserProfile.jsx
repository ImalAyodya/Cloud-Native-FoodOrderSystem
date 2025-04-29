import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaEdit, FaBan, FaCheck, FaLock } from 'react-icons/fa';
import DashboardSidebar from '../../components/Admin/AminSideBar';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orderHistory, setOrderHistory] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/admin/users/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setUser(response.data.user);
        
        // Fetch order history if available
        if (response.data.user.role === 'customer') {
          fetchOrderHistory(userId);
        }
        
        // Fetch activity logs
        fetchActivityLogs(userId);
      }
    } catch (error) {
      toast.error('Failed to fetch user details');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrderHistory = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/admin/users/${userId}/orders`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setOrderHistory(response.data.orders);
      }
    } catch (error) {
      console.error('Failed to fetch order history:', error);
    }
  };

  const fetchActivityLogs = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/admin/users/${userId}/activity`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setActivityLogs(response.data.activities);
      }
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
    }
  };

  const toggleUserStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/admin/users/${userId}/status`,
        { isActive: !user.isActive },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        toast.success(`User ${!user.isActive ? 'activated' : 'deactivated'} successfully`);
        setUser({...user, isActive: !user.isActive});
      }
    } catch (error) {
      toast.error('Failed to update user status');
      console.error(error);
    }
  };

  const handleResetPassword = async () => {
    if (window.confirm('Are you sure you want to reset this user\'s password?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          `http://localhost:5000/api/admin/users/${userId}/reset-password`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        if (response.data.success) {
          toast.success('Password reset email sent to user');
        }
      } catch (error) {
        toast.error('Failed to reset password');
        console.error(error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-100 ml-40">
        <DashboardSidebar />
        <div className="flex-1 p-10 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen bg-gray-100">
        <DashboardSidebar />
        <div className="flex-1 p-10">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">User Not Found</h2>
            <p className="text-gray-600 mb-6">The user you're looking for doesn't exist or you don't have permission to view it.</p>
            <button
              onClick={() => navigate('/admin/users')}
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg flex items-center mx-auto"
            >
              <FaArrowLeft className="mr-2" />
              Back to User List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <DashboardSidebar />
      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/admin/users')}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <FaArrowLeft className="mr-2" />
            Back to User List
          </button>
          <div className="flex space-x-2">
            <button 
              onClick={() => navigate(`/admin/users/edit/${userId}`)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg flex items-center"
            >
              <FaEdit className="mr-2" />
              Edit User
            </button>
            <button 
              onClick={toggleUserStatus}
              className={`${user.isActive ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'} text-white font-medium py-2 px-4 rounded-lg flex items-center`}
            >
              {user.isActive ? <FaBan className="mr-2" /> : <FaCheck className="mr-2" />}
              {user.isActive ? 'Deactivate User' : 'Activate User'}
            </button>
            <button 
              onClick={handleResetPassword}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg flex items-center"
            >
              <FaLock className="mr-2" />
              Reset Password
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <div className="bg-white rounded-lg shadow">
            <div className="bg-gradient-to-r from-orange-400 to-orange-600 p-6 rounded-t-lg text-white">
              <div className="flex justify-center mb-4">
                <img
                  src={user.avatar || "https://via.placeholder.com/150?text=User"}
                  alt={user.name}
                  className="h-32 w-32 rounded-full border-4 border-white object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/150?text=User";
                  }}
                />
              </div>
              <h2 className="text-2xl font-bold text-center">{user.name}</h2>
              <p className="text-center text-orange-100">{user.email}</p>
              <div className="flex justify-center mt-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500">Role</h3>
                <p className="mt-1 text-lg font-semibold capitalize">{user.role.replace('_', ' ')}</p>
              </div>
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                <p className="mt-1">{user.phoneNo || 'Not provided'}</p>
              </div>
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500">Address</h3>
                <p className="mt-1">{user.address || 'Not provided'}</p>
              </div>
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500">Joined</h3>
                <p className="mt-1">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
              {user.lastLogin && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Last Login</h3>
                  <p className="mt-1">{new Date(user.lastLogin).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order History & Activity Logs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order History - only for customers */}
            {user.role === 'customer' && (
              <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h3 className="text-lg font-medium text-gray-900">Order History</h3>
                </div>
                <div className="p-6">
                  {orderHistory.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No order history found</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {orderHistory.map((order) => (
                            <tr key={order._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.orderId}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.placedAt).toLocaleDateString()}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.totalAmount.toFixed(2)}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  order.orderStatus === 'Completed' ? 'bg-green-100 text-green-800' :
                                  order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                  order.orderStatus === 'Delivered' ? 'bg-blue-100 text-blue-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {order.orderStatus}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Restaurant Information - for restaurant owners */}
            {user.role === 'restaurant_owner' && (
              <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h3 className="text-lg font-medium text-gray-900">Restaurant Information</h3>
                </div>
                <div className="p-6">
                  {/* This would need an API endpoint to get restaurant details by owner ID */}
                  <p className="text-gray-500 text-center py-4">Restaurant details would appear here</p>
                </div>
              </div>
            )}

            {/* Activity Logs */}
            <div className="bg-white rounded-lg shadow">
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="text-lg font-medium text-gray-900">Activity Logs</h3>
              </div>
              <div className="p-6">
                {activityLogs.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No activity logs found</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {activityLogs.map((log, index) => (
                      <li key={index} className="py-3">
                        <div className="flex space-x-3">
                          <div className="flex-1">
                            <p className="text-sm text-gray-800">{log.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;