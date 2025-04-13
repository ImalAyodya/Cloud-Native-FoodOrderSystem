import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTimes, FaUtensils, FaCheckCircle, FaSearch } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddItemsModal = ({ foods, onAddItem, onClose, restaurantName }) => {
  const [selectedSizes, setSelectedSizes] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [addedItems, setAddedItems] = useState({});
  const modalRef = useRef(null);

  // Extract unique categories
  const categories = ['all', ...new Set(foods.map(food => food.category || 'Other'))];
  
  // Filter foods based on search and category
  const filteredFoods = foods.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (food.description && food.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = activeCategory === 'all' || food.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSizeChange = (foodId, sizeIndex) => {
    if (foods && foodId) {
      const food = foods.find(f => f._id === foodId);
      if (food && food.sizes && food.sizes[sizeIndex]) {
        setSelectedSizes({
          ...selectedSizes,
          [foodId]: food.sizes[sizeIndex]
        });
      }
    }
  };

  const handleAddItem = (food) => {
    const selectedSize = selectedSizes[food._id];
    if (!selectedSize) {
      toast.warning('Please select a size first');
      return;
    }
    
    const itemToAdd = {
      _id: food._id,
      name: food.name,
      price: selectedSize.price,
      size: selectedSize.size,
      category: food.category || 'Other',
      imageUrl: food.imageUrl
    };
    
    // Track added items to show feedback
    setAddedItems(prev => ({
      ...prev,
      [`${food._id}-${selectedSize.size}`]: {
        count: (prev[`${food._id}-${selectedSize.size}`]?.count || 0) + 1,
        timestamp: Date.now()
      }
    }));
    
    // Call the parent component's onAddItem function
    onAddItem(itemToAdd);
    
    // Show a toast notification
    toast.success(`Added ${food.name} (${selectedSize.size})`);
  };

  // Handle close when clicked outside
  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  // Clear added item feedback after 2 seconds
  useEffect(() => {
    const timers = Object.entries(addedItems).map(([key, data]) => {
      return setTimeout(() => {
        setAddedItems(prev => {
          const newItems = { ...prev };
          delete newItems[key];
          return newItems;
        });
      }, 2000);
    });
    
    return () => timers.forEach(timer => clearTimeout(timer));
  }, [addedItems]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        delayChildren: 0.1,
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95, transition: { duration: 0.1 } }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={handleOutsideClick}
    >
      <ToastContainer 
        position="top-center" 
        autoClose={2000} 
        hideProgressBar={false} 
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      <motion.div
        ref={modalRef}
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white rounded-2xl p-0 max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header Section */}
        <div className="bg-orange-500 text-white p-6 relative">
          <motion.button 
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            onClick={onClose}
            className="absolute right-4 top-4 text-white bg-orange-600 hover:bg-orange-700 rounded-full p-2 transition-colors"
            aria-label="Close modal"
          >
            <FaTimes size={16} />
          </motion.button>
          <div className="flex items-center">
            <div className="bg-white bg-opacity-20 p-3 rounded-full mr-4">
              <FaUtensils className="text-white" size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Add Items</h2>
              <p className="text-orange-100 mt-1">
                From {restaurantName || 'Restaurant'}
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search for items..."
              className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Category Pills - Non-Scrollable */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex flex-wrap gap-2 pb-1">
            {categories.map(category => (
              <motion.button
                key={category}
                variants={buttonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === category
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>
        
        {/* Food Items List */}
        <motion.div 
          className="overflow-y-auto flex-1 p-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredFoods.length > 0 ? (
            <ul className="grid grid-cols-1 gap-4">
              {filteredFoods.map((food, index) => (
                <motion.li
                  key={index}
                  variants={itemVariants}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  <div className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Food Image */}
                      <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden shadow-sm">
                        <img
                          src={food.imageUrl || 'https://via.placeholder.com/80'}
                          alt={food.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/80?text=Food';
                          }}
                        />
                        {/* Added indicator */}
                        <AnimatePresence>
                          {selectedSizes[food._id] && addedItems[`${food._id}-${selectedSizes[food._id].size}`] && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="absolute inset-0 bg-green-500 bg-opacity-80 flex items-center justify-center"
                            >
                              <div className="text-white text-center">
                                <FaCheckCircle size={24} className="mx-auto mb-1" />
                                <span className="text-xs font-bold">
                                  Added {addedItems[`${food._id}-${selectedSizes[food._id].size}`].count}
                                </span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-800 text-lg">{food.name}</h3>
                            {food.description && (
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{food.description}</p>
                            )}
                          </div>
                          <div className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
                            {food.category || 'Other'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Size Selection and Add Button */}
                    <div className="mt-4 flex items-end gap-3">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Select Size:</label>
                        <select 
                          className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                          onChange={(e) => handleSizeChange(food._id, parseInt(e.target.value))}
                          value={selectedSizes[food._id] ? 
                            food.sizes.findIndex(s => s.size === selectedSizes[food._id].size) : ""
                          }
                        >
                          <option value="" disabled>Choose size</option>
                          {food.sizes && food.sizes.map((sizeOption, sizeIndex) => (
                            <option key={sizeIndex} value={sizeIndex}>
                              {sizeOption.size} - ${sizeOption.price.toFixed(2)}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <motion.button
                        variants={buttonVariants}
                        initial="initial"
                        whileHover={selectedSizes[food._id] ? "hover" : "initial"}
                        whileTap={selectedSizes[food._id] ? "tap" : "initial"}
                        onClick={() => handleAddItem(food)}
                        className={`flex items-center justify-center h-10 px-5 rounded-lg transition-colors duration-200 ${
                          selectedSizes[food._id]
                            ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-md'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                        disabled={!selectedSizes[food._id]}
                      >
                        <FaPlus size={14} className="mr-2" />
                        Add
                      </motion.button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 px-4"
            >
              <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 border border-gray-200">
                <FaTimes size={32} className="text-gray-400" />
              </div>
              <h3 className="font-medium text-gray-700 text-lg mb-2">No items found</h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                {searchTerm 
                  ? `No items match "${searchTerm}" in the ${activeCategory !== 'all' ? activeCategory : ''} category`
                  : "No items available in this category"}
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Action Buttons at Bottom */}
        <div className="bg-gray-50 p-4 border-t border-gray-200">
          <div className="flex justify-end">
            <motion.button
              variants={buttonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              onClick={onClose}
              className="flex items-center justify-center px-6 py-3 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors mr-3"
            >
              Cancel
            </motion.button>
            <motion.button
              variants={buttonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              onClick={onClose}
              className="flex items-center justify-center px-6 py-3 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-md"
            >
              Done
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AddItemsModal;