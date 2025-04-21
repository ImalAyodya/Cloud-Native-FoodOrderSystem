import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Main/Header';
import Footer from '../../components/Main/Footer';
import axios from 'axios';

const Resturent = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5003/api/restaurant/get');
        
        // Check if restaurants data exists and is an array
        if (response.data && response.data.restaurants && Array.isArray(response.data.restaurants)) {
          setRestaurants(response.data.restaurants);
        } else {
          setError('Invalid data format received from the server');
        }
      } catch (err) {
        console.error('Error fetching restaurants:', err);
        setError('Failed to load restaurants. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  // Default image to use if restaurant image is missing
  const defaultImage = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';

  return (
    <>
      <Header />

      {/* Hero Section */}
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
              Explore Restaurants
            </motion.h1>
            <motion.p
              className="text-xl text-white/90 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Discover the best restaurants for your next meal.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Restaurants Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : error ? (
            <div className="text-center p-8 bg-red-50 rounded-lg text-red-600">
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
              >
                Try Again
              </button>
            </div>
          ) : restaurants.length === 0 ? (
            <div className="text-center p-8 bg-gray-50 rounded-lg text-gray-600">
              <p>No restaurants found. New restaurants coming soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {restaurants.map((restaurant) => (
                <motion.div
                  key={restaurant._id}
                  className="bg-white rounded-xl shadow-md overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="w-full h-48 overflow-hidden">
                    <img
                      src={restaurant.images?.banner || restaurant.images?.logo || defaultImage}
                      alt={restaurant.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = defaultImage;
                      }}
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {restaurant.name}
                      </h3>
                      <span className="px-2 py-1 bg-gray-100 text-sm text-gray-600 rounded">
                        {restaurant.priceRange}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{restaurant.description}</p>
                    <div className="flex items-center mb-4">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                        <span className="ml-1 text-sm text-gray-600">{restaurant.rating.toFixed(1)}</span>
                      </div>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-sm text-gray-600">{restaurant.location?.city}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      
                      <button
                        onClick={() => navigate(`/menu?restaurantId=${restaurant._id}`)}
                        className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                      >
                        View Menu
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Resturent;