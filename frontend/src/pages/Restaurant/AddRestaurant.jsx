import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { 
  FaArrowLeft, FaSave, FaMapMarkerAlt, FaUtensils, FaPhone, 
  FaEnvelope, FaClock, FaMoneyBillWave, FaImage, FaTag
} from 'react-icons/fa';

const AddRestaurant = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [previewMode, setPreviewMode] = useState(false);
  
  // Get logged in user data
  const userDataString = localStorage.getItem('loggedInUser');
  const userData = userDataString ? JSON.parse(userDataString) : null;
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Sri Lanka'
    },
    location: { 
      coordinates: [0, 0],
      city: ''
    },
    contact: {
      email: '',
      phone: ''
    },
    cuisine: [],
    businessHours: [
      { day: 'Monday', open: '09:00', close: '22:00', isClosed: false },
      { day: 'Tuesday', open: '09:00', close: '22:00', isClosed: false },
      { day: 'Wednesday', open: '09:00', close: '22:00', isClosed: false },
      { day: 'Thursday', open: '09:00', close: '22:00', isClosed: false },
      { day: 'Friday', open: '09:00', close: '23:00', isClosed: false },
      { day: 'Saturday', open: '10:00', close: '23:00', isClosed: false },
      { day: 'Sunday', open: '10:00', close: '22:00', isClosed: false }
    ],
    images: {
      logo: '',
      banner: '',
      gallery: []
    },
    priceRange: '$$',
    deliveryFee: 2.99,
    minOrder: 10.00,
    avgPrepTime: 30,
    isAvailable: true,
    featuredItems: ['', '', ''],
    status: 'pending',
    ownerId: userData?.id || ''
  });

  // Cuisine options
  const cuisineOptions = [
    'Sri Lankan', 'Indian', 'Italian', 'Chinese', 'Japanese', 
    'Thai', 'Mexican', 'Fast Food', 'Seafood', 'Vegetarian',
    'Vegan', 'Desserts', 'Beverages', 'Bakery', 'BBQ',
    'Healthy', 'Street Food', 'Fusion'
  ];

  // Price range options
  const priceRanges = [
    { value: '$', label: 'Budget (under LKR 500)' },
    { value: '$$', label: 'Moderate (LKR 500-1500)' },
    { value: '$$$', label: 'Premium (LKR 1500-3000)' },
    { value: '$$$$', label: 'Luxury (LKR 3000+)' }
  ];

  // Redirect if not logged in
  useEffect(() => {
    if (!userData || !userData.id) {
      toast.error('Please log in to add a restaurant');
      navigate('/login');
    }
  }, [userData, navigate]);

  // Handle text input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle checkbox input changes
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    
    if (name === 'isAvailable') {
      setFormData({
        ...formData,
        isAvailable: checked
      });
    }
  };

  // Handle address changes
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      address: {
        ...formData.address,
        [name]: value
      }
    });
  };

  // Handle cuisine selection
  const handleCuisineChange = (cuisine) => {
    if (formData.cuisine.includes(cuisine)) {
      setFormData({
        ...formData,
        cuisine: formData.cuisine.filter(item => item !== cuisine)
      });
    } else {
      setFormData({
        ...formData,
        cuisine: [...formData.cuisine, cuisine]
      });
    }
  };

  // Handle business hours changes
  const handleHoursChange = (index, field, value) => {
    const updatedHours = [...formData.businessHours];
    
    if (field === 'isClosed') {
      updatedHours[index] = { 
        ...updatedHours[index], 
        isClosed: !updatedHours[index].isClosed
      };
    } else {
      updatedHours[index] = { ...updatedHours[index], [field]: value };
    }
    
    setFormData({
      ...formData,
      businessHours: updatedHours
    });
  };

  // Handle featured item change
  const handleFeaturedItemChange = (index, value) => {
    const updatedItems = [...formData.featuredItems];
    updatedItems[index] = value;
    
    setFormData({
      ...formData,
      featuredItems: updatedItems
    });
  };

  // Handle image upload
  const handleImageChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Basic validation
    if (file.size > 3 * 1024 * 1024) { // 3MB
      toast.error('Image too large. Max size is 3MB.');
      return;
    }
    
    // Mock image upload - In a real app, you'd upload to a server or cloud storage
    const reader = new FileReader();
    reader.onload = () => {
      if (type === 'gallery') {
        setFormData({
          ...formData,
          images: {
            ...formData.images,
            gallery: [...(formData.images.gallery || []), reader.result]
          }
        });
      } else {
        setFormData({
          ...formData,
          images: {
            ...formData.images,
            [type]: reader.result
          }
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Remove gallery image
  const removeGalleryImage = (indexToRemove) => {
    setFormData({
      ...formData,
      images: {
        ...formData.images,
        gallery: formData.images.gallery.filter((_, index) => index !== indexToRemove)
      }
    });
  };

  // Navigation between steps
  const goToStep = (step) => {
    // Basic validation before proceeding
    if (step > activeStep) {
      if (step === 2 && (!formData.name || !formData.description)) {
        toast.warning('Please fill in all required fields in Basic Information');
        return;
      }
      if (step === 3 && (!formData.address.street || !formData.address.city || !formData.contact.phone)) {
        toast.warning('Please fill in all required fields in Contact & Location');
        return;
      }
    }
    
    setActiveStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle preview mode
  const togglePreview = () => {
    setPreviewMode(!previewMode);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Validate required fields
      if (!formData.name || !formData.address.street || !formData.address.city || !formData.contact.phone) {
        toast.error('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }
      
      // Format address as a string (combine all address fields)
      const formattedData = {
        ...formData,
        address: `${formData.address.street}, ${formData.address.city}${formData.address.postalCode ? ', ' + formData.address.postalCode : ''}${formData.address.state ? ', ' + formData.address.state : ''}, ${formData.address.country}`,
        // Filter out empty featured items
        featuredItems: formData.featuredItems.filter(item => item.trim() !== '')
      };
      
      // Mock coordinates if not set
      if (formData.location.coordinates[0] === 0 && formData.location.coordinates[1] === 0) {
        // Use random coordinates near Colombo, Sri Lanka as a fallback
        formattedData.location.coordinates = [79.861244 + (Math.random() * 0.1), 6.927079 + (Math.random() * 0.1)];
        formattedData.location.city = formData.address.city;
      }
      
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5003/api/restaurant/add',
        formattedData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        toast.success('Restaurant added successfully!');
        setTimeout(() => {
          navigate('/restaurant/my-restaurants');
        }, 2000);
      } else {
        toast.error(response.data.message || 'Failed to add restaurant');
      }
    } catch (error) {
      console.error('Error adding restaurant:', error);
      toast.error(error.response?.data?.message || 'An error occurred while adding the restaurant');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Restaurant preview component
  const RestaurantPreview = () => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Banner */}
      <div className="relative h-60 bg-gray-200">
        {formData.images.banner ? (
          <img 
            src={formData.images.banner} 
            alt="Restaurant banner" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-orange-50">
            <FaImage className="text-5xl text-orange-300" />
            <p className="text-orange-400 ml-3">No Banner Image</p>
          </div>
        )}
        
        {/* Logo overlay */}
        <div className="absolute -bottom-12 left-6">
          <div className="w-24 h-24 rounded-full bg-white shadow-lg p-1">
            {formData.images.logo ? (
              <img 
                src={formData.images.logo} 
                alt="Restaurant logo" 
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="w-full h-full rounded-full flex items-center justify-center bg-orange-100">
                <span className="text-3xl font-bold text-orange-500">
                  {formData.name.charAt(0) || 'R'}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Price range */}
        <div className="absolute top-4 right-4 px-4 py-1 bg-white/90 backdrop-blur-sm rounded-full">
          <span className="font-medium text-orange-600">{formData.priceRange}</span>
        </div>
      </div>
      
      {/* Restaurant info */}
      <div className="pt-16 px-6 pb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {formData.name || 'Restaurant Name'}
        </h2>
        
        {/* Cuisine tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {formData.cuisine.length > 0 ? (
            formData.cuisine.map((type, index) => (
              <span key={index} className="px-3 py-1 bg-orange-50 text-orange-600 text-xs rounded-full">
                {type}
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-500">No cuisine types selected</span>
          )}
        </div>
        
        <p className="text-gray-600 mb-6">
          {formData.description || 'No description provided'}
        </p>
        
        {/* Contact & Location */}
        <div className="border-t border-gray-100 pt-4 mb-4">
          <div className="flex items-start mb-2">
            <FaMapMarkerAlt className="text-orange-500 mt-1 mr-3" />
            <span className="text-gray-700">
              {formData.address.street ? (
                <>
                  {formData.address.street}, {formData.address.city}
                  {formData.address.postalCode ? `, ${formData.address.postalCode}` : ''}
                  , {formData.address.country}
                </>
              ) : (
                'Address not provided'
              )}
            </span>
          </div>
          
          <div className="flex items-center mb-2">
            <FaPhone className="text-orange-500 mr-3" />
            <span className="text-gray-700">
              {formData.contact.phone || 'Phone number not provided'}
            </span>
          </div>
          
          {formData.contact.email && (
            <div className="flex items-center">
              <FaEnvelope className="text-orange-500 mr-3" />
              <span className="text-gray-700">{formData.contact.email}</span>
            </div>
          )}
        </div>
        
        {/* Business hours */}
        <div className="border-t border-gray-100 pt-4 mb-4">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Business Hours</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
            {formData.businessHours.map((hours, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-700 font-medium">{hours.day}:</span>
                <span className="text-gray-600">
                  {hours.isClosed ? (
                    <span className="text-red-500">Closed</span>
                  ) : (
                    `${hours.open} - ${hours.close}`
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Delivery info */}
        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Delivery Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500">Minimum Order</p>
              <p className="text-lg font-medium text-gray-800">LKR {formData.minOrder.toFixed(2)}</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500">Delivery Fee</p>
              <p className="text-lg font-medium text-gray-800">LKR {formData.deliveryFee.toFixed(2)}</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500">Prep Time</p>
              <p className="text-lg font-medium text-gray-800">{formData.avgPrepTime} mins</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <ToastContainer position="top-center" autoClose={3000} theme="colored" />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 py-8 px-4 shadow-md">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/restaurant/my-restaurants')}
                className="bg-white/10 text-white p-2 rounded-lg hover:bg-white/20 transition-colors"
                aria-label="Go back"
              >
                <FaArrowLeft />
              </button>
              <h1 className="ml-4 text-2xl md:text-3xl font-bold text-white">Add New Restaurant</h1>
            </div>
            
            {!previewMode && (
              <button
                onClick={togglePreview}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                Preview
              </button>
            )}
            
            {previewMode && (
              <button
                onClick={togglePreview}
                className="px-4 py-2 bg-white text-orange-500 rounded-lg hover:bg-white/90 transition-colors"
              >
                Back to Edit
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Progress Steps (hidden in preview mode) */}
      {!previewMode && (
        <div className="container mx-auto max-w-6xl px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="hidden sm:flex w-full justify-between">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activeStep >= 1 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  <FaUtensils />
                </div>
                <span className="mt-2 text-sm text-gray-600">Basic Info</span>
              </div>
              <div className="flex-1 h-1 mx-2 hidden sm:block bg-gray-200">
                <div className={`h-full ${activeStep >= 2 ? 'bg-orange-500' : 'bg-gray-200'}`} style={{ width: activeStep >= 2 ? '100%' : '0' }}></div>
              </div>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activeStep >= 2 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  <FaMapMarkerAlt />
                </div>
                <span className="mt-2 text-sm text-gray-600">Location</span>
              </div>
              <div className="flex-1 h-1 mx-2 hidden sm:block bg-gray-200">
                <div className={`h-full ${activeStep >= 3 ? 'bg-orange-500' : 'bg-gray-200'}`} style={{ width: activeStep >= 3 ? '100%' : '0' }}></div>
              </div>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activeStep >= 3 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  <FaTag />
                </div>
                <span className="mt-2 text-sm text-gray-600">Details</span>
              </div>
              <div className="flex-1 h-1 mx-2 hidden sm:block bg-gray-200">
                <div className={`h-full ${activeStep >= 4 ? 'bg-orange-500' : 'bg-gray-200'}`} style={{ width: activeStep >= 4 ? '100%' : '0' }}></div>
              </div>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activeStep >= 4 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  <FaImage />
                </div>
                <span className="mt-2 text-sm text-gray-600">Images</span>
              </div>
              <div className="flex-1 h-1 mx-2 hidden sm:block bg-gray-200">
                <div className={`h-full ${activeStep >= 5 ? 'bg-orange-500' : 'bg-gray-200'}`} style={{ width: activeStep >= 5 ? '100%' : '0' }}></div>
              </div>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activeStep >= 5 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  <FaMoneyBillWave />
                </div>
                <span className="mt-2 text-sm text-gray-600">Settings</span>
              </div>
            </div>
            
            {/* Mobile progress indicator */}
            <div className="sm:hidden w-full">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-gray-600">Step {activeStep} of 5</p>
                <div className="w-2/3 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-500 rounded-full" 
                    style={{ width: `${(activeStep / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Form Container or Preview */}
      <div className="container mx-auto max-w-6xl px-4 py-4">
        {previewMode ? (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Restaurant Preview</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <RestaurantPreview />
              </div>
              <div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Ready to Submit?</h3>
                  <p className="text-gray-600 mb-6">
                    Review your restaurant information before submitting. You can make changes by going back to the edit mode.
                  </p>
                  <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-medium flex items-center justify-center ${
                      isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:from-orange-600 hover:to-amber-600'
                    } transition-all`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaSave className="mr-2" /> Submit Restaurant
                      </>
                    )}
                  </button>
                  <button 
                    onClick={togglePreview}
                    className="w-full mt-3 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Back to Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-8"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Step 1: Basic Information */}
              {activeStep === 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
                      <FaUtensils className="mr-3 text-orange-500" />
                      Basic Information
                    </h2>
                    <p className="text-gray-600">Let's start with the essential information about your restaurant.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Restaurant Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g., Flavor Haven"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Choose a memorable name that represents your brand
                      </p>
                    </div>
                    
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
                        {priceRanges.map(range => (
                          <option key={range.value} value={range.value}>
                            {range.value} - {range.label}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-gray-500">
                        How expensive is your restaurant on average?
                      </p>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Restaurant Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Tell customers about your restaurant, your story, and what makes your food special..."
                        rows={4}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      ></textarea>
                      <p className="mt-1 text-xs text-gray-500">
                        Your description helps customers understand your restaurant's style and offerings (150-500 characters recommended)
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Step 2: Contact & Location */}
              {activeStep === 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
                      <FaMapMarkerAlt className="mr-3 text-orange-500" />
                      Contact & Location
                    </h2>
                    <p className="text-gray-600">Help customers find and reach your restaurant.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="contact.email"
                        value={formData.contact.email}
                        onChange={handleInputChange}
                        placeholder="restaurant@example.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        For order notifications and customer inquiries
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="contact.phone"
                        value={formData.contact.phone}
                        onChange={handleInputChange}
                        placeholder="+94 XX XXX XXXX"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        A direct phone number for orders and inquiries
                      </p>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="street"
                        value={formData.address.street}
                        onChange={handleAddressChange}
                        placeholder="123 Main Street"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.address.city}
                        onChange={handleAddressChange}
                        placeholder="Colombo"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.address.postalCode}
                        onChange={handleAddressChange}
                        placeholder="10100"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State/Province
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.address.state}
                        onChange={handleAddressChange}
                        placeholder="Western Province"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.address.country}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
                        disabled
                      />
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg mb-4 border border-blue-100">
                    <h3 className="text-sm font-medium text-blue-800 mb-2">Location Detection</h3>
                    <p className="text-xs text-blue-700 mb-2">
                      We'll automatically detect your restaurant's coordinates based on the address you provided.
                    </p>
                    <p className="text-xs text-blue-700">
                      If you need to set specific GPS coordinates, please contact our support team after creating your restaurant.
                    </p>
                  </div>
                </motion.div>
              )}
              
              {/* Step 3: Cuisine & Business Hours */}
              {activeStep === 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
                      <FaTag className="mr-3 text-orange-500" />
                      Restaurant Details
                    </h2>
                    <p className="text-gray-600">Tell customers about your cuisine and hours of operation.</p>
                  </div>
                  
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Cuisine Types</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Select all cuisine types that apply to your restaurant (select at least one).
                    </p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {cuisineOptions.map(cuisine => (
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
                    <p className="text-xs text-gray-500 mt-2">
                      Selected: {formData.cuisine.length === 0 ? 'None' : formData.cuisine.join(', ')}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                      <FaClock className="mr-2 text-orange-500" />
                      Business Hours
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Set your regular opening hours for each day of the week.
                    </p>
                    
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        {formData.businessHours.map((hours, index) => (
                          <div key={index} className="flex items-center p-3 bg-white rounded-lg border border-gray-100">
                            <div className="w-24 font-medium text-gray-700">{hours.day}</div>
                            
                            {hours.isClosed ? (
                              <div className="ml-4 text-red-500 text-sm">Closed</div>
                            ) : (
                              <div className="flex flex-1 items-center">
                                <input
                                  type="time"
                                  value={hours.open}
                                  onChange={(e) => handleHoursChange(index, 'open', e.target.value)}
                                  className="w-28 px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                                  disabled={hours.isClosed}
                                />
                                <span className="mx-2 text-gray-500">to</span>
                                <input
                                  type="time"
                                  value={hours.close}
                                  onChange={(e) => handleHoursChange(index, 'close', e.target.value)}
                                  className="w-28 px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                                  disabled={hours.isClosed}
                                />
                              </div>
                            )}
                            
                            <label className="flex items-center ml-auto cursor-pointer">
                              <input
                                type="checkbox"
                                checked={hours.isClosed}
                                onChange={() => handleHoursChange(index, 'isClosed')}
                                className="sr-only peer"
                              />
                              <div className="relative w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                              <span className="ms-1.5 text-xs text-gray-500 hidden sm:block">Closed</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="text-lg font-medium text-gray-800 mb-3">Featured Items</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Add some of your specialty dish names to highlight in your profile (optional).
                      </p>
                      
                      <div className="space-y-3">
                        {formData.featuredItems.map((item, index) => (
                          <input
                            key={index}
                            type="text"
                            value={item}
                            onChange={(e) => handleFeaturedItemChange(index, e.target.value)}
                            placeholder={`Featured dish #${index + 1}`}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Step 4: Restaurant Images */}
              {activeStep === 4 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
                      <FaImage className="mr-3 text-orange-500" />
                      Restaurant Images
                    </h2>
                    <p className="text-gray-600">Upload high-quality images of your restaurant to attract customers.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Logo Upload */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-3">Restaurant Logo</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Your logo will appear prominently on your profile and in search results.
                      </p>
                      
                      <div className="flex flex-col items-center">
                        <div className="w-40 h-40 rounded-full bg-gray-100 overflow-hidden border border-gray-200 mb-4">
                          {formData.images.logo ? (
                            <img 
                              src={formData.images.logo} 
                              alt="Restaurant logo" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FaUtensils className="text-gray-300 text-4xl" />
                            </div>
                          )}
                        </div>
                        
                        <label className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 cursor-pointer transition-colors">
                          <span>Upload Logo</span>
                          <input
                            type="file"
                            onChange={(e) => handleImageChange(e, 'logo')}
                            accept="image/*"
                            className="sr-only"
                          />
                        </label>
                        <p className="mt-2 text-xs text-gray-500">
                          Recommended: Square image, at least 300x300 pixels
                        </p>
                      </div>
                    </div>
                    
                    {/* Banner Upload */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-3">Banner Image</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        A banner image showcasing your restaurant's atmosphere or signature dishes.
                      </p>
                      
                      <div className="mt-1 flex justify-center py-6 px-6 border-2 border-gray-300 border-dashed rounded-lg">
                        {formData.images.banner ? (
                          <div className="w-full">
                            <img 
                              src={formData.images.banner} 
                              alt="Restaurant banner" 
                              className="h-48 w-full object-cover rounded-md"
                            />
                            <div className="flex justify-center mt-4">
                              <label className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 cursor-pointer transition-colors">
                                <span>Change Banner</span>
                                <input
                                  type="file"
                                  onChange={(e) => handleImageChange(e, 'banner')}
                                  accept="image/*"
                                  className="sr-only"
                                />
                              </label>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2 text-center">
                            <svg
                              className="mx-auto h-12 w-12 text-gray-400"
                              stroke="currentColor"
                              fill="none"
                              viewBox="0 0 48 48"
                              aria-hidden="true"
                            >
                              <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <div className="flex text-sm justify-center">
                              <label className="relative cursor-pointer px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                                <span>Upload Banner</span>
                                <input
                                  type="file"
                                  onChange={(e) => handleImageChange(e, 'banner')}
                                  accept="image/*"
                                  className="sr-only"
                                />
                              </label>
                            </div>
                            <p className="text-xs text-gray-500">
                              Recommended: 1200x400 pixels, landscape orientation
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Gallery Images */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Restaurant Gallery</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Add photos of your food, interior, and ambiance (optional, up to 6 images).
                    </p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                      {/* Existing gallery images */}
                      {formData.images.gallery && formData.images.gallery.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                            <img 
                              src={image} 
                              alt={`Gallery image ${index + 1}`} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Remove image"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      
                      {/* Upload new image slot (if less than 6 images) */}
                      {(!formData.images.gallery || formData.images.gallery.length < 6) && (
                        <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                          <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center text-gray-500 hover:text-orange-500 transition-colors">
                            <FaImage className="text-2xl mb-2" />
                            <span className="text-xs text-center">Add Photo</span>
                            <input
                              type="file"
                              onChange={(e) => handleImageChange(e, 'gallery')}
                              accept="image/*"
                              className="sr-only"
                            />
                          </label>
                        </div>
                      )}
                    </div>
                    
                    <p className="mt-2 text-xs text-gray-500">
                      {formData.images.gallery && formData.images.gallery.length}/6 images uploaded
                    </p>
                  </div>
                </motion.div>
              )}
              
              {/* Step 5: Delivery Settings */}
              {activeStep === 5 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
                      <FaMoneyBillWave className="mr-3 text-orange-500" />
                      Delivery & Order Settings
                    </h2>
                    <p className="text-gray-600">Set your delivery fees, minimum order amounts, and other order preferences.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Delivery Fee (LKR)
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">LKR</span>
                        <input
                          type="number"
                          name="deliveryFee"
                          value={formData.deliveryFee}
                          onChange={handleInputChange}
                          step="0.01"
                          min="0"
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Fee charged for delivery service
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum Order (LKR)
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">LKR</span>
                        <input
                          type="number"
                          name="minOrder"
                          value={formData.minOrder}
                          onChange={handleInputChange}
                          step="0.01"
                          min="0"
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Minimum order value required
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Average Preparation Time (Minutes)
                      </label>
                      <input
                        type="number"
                        name="avgPrepTime"
                        value={formData.avgPrepTime}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Time needed to prepare an average order
                      </p>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Restaurant Availability</h3>
                    
                    <div className="flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="isAvailable"
                          checked={formData.isAvailable}
                          onChange={handleCheckboxChange}
                          className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-orange-500"></div>
                      </label>
                      <span className="ms-4 text-gray-700">Restaurant is currently accepting orders</span>
                    </div>
                    
                    <p className="mt-2 text-sm text-gray-600">
                      {formData.isAvailable ? (
                        <span className="text-green-600">Your restaurant will be visible to customers and able to receive orders.</span>
                      ) : (
                        <span className="text-gray-500">Your restaurant will be listed as "Closed" and won't receive orders.</span>
                      )}
                    </p>
                  </div>
                </motion.div>
              )}
              
              {/* Navigation Buttons */}
              <div className="pt-6 border-t border-gray-100 flex justify-between">
                {activeStep > 1 && (
                  <button
                    type="button"
                    onClick={() => goToStep(activeStep - 1)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                  >
                    <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                )}
                
                {activeStep < 5 && (
                  <button
                    type="button"
                    onClick={() => goToStep(activeStep + 1)}
                    className="ml-auto px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center"
                  >
                    Next
                    <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
                
                {activeStep === 5 && (
                  <button
                    type="button"
                    onClick={togglePreview}
                    className="ml-auto px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center"
                  >
                    Preview & Submit
                    <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AddRestaurant;