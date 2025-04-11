import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { motion } from 'framer-motion';

const SearchSection = ({ categories }) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    // Add your search logic here
    console.log('Searching:', { category: selectedCategory, query: searchQuery });
  };

  return (
    <section className="py-12 bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4">
        <motion.div 
          className="bg-white p-8 rounded-2xl shadow-lg -mt-20 relative z-30"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for your favorite dishes..."
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-100 rounded-xl 
                  focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
                  transition-all duration-300 text-gray-700 placeholder-gray-400
                  hover:border-orange-200"
              />
            </div>
            <div className="md:w-56">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full py-4 px-4 border-2 border-gray-100 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
                  transition-all duration-300 text-gray-700
                  hover:border-orange-200 appearance-none cursor-pointer
                  bg-white"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.name} value={category.name.toLowerCase()}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>
            <motion.button 
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white py-4 px-8 
                rounded-xl transition duration-300 flex items-center justify-center
                shadow-lg hover:shadow-xl font-medium text-lg min-w-[120px]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Search
            </motion.button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default SearchSection;