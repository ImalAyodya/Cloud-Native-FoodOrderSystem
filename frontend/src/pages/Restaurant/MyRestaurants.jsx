import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUtensils, FaPlus } from 'react-icons/fa';
import { MdRestaurantMenu } from 'react-icons/md';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Safely stringify objects with circular references
function safeStringify(obj) {
  try {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      return value;
    });
  } catch (err) {
    return '[Error stringifying object]';
  }
}

const MyRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);  // Add this flag
  const navigate = useNavigate();

  // Get logged in user data (do this only once)
  const userDataString = localStorage.getItem('loggedInUser');
  const userData = userDataString ? JSON.parse(userDataString) : null;
  
  // Use useCallback to memoize the fetch function
  const fetchMyRestaurants = useCallback(async () => {
    // If we've already loaded data, don't fetch again
    if (isDataLoaded) return;
    
    if (!userData || !userData.id) {
      console.log("User data missing:", userData);
      toast.error('User not logged in');
      navigate('/login');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      const requestUrl = `http://localhost:5003/api/restaurant/user/${userData.id}`;
      console.log("Making request to:", requestUrl);
      
      const response = await axios.get(
        requestUrl,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Log only once
      console.log("API response status:", response.status);
      
      // Extract and safely log only relevant information
      const responseData = {
        success: response.data?.success,
        count: response.data?.count,
        dataLength: Array.isArray(response.data?.data) ? response.data.data.length : 'not an array'
      };
      
      console.log("API response summary:", responseData);
      
      if (response.data?.success && Array.isArray(response.data?.data)) {
        // Map only the needed properties to avoid circular references
        const simplifiedRestaurants = response.data.data.map(restaurant => ({
          _id: restaurant._id,
          name: restaurant.name,
          description: restaurant.description,
          address: restaurant.address,
          cuisine: Array.isArray(restaurant.cuisine) ? [...restaurant.cuisine] : [],
          priceRange: restaurant.priceRange,
          images: restaurant.images ? { 
            logo: restaurant.images.logo || null, 
            banner: restaurant.images.banner || null 
          } : null,
          status: restaurant.status,
          ownerId: restaurant.ownerId
        }));
        
        // Sample of first restaurant for debugging - log only once
        if (simplifiedRestaurants.length > 0) {
          console.log("First restaurant data:", simplifiedRestaurants[0]);
        }
        
        setRestaurants(simplifiedRestaurants);
        setIsDataLoaded(true);  // Mark data as loaded
      } else {
        console.error("API returned invalid data:", {
          success: response.data?.success,
          isDataArray: Array.isArray(response.data?.data)
        });
        setError('Failed to fetch restaurants: Invalid data format');
        toast.error('Could not load your restaurants');
      }
    } catch (err) {
      console.error('Error fetching restaurants:', err.message);
      console.log("Error status:", err.response?.status);
      console.log("Error message:", err.response?.data?.message || 'Unknown error');
      
      setError('Failed to load restaurants. Please try again later.');
      toast.error(err.response?.data?.message || 'Error fetching your restaurants');
    } finally {
      setIsLoading(false);
    }
  }, [userData, navigate, isDataLoaded]);  // Include isDataLoaded in dependencies

  // Fetch restaurants owned by the user
  useEffect(() => {
    fetchMyRestaurants();
  }, [fetchMyRestaurants]);  // Only depend on the memoized fetch function

  // Navigate to add restaurant page
  const handleAddRestaurant = () => {
    navigate('/restaurant/add');
  };

  // Function to manually refresh data
  const refreshData = () => {
    setIsDataLoaded(false);
    fetchMyRestaurants();
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <ToastContainer position="top-center" autoClose={3000} theme="colored" />
      
      {/* Hero section */}
      <section className="bg-gradient-to-r from-orange-500 to-amber-500 py-12 px-4 shadow-md">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">My Restaurants</h1>
              <p className="text-white/90">View and manage your restaurant profiles</p>
            </div>
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-4 md:mt-0 bg-white text-orange-500 px-6 py-3 rounded-lg font-medium flex items-center shadow-lg hover:shadow-xl transition-all"
                onClick={refreshData}
              >
                Refresh
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-4 md:mt-0 bg-white text-orange-500 px-6 py-3 rounded-lg font-medium flex items-center shadow-lg hover:shadow-xl transition-all"
                onClick={handleAddRestaurant}
              >
                <FaPlus className="mr-2" />
                Add Restaurant
              </motion.button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-6xl px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-6 rounded-xl text-center">
            <h3 className="text-red-600 font-medium text-lg mb-2">Error</h3>
            <p className="text-red-500">{error}</p>
            <button 
              onClick={refreshData} 
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : restaurants.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-10 rounded-xl shadow-sm text-center"
          >
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaUtensils className="text-3xl text-orange-500" />
            </div>
            <h3 className="text-gray-800 font-bold text-xl mb-2">No Restaurants Yet</h3>
            <p className="text-gray-600 mb-6">You haven't added any restaurants to your profile yet.</p>
            <button 
              onClick={handleAddRestaurant}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-colors font-medium"
            >
              Add Your First Restaurant
            </button>
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {restaurants.map(restaurant => (
              <Link
                to={`/restaurant/dashboard/${restaurant._id}`}
                key={restaurant._id}
              >
                <motion.div
                  className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow cursor-pointer h-full"
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                >
                  <div className="h-48 bg-gray-200 relative overflow-hidden">
                    {restaurant.images && restaurant.images.banner ? (
                      <img 
                        src={restaurant.images.banner} 
                        alt={restaurant.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/800x400?text=DigiDine+Restaurant';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-orange-50">
                        <FaUtensils className="text-5xl text-orange-300" />
                      </div>
                    )}
                    
                    {restaurant.status && (
                      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${
                        restaurant.status === 'active' ? 'bg-green-100 text-green-800' :
                        restaurant.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {restaurant.status.charAt(0).toUpperCase() + restaurant.status.slice(1)}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                        {restaurant.images && restaurant.images.logo ? (
                          <img 
                            src={restaurant.images.logo} 
                            alt={restaurant.name} 
                            className="w-full h-full object-cover rounded-full"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/40?text=R';
                            }}
                          />
                        ) : (
                          <span className="text-orange-500 font-bold">{restaurant.name.charAt(0)}</span>
                        )}
                      </div>
                      <h3 className="font-bold text-lg text-gray-800">{restaurant.name || 'Unnamed Restaurant'}</h3>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{restaurant.description || 'No description available'}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-2 py-1 bg-orange-50 text-orange-600 text-xs rounded-full">
                        {restaurant.priceRange || '$$'}
                      </span>
                      {restaurant.cuisine && Array.isArray(restaurant.cuisine) && restaurant.cuisine.slice(0, 2).map((type, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                          {type}
                        </span>
                      ))}
                      {restaurant.cuisine && Array.isArray(restaurant.cuisine) && restaurant.cuisine.length > 2 && (
                        <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                          +{restaurant.cuisine.length - 2} more
                        </span>
                      )}
                    </div>
                    
                    {/* View Menu link */}
                    <div className="flex items-center justify-center mt-4">
                      <Link 
                        to={`/restaurant/${restaurant._id}/menu`}
                        className="flex items-center justify-center px-4 py-2.5 bg-orange-50 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-100 w-full transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MdRestaurantMenu className="mr-2" /> View Menu
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MyRestaurants;