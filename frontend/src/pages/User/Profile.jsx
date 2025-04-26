import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCamera, FaEdit, FaHistory, FaSignOutAlt } from 'react-icons/fa';

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

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setUser(response.data.user);
          setFormData({
            name: response.data.user.name,
            phoneNo: response.data.user.phoneNo,
            address: response.data.user.address,
            avatar: null
          });
          setPreviewUrl(response.data.user.avatar || '');
        }
      } catch (error) {
        toast.error('Failed to load profile data');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
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
        `${process.env.REACT_APP_API_URL}/api/users/update-profile`,
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
      toast.error(error.response?.data?.message || 'Failed to update profile');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="relative h-48 bg-gradient-to-r from-orange-400 to-orange-600">
            {/* Profile Picture */}
            <div className="absolute bottom-0 left-8 transform translate-y-1/2">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white">
                  <img 
                    src={previewUrl || "https://via.placeholder.com/150?text=User"} 
                    alt={user?.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/150?text=User";
                    }}
                  />
                </div>
                {isEditing && (
                  <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-orange-500 hover:bg-orange-600 rounded-full p-2 cursor-pointer">
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
            
            {/* Actions */}
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
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Profile Name and Role */}
          <div className="pt-16 px-8 pb-4 border-b">
            {!isEditing ? (
              <h1 className="text-2xl font-bold text-gray-800">{user?.name}</h1>
            ) : (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="text-2xl font-bold text-gray-800 w-full border-b border-orange-200 focus:outline-none focus:border-orange-500"
              />
            )}
            <p className="text-orange-500 font-medium capitalize">{user?.role.replace('_', ' ')}</p>
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
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email */}
                  <div>
                    <div className="flex items-center mb-2">
                      <FaEnvelope className="text-orange-400 mr-2" />
                      <label className="text-sm font-medium text-gray-600">Email</label>
                    </div>
                    <p className="text-gray-800">{user?.email}</p>
                    {user?.isVerified ? (
                      <span className="text-xs text-green-500">Verified</span>
                    ) : (
                      <span className="text-xs text-red-500">Not Verified</span>
                    )}
                  </div>
                  
                  {/* Phone */}
                  <div>
                    <div className="flex items-center mb-2">
                      <FaPhone className="text-orange-400 mr-2" />
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                    </div>
                    {!isEditing ? (
                      <p className="text-gray-800">{user?.phoneNo}</p>
                    ) : (
                      <input
                        type="tel"
                        name="phoneNo"
                        value={formData.phoneNo}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                      />
                    )}
                  </div>
                  
                  {/* Address */}
                  <div className="md:col-span-2">
                    <div className="flex items-center mb-2">
                      <FaMapMarkerAlt className="text-orange-400 mr-2" />
                      <label className="text-sm font-medium text-gray-600">Address</label>
                    </div>
                    {!isEditing ? (
                      <p className="text-gray-800">{user?.address}</p>
                    ) : (
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                        rows="3"
                      ></textarea>
                    )}
                  </div>
                </div>
                
                <div className="pt-6 mt-6 border-t">
                  <button
                    onClick={handleLogout}
                    className="text-red-500 hover:text-red-700 font-medium flex items-center"
                  >
                    <FaSignOutAlt className="mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'orders' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Your Order History</h3>
                {/* Order history would be loaded here */}
                <p className="text-gray-500">You haven't placed any orders yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;