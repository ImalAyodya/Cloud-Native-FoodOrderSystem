import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../../components/Main/Header';
import Footer from '../../components/Main/Footer';
import { FiPlus, FiSearch, FiFilter } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedItems, setSelectedItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Get restaurantId from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const restaurantId = queryParams.get('restaurantId');

  // Load cart items from session storage
  useEffect(() => {
    const storedItems = sessionStorage.getItem('selectedItems');
    if (storedItems) {
      try {
        const parsedItems = JSON.parse(storedItems);
        setSelectedItems(parsedItems);
      } catch (error) {
        console.error("Failed to parse cart items from sessionStorage:", error);
        sessionStorage.removeItem('selectedItems');
      }
    }
  }, []);

  // Update cart count and session storage when cart changes
  useEffect(() => {
    const totalCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(totalCount);

    if (selectedItems.length > 0) {
      sessionStorage.setItem('selectedItems', JSON.stringify(selectedItems));
    }
    
    // Make cartCount available in localStorage for Header component
    localStorage.setItem('cartCount', totalCount.toString());
    
    // Dispatch an event to notify other components
    const cartUpdateEvent = new CustomEvent('cartUpdated', { detail: { count: totalCount } });
    window.dispatchEvent(cartUpdateEvent);
  }, [selectedItems]);

  // Fetch menu items from API
  useEffect(() => {
    const fetchMenuItems = async () => {
      setLoading(true);
      try {
        // Build query parameters
        const params = { isAvailable: 'true' };
        if (restaurantId) {
          params.restaurantId = restaurantId;
        }

        const response = await axios.get('http://localhost:5003/api/menu/get', { params });
        
        if (response.data.success && response.data.menuItems) {
          setMenuItems(response.data.menuItems);
          
          // Extract categories from menu items
          const allCategories = ['All'];
          const uniqueCategories = new Set();
          
          response.data.menuItems.forEach(item => {
            if (item.category && !uniqueCategories.has(item.category)) {
              uniqueCategories.add(item.category);
              allCategories.push(item.category);
            }
          });
          
          setCategories(allCategories);
        } else {
          setError('Failed to load menu items');
        }
      } catch (err) {
        console.error('Error fetching menu items:', err);
        setError('Failed to load menu items. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, [restaurantId]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
                          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleAddItem = (item, variation) => {
    // Get restaurant data from the populated field
    const restaurant = item.restaurantId || {};
    
    const newItem = {
      restaurantId: restaurant._id,
      restaurantName: restaurant.name || 'Unknown Restaurant',
      foodId: item._id,
      name: item.name,
      size: variation ? variation.name : 'Regular',
      price: variation ? variation.price : item.price,
      image: item.image,
      quantity: 1,
    };

    setSelectedItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (prevItem) =>
          prevItem.foodId === item._id &&
          prevItem.size === (variation ? variation.name : 'Regular') &&
          prevItem.restaurantId === restaurant._id
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += 1;
        return updatedItems;
      } else {
        return [...prevItems, newItem];
      }
    });

    toast.success(`Added ${item.name} ${variation ? `(${variation.name})` : ''} to cart`);
  };

  const goToCart = () => {
    navigate('/cart');
  };

  return (
    <>
      <Header cartCount={cartCount} />
      <ToastContainer position="top-center" autoClose={2000} />

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
              Explore Our Menu
            </motion.h1>
            <motion.p 
              className="text-xl text-white/90 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Discover delicious food from our partner restaurants and order your favorites
            </motion.p>
          </div>
        </div>
      </section>

      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            {/* Search bar */}
            <div className="relative w-full md:w-80">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Category filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full md:w-auto">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                    activeCategory === category
                      ? 'bg-orange-500 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Cart button */}
            
          </div>

          {/* Menu items */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
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
          ) : filteredItems.length === 0 ? (
            <div className="text-center p-12 bg-white rounded-lg shadow-sm">
              <p className="text-xl text-gray-600">No menu items found.</p>
              <p className="text-gray-500 mt-2">Try changing your search or filter criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map(item => (
                <motion.div 
                  key={item._id}
                  className="bg-white rounded-xl shadow-md overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="p-6">
                    {/* Restaurant info */}
                    {item.restaurantId && (
                      <div className="flex items-center gap-2 mb-3">
                        {item.restaurantId.images?.logo && (
                          <img 
                            src={item.restaurantId.images.logo} 
                            alt={item.restaurantId.name} 
                            className="w-6 h-6 object-cover rounded-full"
                          />
                        )}
                        <span className="text-sm text-gray-600">{item.restaurantId.name}</span>
                      </div>
                    )}
                    
                    {/* Food image */}
                    <div className="w-full h-40 mb-4 rounded-lg overflow-hidden">
                      <img
                        src={item.image || 'https://via.placeholder.com/300x200?text=No+Image'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                        }}
                      />
                    </div>
                    
                    {/* Food info */}
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.name}</h3>
                    <p className="text-gray-600 mb-4">{item.description || 'No description available'}</p>
                    
                    {/* Dietary info */}
                    {item.dietary && (
                      <div className="flex gap-2 mb-3">
                        {item.dietary.isVegetarian && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Vegetarian</span>
                        )}
                        {item.dietary.isVegan && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Vegan</span>
                        )}
                        {item.dietary.isGlutenFree && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Gluten Free</span>
                        )}
                      </div>
                    )}
                    
                    {/* Variations or base price */}
                    <div className="flex flex-wrap gap-2">
                      {item.variations && item.variations.length > 0 ? (
                        item.variations.map((variation, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleAddItem(item, variation)}
                            className="flex items-center px-4 py-2 rounded-lg border border-orange-500 hover:bg-orange-500 hover:text-white text-orange-500 transition-colors text-sm font-medium"
                          >
                            <span>{variation.name} - LKR {variation.price.toFixed(2)}</span>
                            <FiPlus className="ml-2" />
                          </button>
                        ))
                      ) : (
                        <button
                          onClick={() => handleAddItem(item)}
                          className="flex items-center px-4 py-2 rounded-lg border border-orange-500 hover:bg-orange-500 hover:text-white text-orange-500 transition-colors text-sm font-medium"
                        >
                          <span>LKR {item.price.toFixed(2)}</span>
                          <FiPlus className="ml-2" />
                        </button>
                      )}
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

export default Menu;