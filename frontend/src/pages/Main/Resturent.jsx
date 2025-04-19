import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Main/Header';
import Footer from '../../components/Main/Footer';

const Resturent = () => {
  const navigate = useNavigate();

  const restaurants = [
    {
      id: "1",
      name: "The Cheesecake Factory",
      description: "Famous for its extensive menu and delicious cheesecakes.",
      imageUrl: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "2",
      name: "Olive Garden",
      description: "Italian-inspired dishes with unlimited breadsticks.",
      imageUrl: "https://chatgpt.com/c/68033b4c-dffc-8010-8e72-d7ed8c103eec",
    },
    {
      id: "3",
      name: "Chipotle Mexican Grill",
      description: "Build-your-own burritos, tacos, and bowls.",
      imageUrl: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "4",
      name: "Panda Express",
      description: "American Chinese cuisine with bold flavors.",
      imageUrl: "https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    },
  ];

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
              Discover some of the best restaurants around the world.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Restaurants Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {restaurants.map((restaurant) => (
              <motion.div
                key={restaurant.id}
                className="bg-white rounded-xl shadow-md overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="w-full h-48 overflow-hidden">
                  <img
                    src={restaurant.imageUrl}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {restaurant.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{restaurant.description}</p>
                  <button
                    onClick={() => navigate(`/menu?restaurantId=${restaurant.id}`)}
                    className="text-orange-500 hover:underline"
                  >
                    View Menu
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Resturent;