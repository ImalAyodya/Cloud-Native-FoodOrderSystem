import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { 
  FaUser, 
  FaTruck, 
  FaArrowLeft, 
  FaEdit,
  FaMapMarkerAlt, 
  FaMotorcycle, 
  FaPhoneAlt,
  FaEnvelope,
  FaCheckCircle,
  FaSpinner,
  FaStar,
  FaTrophy,
  FaCheck,
  FaTimes,
  FaCar,
  FaIdCard,
  FaCalendarAlt,
  FaHistory
} from 'react-icons/fa';

const DriverProfile = () => {
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deliveryStats, setDeliveryStats] = useState({
    total: 0,
    completed: 0,
    cancelled: 0,
    rating: 0
  });
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    vehicleType: '',
    licensePlate: ''
  });

  useEffect(() => {
    fetchDriverDetails();
  }, []);

  const fetchDriverDetails = async () => {
    try {
      setLoading(true);
      
      // Get driver ID from localStorage
      const userData = JSON.parse(localStorage.getItem('userData'));
      let driverId;
      
      // Try different ways to get the driver ID depending on structure
      if (userData?.id) {
        driverId = userData.id;
      } else if (userData?.user?.id) {
        driverId = userData.user.id;
      } else if (userData?._id) {
        driverId = userData._id;
      } else if (userData?.user?._id) {
        driverId = userData.user._id;
      } else {
        throw new Error('Driver ID not found in stored data');
      }
      
      // Get driver profile from API
      const response = await fetch(`http://localhost:5000/api/users/${driverId}`);
      
      if (!response.ok) {
        // If user API fails, try to construct profile from localStorage
        console.log('Falling back to localStorage data');
        constructProfileFromLocalStorage(userData);
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        setDriver(data.user);
        
        // Initialize form data
        setFormData({
          name: data.user.name || '',
          email: data.user.email || '',
          phone: data.user.phoneNo || '',
          address: data.user.address || '',
          vehicleType: data.user.vehicleType || 'Car',
          licensePlate: data.user.licensePlate || ''
        });
        
        // Fetch delivery stats
        fetchDeliveryStats(driverId);
      } else {
        throw new Error(data.message || 'Failed to fetch driver details');
      }
    } catch (error) {
      console.error('Error fetching driver details:', error);
      toast.error(`Failed to load profile: ${error.message}`);
      setError(error.message);
      
      // Try to use localStorage data as fallback
      try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        constructProfileFromLocalStorage(userData);
      } catch (e) {
        console.error('Failed to use localStorage fallback:', e);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Fallback function to use localStorage data
  const constructProfileFromLocalStorage = (userData) => {
    const user = userData?.user || userData;
    if (user) {
      setDriver({
        _id: user.id || user._id,
        name: user.name || 'Driver',
        email: user.email || 'email@example.com',
        phoneNo: user.phone || user.phoneNo || 'Not provided',
        address: user.address || 'Not provided',
        role: 'delivery_person',
        isActive: true,
        createdAt: new Date().toISOString(),
        vehicleType: user.vehicleType || 'Car',
        licensePlate: user.licensePlate || 'Not provided'
      });
      
      // Initialize form data
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || user.phoneNo || '',
        address: user.address || '',
        vehicleType: user.vehicleType || 'Car',
        licensePlate: user.licensePlate || ''
      });
      
      // Try to fetch delivery stats if possible
      if (user.id || user._id) {
        fetchDeliveryStats(user.id || user._id);
      }
    }
  };
  
  const fetchDeliveryStats = async (driverId) => {
    try {
      // Try to get delivery stats from the API
      const response = await fetch(`http://localhost:5001/api/orders/driver/${driverId}/stats`);
      
      if (!response.ok) {
        console.warn('Could not fetch delivery stats');
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        setDeliveryStats({
          total: data.stats.total || 0,
          completed: data.stats.completed || 0,
          cancelled: data.stats.cancelled || 0,
          rating: data.stats.rating || 0
        });
      }
    } catch (error) {
      console.error('Error fetching delivery stats:', error);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Get user ID from driver object
      const userId = driver._id;
      
      // Make API call to update profile
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phoneNo: formData.phone,
          address: formData.address,
          vehicleType: formData.vehicleType,
          licensePlate: formData.licensePlate
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Update driver state
        setDriver({
          ...driver,
          name: formData.name,
          email: formData.email,
          phoneNo: formData.phone,
          address: formData.address,
          vehicleType: formData.vehicleType,
          licensePlate: formData.licensePlate
        });
        
        toast.success('Profile updated successfully');
        setEditMode(false);
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(`Failed to update profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile information...</p>
        </div>
      </div>
    );
  }

  if (error && !driver) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Profile</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/DeliveryDashboard')}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => fetchDriverDetails()}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/DeliveryDashboard')} 
                className="p-2 rounded-full hover:bg-orange-400 transition-colors"
              >
                <FaArrowLeft />
              </button>
              <div>
                <h1 className="text-2xl font-bold">My Profile</h1>
                <p className="text-sm opacity-90">Manage your personal information</p>
              </div>
            </div>
            <button 
              onClick={() => setEditMode(!editMode)}
              className="px-4 py-2 bg-white text-orange-600 rounded-md hover:bg-orange-50 flex items-center gap-2"
              disabled={loading}
            >
              <FaEdit />
              {editMode ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              {/* Profile Header with Avatar */}
              <div className="bg-gradient-to-r from-orange-400 to-orange-600 p-6 text-white">
                <div className="flex justify-center mb-4">
                  <div className="h-32 w-32 bg-orange-100 rounded-full flex items-center justify-center border-4 border-white">
                    <FaUser size={64} className="text-orange-500" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-center">{driver?.name}</h2>
                <p className="text-center text-orange-100">{driver?.email}</p>
                <div className="flex justify-center mt-2">
                  <span className="px-3 py-1 bg-orange-700 bg-opacity-50 rounded-full text-sm font-medium">
                    Delivery Driver
                  </span>
                </div>
              </div>
              
              {/* Profile Info */}
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-orange-100 rounded-md">
                      <FaPhoneAlt className="text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="font-medium">{driver?.phoneNo || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-orange-100 rounded-md">
                      <FaEnvelope className="text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{driver?.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-orange-100 rounded-md">
                      <FaMapMarkerAlt className="text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium">{driver?.address || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-orange-100 rounded-md">
                      <FaCar className="text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Vehicle Type</p>
                      <p className="font-medium">{driver?.vehicleType || 'Car'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-orange-100 rounded-md">
                      <FaIdCard className="text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">License Plate</p>
                      <p className="font-medium">{driver?.licensePlate || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-orange-100 rounded-md">
                      <FaCalendarAlt className="text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Joined</p>
                      <p className="font-medium">
                        {driver?.createdAt ? new Date(driver.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      driver?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {driver?.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Edit Profile Form or Stats */}
          <div className="lg:col-span-2">
            {editMode ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <h2 className="text-xl font-bold mb-6">Edit Profile Information</h2>
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700 mb-1">
                        Vehicle Type
                      </label>
                      <select
                        id="vehicleType"
                        name="vehicleType"
                        value={formData.vehicleType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="Car">Car</option>
                        <option value="Motorcycle">Motorcycle</option>
                        <option value="Bicycle">Bicycle</option>
                        <option value="Scooter">Scooter</option>
                        <option value="Van">Van</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700 mb-1">
                        License Plate
                      </label>
                      <input
                        type="text"
                        id="licensePlate"
                        name="licensePlate"
                        value={formData.licensePlate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 flex items-center gap-2"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <FaCheck />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {/* Delivery Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <FaTrophy className="text-orange-500" />
                    Delivery Performance
                  </h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="text-3xl font-bold text-blue-500 mb-1">
                        {deliveryStats.total}
                      </div>
                      <div className="text-sm text-gray-500">Total Deliveries</div>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-3xl font-bold text-green-500 mb-1">
                        {deliveryStats.completed}
                      </div>
                      <div className="text-sm text-gray-500">Completed</div>
                    </div>
                    
                    <div className="bg-red-50 p-4 rounded-lg text-center">
                      <div className="text-3xl font-bold text-red-500 mb-1">
                        {deliveryStats.cancelled}
                      </div>
                      <div className="text-sm text-gray-500">Cancelled</div>
                    </div>
                    
                    <div className="bg-yellow-50 p-4 rounded-lg text-center">
                      <div className="text-3xl font-bold text-yellow-500 mb-1 flex items-center justify-center">
                        {deliveryStats.rating.toFixed(1)} <FaStar className="ml-1" size={18} />
                      </div>
                      <div className="text-sm text-gray-500">Rating</div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <div className="bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-orange-500 to-orange-300" 
                        style={{
                          width: `${
                            deliveryStats.total === 0 ? 0 : 
                            (deliveryStats.completed / deliveryStats.total) * 100
                          }%`
                        }}
                      />
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-gray-500">
                      <span>Completion Rate</span>
                      <span>
                        {deliveryStats.total === 0 ? 0 : 
                         Math.round((deliveryStats.completed / deliveryStats.total) * 100)}%
                      </span>
                    </div>
                  </div>
                </motion.div>
                
                {/* Quick Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                      onClick={() => navigate('/driver/my-deliveries')}
                      className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="p-3 bg-blue-100 rounded-full">
                        <FaHistory className="text-blue-500" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium">Delivery History</h3>
                        <p className="text-sm text-gray-500">View all your past deliveries</p>
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => navigate('/DeliveryDashboard')}
                      className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="p-3 bg-green-100 rounded-full">
                        <FaTruck className="text-green-500" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium">Available Orders</h3>
                        <p className="text-sm text-gray-500">Check orders ready for pickup</p>
                      </div>
                    </button>
                  </div>
                </motion.div>
                
                {/* Account Settings */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <h2 className="text-xl font-bold mb-6">Account Settings</h2>
                  
                  <div className="space-y-4">
                    <button 
                      onClick={() => setEditMode(true)}
                      className="flex items-center justify-between w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-md">
                          <FaEdit className="text-orange-500" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-medium">Edit Profile</h3>
                          <p className="text-sm text-gray-500">Update your personal information</p>
                        </div>
                      </div>
                      <FaArrowLeft className="transform rotate-180" />
                    </button>
                    
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to sign out?')) {
                          localStorage.removeItem('userData');
                          toast.success('Logged out successfully');
                          setTimeout(() => {
                            navigate('/login');
                          }, 1000);
                        }
                      }}
                      className="flex items-center justify-between w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-md">
                          <FaTimes className="text-red-500" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-medium">Sign Out</h3>
                          <p className="text-sm text-gray-500">Log out from your account</p>
                        </div>
                      </div>
                      <FaArrowLeft className="transform rotate-180" />
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;