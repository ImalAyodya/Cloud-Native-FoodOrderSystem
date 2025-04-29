import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, 
  FaEdit, FaHistory, FaSignOutAlt, FaCheck, 
  FaTimes, FaCamera, FaShoppingBag, FaClock 
} from 'react-icons/fa';
import Header from '../../components/Main/Header';
import Footer from '../../components/Main/Footer';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phoneNo: '',
    address: '',
    avatar: null
  });
  const [previewUrl, setPreviewUrl] = useState('');
  const [activeTab, setActiveTab] = useState('info');
  const [orderHistory, setOrderHistory] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/login';
          return;
        }
        
        const response = await axios.get("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setUser(response.data.user);
          setFormData({
            name: response.data.user.name || '',
            phoneNo: response.data.user.phoneNo || '',
            address: response.data.user.address || '',
            avatar: null
          });
          setPreviewUrl(response.data.user.avatar || '');
          
          // Fetch order history
          fetchOrderHistory();
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        setError('Failed to load profile data. Please try again.');
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, []);

  const fetchOrderHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get("http://localhost:5001/api/orders/my-orders", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setOrderHistory(response.data.orders || []);
      }
    } catch (error) {
      console.error('Failed to fetch order history:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
      setFormData({ ...formData, avatar: file });
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('phoneNo', formData.phoneNo);
      formDataToSend.append('address', formData.address);
      
      if (formData.avatar) {
        formDataToSend.append('avatar', formData.avatar);
      }

      const response = await axios.put(
        "http://localhost:5000/api/users/me",
        formDataToSend,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data.success) {
        setUser(response.data.user);
        toast.success('Profile updated successfully');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    toast.success('Logged out successfully');
    setTimeout(() => {
      window.location.href = '/login';
    }, 1500);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'delivered': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-indigo-100 text-indigo-800';
      case 'on the way': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Header />
      <ToastContainer position="top-center" autoClose={2000} />
      
      {/* Hero Banner - Similar to Menu page */}
      <section className="relative h-[300px] bg-orange-500">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="container mx-auto px-4 h-full flex items-center justify-center relative z-10">
          <div className="text-center">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              My Profile
            </motion.h1>
            <motion.p 
              className="text-xl text-white/90 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Manage your account details and view your order history
            </motion.p>
          </div>
        </div>
      </section>

      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : error ? (
            <div className="text-center p-8 bg-red-50 rounded-lg text-red-600 max-w-lg mx-auto">
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-xl shadow-md overflow-hidden mb-8"
              >
                {/* Profile Header - More aligned with your app's style */}
                <div className="relative p-6 flex flex-col sm:flex-row items-center gap-6 border-b border-gray-200">
                  {/* Avatar/Profile Image */}
                  <div className="relative">
                    <div className="w-28 h-28 rounded-full border-4 border-orange-100 overflow-hidden">
                      <img 
                        src={previewUrl || "https://via.placeholder.com/150?text=User"} 
                        alt={user?.name || 'User'} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/150?text=User";
                        }}
                      />
                    </div>
                    {isEditing && (
                      <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-orange-500 hover:bg-orange-600 rounded-full p-2 cursor-pointer shadow-md transition-colors duration-200">
                        <FaCamera className="text-white" />
                        <input 
                          id="avatar-upload" 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleFileChange}
                        />
                      </label>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-grow text-center sm:text-left">
                    {!isEditing ? (
                      <h1 className="text-2xl font-bold text-gray-800">{user?.name}</h1>
                    ) : (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="text-2xl font-bold text-gray-800 w-full border-b border-orange-200 focus:outline-none focus:border-orange-500 bg-transparent"
                      />
                    )}
                    <p className="text-orange-500 font-medium capitalize">{user?.role?.replace('_', ' ') || 'Customer'}</p>
                    <div className="mt-2 text-sm text-gray-500">
                      <p className="flex items-center justify-center sm:justify-start">
                        <FaEnvelope className="mr-2" /> {user?.email || 'No email'}
                        {user?.isVerified && (
                          <span className="ml-2 text-xs text-green-500 flex items-center">
                            <FaCheck className="mr-1" /> Verified
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Edit/Save Actions */}
                  <div className="mt-4 sm:mt-0">
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="bg-orange-500 text-white px-4 py-2 rounded-md font-medium hover:bg-orange-600 transition-colors flex items-center"
                      >
                        <FaEdit className="mr-2" />
                        Edit Profile
                      </button>
                    ) : (
                      <div className="space-x-2">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="bg-white border border-gray-300 text-gray-600 px-4 py-2 rounded-md font-medium hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSubmit}
                          disabled={isLoading}
                          className="bg-orange-500 text-white px-4 py-2 rounded-md font-medium hover:bg-orange-600 transition-colors flex items-center"
                        >
                          {isLoading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <FaCheck className="mr-2" />
                              Save
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Tab Navigation */}
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex">
                    <button
                      onClick={() => setActiveTab('info')}
                      className={`${
                        activeTab === 'info' 
                          ? 'border-orange-500 text-orange-600' 
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center`}
                    >
                      <FaUser className="mr-2" />
                      Personal Info
                    </button>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className={`${
                        activeTab === 'orders' 
                          ? 'border-orange-500 text-orange-600' 
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center`}
                    >
                      <FaHistory className="mr-2" />
                      Order History
                    </button>
                  </nav>
                </div>
                
                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === 'info' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Email */}
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h3 className="font-medium text-gray-800 mb-2 flex items-center">
                            <FaEnvelope className="text-orange-500 mr-2" /> Email Address
                          </h3>
                          <p className="text-gray-600">{user?.email}</p>
                          <div className="mt-1">
                            {user?.isVerified ? (
                              <span className="inline-flex items-center text-xs text-green-500">
                                <FaCheck className="mr-1" /> Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-xs text-red-500">
                                <FaTimes className="mr-1" /> Not Verified
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Phone */}
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h3 className="font-medium text-gray-800 mb-2 flex items-center">
                            <FaPhone className="text-orange-500 mr-2" /> Phone Number
                          </h3>
                          {!isEditing ? (
                            <p className="text-gray-600">{user?.phoneNo || 'Not provided'}</p>
                          ) : (
                            <input
                              type="tel"
                              name="phoneNo"
                              value={formData.phoneNo}
                              onChange={handleChange}
                              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              placeholder="Your phone number"
                            />
                          )}
                        </div>
                      </div>
                      
                      {/* Address */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-medium text-gray-800 mb-2 flex items-center">
                          <FaMapMarkerAlt className="text-orange-500 mr-2" /> Delivery Address
                        </h3>
                        {!isEditing ? (
                          <p className="text-gray-600">{user?.address || 'No address provided'}</p>
                        ) : (
                          <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            rows="3"
                            placeholder="Enter your delivery address"
                          ></textarea>
                        )}
                      </div>
                      
                      {/* Account Actions */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-medium text-gray-800 mb-4 flex items-center">
                          <FaUser className="text-orange-500 mr-2" /> Account Actions
                        </h3>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="bg-gray-50 p-3 rounded-md flex-grow">
                            <div className="flex items-center">
                              <FaClock className="text-gray-400 mr-2" />
                              <div>
                                <p className="text-xs text-gray-500">Member since</p>
                                <p className="text-sm text-gray-700">{formatDate(user?.createdAt).split(',')[0]}</p>
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={handleLogout}
                            className="bg-red-50 text-red-500 border border-red-200 px-4 py-2 rounded-md font-medium hover:bg-red-100 transition-colors flex items-center justify-center"
                          >
                            <FaSignOutAlt className="mr-2" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {activeTab === 'orders' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-800 flex items-center">
                          <FaShoppingBag className="text-orange-500 mr-2" /> Your Order History
                        </h3>
                        
                        {orderHistory.length > 0 && (
                          <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                            {orderHistory.length} {orderHistory.length === 1 ? 'order' : 'orders'}
                          </span>
                        )}
                      </div>
                      
                      {orderHistory.length > 0 ? (
                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Restaurant</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {orderHistory.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-4 py-3 text-sm font-medium text-orange-500">{order.orderId || order._id.substring(0, 8)}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{order.restaurantName || 'N/A'}</td>
                                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(order.placedAt || order.createdAt).split(',')[0]}</td>
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900">${order.totalAmount?.toFixed(2) || '0.00'}</td>
                                  <td className="px-4 py-3">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(order.orderStatus)}`}>
                                      {order.orderStatus || 'Processing'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
                          <FaShoppingBag className="text-gray-300 text-4xl mx-auto mb-3" />
                          <h4 className="text-gray-700 font-medium mb-2">No Orders Yet</h4>
                          <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
                          <a href="/" className="inline-flex items-center px-4 py-2 bg-orange-500 text-white font-medium rounded-md hover:bg-orange-600 transition-colors">
                            Browse Restaurants
                          </a>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Profile;