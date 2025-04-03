import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight } from 'react-icons/fa';

const FeaturedDishesSection = ({ featuredDishes, fadeInUp, staggerContainer }) => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-2">Featured Dishes</h2>
            <p className="text-gray-600">Discover our most popular dishes</p>
          </div>
          <Link
            to="/menu"
            className="flex items-center text-orange-500 font-medium hover:text-orange-600"
          >
            <span>View All</span>
            <FaArrowRight className="ml-2" />
          </Link>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {featuredDishes.map((dish) => (
            <motion.div
              key={dish.id}
              variants={fadeInUp}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition duration-300"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="w-full h-full object-cover transform hover:scale-110 transition duration-500"
                />
              </div>
              <div className="p-6">
                <span className="text-xs font-semibold px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                  {dish.category}
                </span>
                <h3 className="text-xl font-bold mt-2 mb-1">{dish.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{dish.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-orange-500">
                    ${dish.price.toFixed(2)}
                  </span>
                  <button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full w-10 h-10 flex items-center justify-center transition duration-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedDishesSection;