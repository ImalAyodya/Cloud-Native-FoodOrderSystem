import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCamera, 
         FaEdit, FaHistory, FaSignOutAlt, FaCheck, FaTimes, 
         FaShieldAlt, FaIdCard, FaClock, FaCalendarAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
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
          
          // Fetch order history if needed
          fetchOrderHistory();
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
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
      const response = await axios.get("http://localhost:5000/api/orders/my-orders", {
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
      <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Profile Header with Cover and Avatar */}
            <div className="relative h-48 bg-gradient-to-r from-orange-500 to-orange-600">
              {/* Decorative elements */}
              <div className="absolute inset-0">
                <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mb-16"></div>
                <div className="absolute left-0 top-0 w-20 h-20 bg-white/10 rounded-full -ml-10 -mt-10"></div>
              </div>
              
              {/* Profile Picture */}
              <div className="absolute bottom-0 left-8 transform translate-y-1/2">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white">
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
              </div>
              
              {/* Edit/Save Actions */}
              <div className="absolute bottom-4 right-4">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-white text-orange-500 px-4 py-2 rounded-full font-medium shadow-md hover:bg-orange-50 transition-colors flex items-center"
                  >
                    <FaEdit className="mr-2" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="space-x-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="bg-white text-gray-600 px-4 py-2 rounded-full font-medium shadow-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="bg-orange-500 text-white px-4 py-2 rounded-full font-medium shadow-md hover:bg-orange-600 transition-colors flex items-center"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <FaCheck className="mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Profile Name and Role */}
            <div className="pt-20 px-8 pb-4 border-b">
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
            </div>
            
            {/* Tab Navigation */}
            <div className="border-b">
              <nav className="-mb-px flex">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`${
                    activeTab === 'info' 
                      ? 'border-orange-500 text-orange-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
                >
                  <FaUser className="inline mr-2" />
                  Personal Info
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`${
                    activeTab === 'orders' 
                      ? 'border-orange-500 text-orange-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
                >
                  <FaHistory className="inline mr-2" />
                  Order History
                </button>
              </nav>
            </div>
            
            {/* Tab Content */}
            <div className="p-8">
              {activeTab === 'info' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Email */}
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <div className="flex items-center mb-4">
                        <div className="bg-orange-100 p-3 rounded-full">
                          <FaEnvelope className="text-orange-500" />
                        </div>
                        <div className="ml-4">
                          <h3 className="font-semibold text-gray-800">Email Address</h3>
                          <p className="text-gray-600">{user?.email}</p>
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
                    </div>
                    
                    {/* Phone */}
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <div className="flex items-center mb-4">
                        <div className="bg-orange-100 p-3 rounded-full">
                          <FaPhone className="text-orange-500" />
                        </div>
                        <div className="ml-4">
                          <h3 className="font-semibold text-gray-800">Phone Number</h3>
                          {!isEditing ? (
                            <p className="text-gray-600">{user?.phoneNo || 'Not provided'}</p>
                          ) : (
                            <input
                              type="tel"
                              name="phoneNo"
                              value={formData.phoneNo}
                              onChange={handleChange}
                              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-orange-500 bg-white"
                              placeholder="+1 (123) 456-7890"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Address */}
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="flex items-center mb-4">
                      <div className="bg-orange-100 p-3 rounded-full">
                        <FaMapMarkerAlt className="text-orange-500" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-semibold text-gray-800">Delivery Address</h3>
                        {!isEditing ? (
                          <p className="text-gray-600">{user?.address || 'No address provided'}</p>
                        ) : (
                          <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-orange-500 bg-white"
                            rows="3"
                            placeholder="Enter your delivery address"
                          ></textarea>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Account Information */}
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="flex items-start">
                      <div className="bg-orange-100 p-3 rounded-full">
                        <FaShieldAlt className="text-orange-500" />
                      </div>
                      <div className="ml-4 flex-grow">
                        <h3 className="font-semibold text-gray-800 mb-3">Account Information</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                          <div className="flex items-center">
                            <FaIdCard className="text-gray-400 mr-2" />
                            <div>
                              <p className="text-xs text-gray-500">User ID</p>
                              <p className="text-sm text-gray-700">{user?._id}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <FaCalendarAlt className="text-gray-400 mr-2" />
                            <div>
                              <p className="text-xs text-gray-500">Joined On</p>
                              <p className="text-sm text-gray-700">{formatDate(user?.createdAt).split(',')[0]}</p>
                            </div>
                          </div>
                          
                          {user?.lastLogin && (
                            <div className="flex items-center">
                              <FaClock className="text-gray-400 mr-2" />
                              <div>
                                <p className="text-xs text-gray-500">Last Login</p>
                                <p className="text-sm text-gray-700">{formatDate(user?.lastLogin)}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Logout button */}
                        <button
                          onClick={handleLogout}
                          className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-500 bg-white hover:bg-red-50 focus:outline-none transition-colors duration-200"
                        >
                          <FaSignOutAlt className="mr-2" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Order History</h3>
                  
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="mt-4 text-gray-500">Loading your orders...</p>
                    </div>
                  ) : orderHistory.length > 0 ? (
                    <div className="bg-white rounded-xl shadow overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurant</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {orderHistory.map((order) => (
                              <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{order.orderId}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.restaurantName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.placedAt).split(',')[0]}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${order.totalAmount?.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(order.orderStatus)}`}>
                                    {order.orderStatus}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-8 text-center rounded-xl">
                      <FaHistory className="text-4xl text-gray-300 mx-auto mb-3" />
                      <h4 className="text-gray-800 font-medium mb-2">No Orders Yet</h4>
                      <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
                      <a href="/" className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 transition-colors">
                        Browse Restaurants
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;