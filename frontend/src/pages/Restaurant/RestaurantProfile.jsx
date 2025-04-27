import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUtensils, FaMapMarkerAlt, FaPhone, FaEnvelope, FaEdit, FaTrash, FaImage } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { BiDollarCircle } from 'react-icons/bi';
import { MdRestaurantMenu } from 'react-icons/md';
import RestaurantLayout from '../../components/Restaurant/RestaurantLayout';

const RestaurantProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    contact: { email: '', phone: '' },
    cuisine: [],
    priceRange: '$$',
  });

  // Fetch restaurant details
  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await axios.get(`http://localhost:5003/api/restaurant/get/${id}`);
        if (response.data.success) {
          const data = response.data.restaurant;
          setRestaurant(data);
          setFormData({
            name: data.name || '',
            description: data.description || '',
            address: data.address || '',
            contact: {
              email: data.contact?.email || '',
              phone: data.contact?.phone || '',
            },
            cuisine: data.cuisine || [],
            priceRange: data.priceRange || '$$',
          });
        } else {
          throw new Error('Failed to fetch restaurant data');
        }
      } catch (err) {
        setError(err.message);
        toast.error('Failed to load restaurant details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRestaurant();
  }, [id]);

  // Handle input changes in edit mode
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('contact.')) {
      const [, field] = name.split('.');
      setFormData({
        ...formData,
        contact: { ...formData.contact, [field]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle cuisine selection
  const handleCuisineChange = (cuisine) => {
    setFormData((prev) => ({
      ...prev,
      cuisine: prev.cuisine.includes(cuisine)
        ? prev.cuisine.filter((item) => item !== cuisine)
        : [...prev.cuisine, cuisine],
    }));
  };

  // Update restaurant
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:5003/api/restaurant/update/${id}`,
        formData
      );
      if (response.data.success) {
        setRestaurant(response.data.restaurant);
        setIsEditing(false);
        toast.success('Restaurant updated successfully!');
      } else {
        throw new Error(response.data.message || 'Failed to update restaurant');
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Delete restaurant
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this restaurant? This action cannot be undone.')) {
      try {
        const response = await axios.delete(
          `http://localhost:5003/api/restaurant/delete/${id}`
        );
        if (response.data.success) {
          toast.success('Restaurant deleted successfully!');
          setTimeout(() => navigate('/restaurant/my-restaurants'), 2000);
        } else {
          throw new Error(response.data.message || 'Failed to delete restaurant');
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to delete restaurant. Please try again.';
        toast.error(errorMessage);
      }
    }
  };

  // Cuisine options (same as AddRestaurant.jsx)
  const cuisineOptions = [
    'Sri Lankan', 'Indian', 'Italian', 'Chinese', 'Japanese',
    'Thai', 'Mexican', 'Fast Food', 'Seafood', 'Vegetarian',
    'Vegan', 'Desserts', 'Beverages', 'Bakery', 'BBQ',
    'Healthy', 'Street Food', 'Fusion',
  ];

  // Price range options (same as AddRestaurant.jsx)
  const priceRanges = [
    { value: '$', label: 'Budget (under LKR 500)' },
    { value: '$$', label: 'Moderate (LKR 500-1500)' },
    { value: '$$$', label: 'Premium (LKR 1500-3000)' },
    { value: '$$$$', label: 'Luxury (LKR 3000+)' },
  ];

  if (isLoading) {
    return (
      <RestaurantLayout>
        <div className="flex justify-center items-center h-full p-6">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </RestaurantLayout>
    );
  }

  if (error) {
    return (
      <RestaurantLayout>
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
      </RestaurantLayout>
    );
  }

  return (
    <RestaurantLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ToastContainer position="top-center" autoClose={3000} theme="colored" />
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Header Section */}
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <HiSparkles className="text-orange-500" />
                Restaurant Profile
              </h2>
              {!isEditing && (
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-orange-500 transition-all duration-200 shadow-sm"
                  >
                    <FaEdit className="mr-2 text-orange-500" /> Edit Profile
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-red-50 hover:border-red-500 hover:text-red-600 transition-all duration-200 shadow-sm"
                  >
                    <FaTrash className="mr-2" /> Delete
                  </button>
                </div>
              )}
            </div>

            {/* Restaurant Images Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6"
            >
              {/* Banner Image */}
              <div className="relative h-64 bg-gray-100">
                {restaurant.images?.banner ? (
                  <img
                    src={restaurant.images.banner}
                    alt="Restaurant banner"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50">
                    <FaImage className="text-gray-300 text-4xl" />
                  </div>
                )}
                {/* Logo Overlay */}
                <div className="absolute -bottom-0 left-8">
                  <div className="w-50 h-50 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
                    {restaurant.images?.logo ? (
                      <img
                        src={restaurant.images.logo}
                        alt="Restaurant logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-orange-50">
                        <span className="text-3xl font-bold text-orange-500">
                          {restaurant.name?.charAt(0) || 'R'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {isEditing ? (
              // Edit Mode
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* Add a decorative header */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-16"></div>
                
                <form onSubmit={handleUpdate} className="p-8 space-y-8">
                  {/* Restaurant Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Restaurant Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-2xl font-bold uppercase text-center"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="contact.email"
                        value={formData.contact.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="contact.phone"
                        value={formData.contact.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  {/* Cuisine Types */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Cuisine Types</h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {cuisineOptions.map((cuisine) => (
                        <button
                          key={cuisine}
                          type="button"
                          onClick={() => handleCuisineChange(cuisine)}
                          className={`px-4 py-2.5 rounded-full text-sm transition-all ${
                            formData.cuisine.includes(cuisine)
                              ? 'bg-orange-500 text-white shadow-sm'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {cuisine}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      Selected: {formData.cuisine.length === 0 ? 'None' : formData.cuisine.join(', ')}
                    </p>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price Range
                    </label>
                    <select
                      name="priceRange"
                      value={formData.priceRange}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                    >
                      {priceRanges.map((range) => (
                        <option key={range.value} value={range.value}>
                          {range.value} - {range.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Form Actions with enhanced styling */}
                  <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-md"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              // Display Mode
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Main Info Card */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-400 to-orange-600 p-8">
                    <div className="text-center">
                      <h3 className="text-3xl font-bold text-white uppercase tracking-wider mb-4 hover:scale-105 transition-transform duration-200">
                        {restaurant.name}
                      </h3>
                      <p className="text-xl text-orange-50 mt-4 font-medium leading-relaxed bg-orange-300 bg-opacity-20 p-4 rounded-lg">
                        {restaurant.description || 'No description provided'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    {/* Contact & Location with enhanced icons */}
                    <div className="space-y-4">
                      <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                        <FaMapMarkerAlt className="text-orange-400 text-xl flex-shrink-0 mt-1" />
                        <span className="text-gray-700">{restaurant.address || 'Address not provided'}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <FaPhone className="text-orange-400 text-xl flex-shrink-0" />
                        <span className="text-gray-700">{restaurant.contact?.phone || 'Phone number not provided'}</span>
                      </div>
                      
                      {restaurant.contact?.email && (
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                          <FaEnvelope className="text-orange-400 text-xl flex-shrink-0" />
                          <span className="text-gray-700">{restaurant.contact.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Side Info Cards */}
                <div className="space-y-6">
                  {/* Cuisine Types Card */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MdRestaurantMenu className="text-2xl text-orange-500" />
                      <h3 className="text-lg font-semibold text-gray-800">Cuisine Types</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {restaurant.cuisine?.length > 0 ? (
                        restaurant.cuisine.map((type, index) => (
                          <span
                            key={index}
                            className="px-4 py-2 bg-orange-50 text-orange-600 rounded-full text-sm font-medium"
                          >
                            {type}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">No cuisine types specified</span>
                      )}
                    </div>
                  </div>

                  {/* Price Range Card */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <BiDollarCircle className="text-2xl text-orange-500" />
                      <h3 className="text-lg font-semibold text-gray-800">Price Range</h3>
                    </div>
                    <span className="inline-block px-4 py-2 bg-orange-50 text-orange-600 rounded-full text-sm font-medium">
                      {restaurant.priceRange}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </RestaurantLayout>
  );
};

export default RestaurantProfile;