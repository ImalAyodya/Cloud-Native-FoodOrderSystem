import React from 'react';
import { FiSearch } from 'react-icons/fi';

const SearchSection = ({ categories }) => {
  return (
    <section className="py-12 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="bg-white p-6 rounded-lg shadow-md -mt-20 relative z-30">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search for food..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <select className="md:w-48 py-3 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent">
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.name} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            <button className="bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-md transition duration-300">
              Search
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchSection;