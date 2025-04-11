
          import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight, FaShoppingCart } from 'react-icons/fa';

const FeaturedDishesSection = ({ featuredDishes, fadeInUp, staggerContainer }) => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
      <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-4 relative inline-block">
            Featured Dishes
            <motion.span 
              className="absolute -bottom-2 left-0 w-full h-1 bg-orange-500"
              initial={{ width: 0 }}
              whileInView={{ width: '100%' }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          </h2>
          <motion.p 
            className="text-gray-600 text-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Discover our most popular dishes
          </motion.p>
        </motion.div>

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
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative h-48 overflow-hidden">
                <motion.img
                  src={dish.image}
                  alt={dish.name}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                />
              </div>
              <div className="p-6">
                <motion.span 
                  className="text-xs font-semibold px-3 py-1 bg-orange-100 text-orange-600 rounded-full"
                  whileHover={{ scale: 1.05 }}
                >
                  {dish.category}
                </motion.span>
                <h3 className="text-xl font-bold mt-3 mb-2">{dish.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{dish.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-orange-500">
                    ${dish.price.toFixed(2)}
                  </span>
                  <motion.button 
                    className="bg-orange-500 hover:bg-orange-600 text-white rounded-full w-12 h-12 flex items-center justify-center group"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FaShoppingCart className="transform group-hover:scale-110 transition-transform" />
                  </motion.button>
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