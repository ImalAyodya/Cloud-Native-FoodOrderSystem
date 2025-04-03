import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight, FaTruckMoving, FaUtensils, FaClock } from 'react-icons/fa';

const HeroSection = ({ scrollToFeatured }) => {
  return (
    <section className="relative h-screen">
      <div className="absolute inset-0 bg-black opacity-60 z-10"></div>
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80)',
        }}
      ></div>

      <div className="container mx-auto px-4 h-full flex items-center relative z-20">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Delicious Food <span className="text-orange-500">Delivered</span> to Your Doorstep
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              Experience the best quality food from the comfort of your home with our fast and reliable delivery service.
            </p>

            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <Link
                to="/menu"
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-md transition duration-300 flex items-center justify-center"
              >
                <span>Explore Our Menu</span>
                <FaArrowRight className="ml-2" />
              </Link>
              <button
                onClick={scrollToFeatured}
                className="bg-white hover:bg-gray-100 text-orange-500 font-medium py-3 px-6 rounded-md transition duration-300"
              >
                Today's Specials
              </button>
            </div>
          </motion.div>

          <motion.div
            className="flex flex-wrap gap-4 mt-10"
            initial="hidden"
            animate="visible"
          >
            <motion.div className="flex items-center space-x-2">
              <div className="bg-white/20 backdrop-blur-lg p-2 rounded-full">
                <FaTruckMoving className="text-white text-xl" />
              </div>
              <span className="text-white font-medium">Fast Delivery</span>
            </motion.div>

            <motion.div className="flex items-center space-x-2">
              <div className="bg-white/20 backdrop-blur-lg p-2 rounded-full">
                <FaUtensils className="text-white text-xl" />
              </div>
              <span className="text-white font-medium">Quality Food</span>
            </motion.div>

            <motion.div className="flex items-center space-x-2">
              <div className="bg-white/20 backdrop-blur-lg p-2 rounded-full">
                <FaClock className="text-white text-xl" />
              </div>
              <span className="text-white font-medium">30 Min Delivery</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;