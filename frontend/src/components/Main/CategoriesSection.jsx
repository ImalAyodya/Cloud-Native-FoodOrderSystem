
import React from 'react';
import { motion } from 'framer-motion';

const CategoriesSection = ({ categories, fadeInUp, staggerContainer }) => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">Food Categories</h2>
          <p className="text-gray-600">Explore our wide range of delicious options</p>
        </div>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {categories.map((category) => (
            <motion.div
              key={category.name}
              variants={fadeInUp}
              className="bg-white hover:shadow-xl rounded-lg p-6 text-center transition duration-300 border border-gray-100 cursor-pointer hover:-translate-y-1"
            >
              <div
                className={`${category.color} w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl mb-4`}
              >
                {category.icon}
              </div>
              <h3 className="font-medium">{category.name}</h3>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CategoriesSection;