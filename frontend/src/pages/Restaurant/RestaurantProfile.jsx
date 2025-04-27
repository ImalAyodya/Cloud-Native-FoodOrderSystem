import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUtensils, FaMapMarkerAlt, FaPhone, FaEnvelope, FaEdit, FaTrash } from 'react-icons/fa';
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
  // const handleUpdate = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const token = localStorage.getItem('token');
  //     const response = await axios.put(
  //       `http://localhost:5003/api/restaurant/update/${id}`,
  //       formData,
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );
  //     if (response.data.success) {
  //       setRestaurant(response.data.restaurant);
  //       setIsEditing(false);
  //       toast.success('Restaurant updated successfully!');
  //     } else {
  //       throw new Error(response.data.message || 'Failed to update restaurant');
  //     }
  //   } catch (err) {
  //     toast.error(err.message);
  //   }
  // };
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
  // const handleDelete = async () => {
  //   if (window.confirm('Are you sure you want to delete this restaurant? This action cannot be undone.')) {
  //     try {
  //       const token = localStorage.getItem('token');
  //       const response = await axios.delete(
  //         `http://localhost:5003/api/restaurant/delete/${id}`,
  //         { headers: { Authorization: `Bearer ${token}` } }
  //       );
  //       if (response.data.success) {
  //         toast.success('Restaurant deleted successfully!');
  //         setTimeout(() => navigate('/restaurant/my-restaurants'), 2000);
  //       } else {
  //         throw new Error(response.data.message || 'Failed to delete restaurant');
  //       }
  //     } catch (err) {
  //       toast.error(err.message);
  //     }
  //   }
  // };

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
      <div className="p-6">
        <ToastContainer position="top-center" autoClose={3000} theme="colored" />
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <FaUtensils className="mr-3 text-orange-500" />
              Restaurant Profile
            </h2>

            {isEditing ? (
              // Edit Mode: Form to update restaurant details
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-8"
              >
                <form onSubmit={handleUpdate} className="space-y-8">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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

                  {/* Form Actions */}
                  <div className="pt-6 border-t border-gray-100 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              // Display Mode: Show restaurant details
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">{restaurant.name}</h3>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <FaEdit className="mr-2" /> Update
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <FaTrash className="mr-2" /> Delete
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 mb-6">{restaurant.description || 'No description provided'}</p>

                {/* Contact & Location */}
                <div className="border-t border-gray-100 pt-4 mb-4">
                  <div className="flex items-start mb-2">
                    <FaMapMarkerAlt className="text-orange-500 mt-1 mr-3" />
                    <span className="text-gray-700">{restaurant.address || 'Address not provided'}</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <FaPhone className="text-orange-500 mr-3" />
                    <span className="text-gray-700">{restaurant.contact?.phone || 'Phone number not provided'}</span>
                  </div>
                  {restaurant.contact?.email && (
                    <div className="flex items-center">
                      <FaEnvelope className="text-orange-500 mr-3" />
                      <span className="text-gray-700">{restaurant.contact.email}</span>
                    </div>
                  )}
                </div>

                {/* Cuisine Types */}
                <div className="border-t border-gray-100 pt-4 mb-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Cuisine Types</h3>
                  <div className="flex flex-wrap gap-2">
                    {restaurant.cuisine?.length > 0 ? (
                      restaurant.cuisine.map((type, index) => (
                        <span key={index} className="px-3 py-1 bg-orange-50 text-orange-600 text-xs rounded-full">
                          {type}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No cuisine types specified</span>
                    )}
                  </div>
                </div>

                {/* Price Range */}
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Price Range</h3>
                  <span className="font-medium text-orange-600">{restaurant.priceRange}</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </RestaurantLayout>
  );
};

export default RestaurantProfile;