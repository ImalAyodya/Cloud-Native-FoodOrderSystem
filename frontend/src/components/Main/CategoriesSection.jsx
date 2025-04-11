import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const CategoriesSection = ({ categories, fadeInUp, staggerContainer }) => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
      <motion.div 
      className="text-center mb-16"
      initial={{ opacity: 0, y: -20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.span
        className="text-orange-500 text-sm font-semibold tracking-wider uppercase mb-2 block"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        Our Menu
      </motion.span>
      <h2 className="text-4xl font-bold mb-6 relative inline-block">
        Food Categories
        <motion.span 
          className="absolute -bottom-2 left-0 w-full h-1 bg-orange-500"
          initial={{ width: 0 }}
          whileInView={{ width: '100%' }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
      </h2>
      <motion.p 
        className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        Explore our wide range of delicious options, from sizzling burgers to 
        fresh salads. Each category offers a unique culinary experience.
      </motion.p>
  
      </motion.div>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {categories.map((category, index) => (
            <Link to={`/menu/${category.name.toLowerCase()}`} key={category.name}>
              <motion.div
                variants={fadeInUp}
                className="group bg-white hover:shadow-xl rounded-xl p-6 text-center 
                  transition-all duration-300 border border-gray-100 
                  hover:border-orange-200 cursor-pointer transform hover:-translate-y-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className={`${category.color} w-20 h-20 mx-auto rounded-full 
                    flex items-center justify-center text-4xl mb-4 
                    transform group-hover:scale-110 transition-transform duration-300
                    shadow-lg group-hover:shadow-xl`}
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  {category.icon}
                </motion.div>
                <motion.h3 
                  className="font-semibold text-lg group-hover:text-orange-500 
                    transition-colors duration-300"
                >
                  {category.name}
                </motion.h3>
                <motion.span 
                  className="text-sm text-gray-500 opacity-0 group-hover:opacity-100 
                    transition-opacity duration-300 block mt-2"
                >
                  View Menu →
                </motion.span>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CategoriesSection;