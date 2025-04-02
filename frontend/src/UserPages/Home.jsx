import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUtensils, FaTruckMoving, FaClock, FaAward, FaArrowRight } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import Header from './Header';
import Footer from './Footer';

const Home = () => {
  const featuredRef = useRef(null);

  const scrollToFeatured = () => {
    featuredRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  // Sample featured dishes data
  const featuredDishes = [
    {
      id: 1,
      name: 'Premium Beef Burger',
      description: 'Juicy beef patty with cheese, lettuce, and our special sauce',
      price: 12.99,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      category: 'Burgers'
    },
    {
      id: 2,
      name: 'Margherita Pizza',
      description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
      price: 14.99,
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      category: 'Pizza'
    },
    {
      id: 3,
      name: 'Grilled Salmon',
      description: 'Fresh salmon fillet with lemon butter sauce and seasonal vegetables',
      price: 18.99,
      image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      category: 'Seafood'
    },
    {
      id: 4,
      name: 'Chicken Biryani',
      description: 'Fragrant basmati rice cooked with tender chicken and aromatic spices',
      price: 15.99,
      image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      category: 'Asian'
    }
  ];

  // Food categories
  const categories = [
    { name: 'Burgers', icon: '🍔', color: 'bg-red-500' },
    { name: 'Pizza', icon: '🍕', color: 'bg-yellow-500' },
    { name: 'Asian', icon: '🍜', color: 'bg-green-500' },
    { name: 'Seafood', icon: '🍤', color: 'bg-blue-500' },
    { name: 'Desserts', icon: '🍰', color: 'bg-pink-500' },
    { name: 'Drinks', icon: '🍹', color: 'bg-purple-500' }
  ];

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <>
        <Header />
      <div> {/* Padding to account for fixed header */}
        {/* Hero Section */}
        <section className="relative h-screen">
          <div className="absolute inset-0 bg-black opacity-60 z-10"></div>
          <div 
            className="absolute inset-0 bg-cover bg-center z-0"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80)' }}
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
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={fadeInUp} className="flex items-center space-x-2">
                  <div className="bg-white/20 backdrop-blur-lg p-2 rounded-full">
                    <FaTruckMoving className="text-white text-xl" />
                  </div>
                  <span className="text-white font-medium">Fast Delivery</span>
                </motion.div>

                <motion.div variants={fadeInUp} className="flex items-center space-x-2">
                  <div className="bg-white/20 backdrop-blur-lg p-2 rounded-full">
                    <FaUtensils className="text-white text-xl" />
                  </div>
                  <span className="text-white font-medium">Quality Food</span>
                </motion.div>

                <motion.div variants={fadeInUp} className="flex items-center space-x-2">
                  <div className="bg-white/20 backdrop-blur-lg p-2 rounded-full">
                    <FaClock className="text-white text-xl" />
                  </div>
                  <span className="text-white font-medium">30 Min Delivery</span>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Scroll down indicator */}
          <motion.div 
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20"
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <button 
              onClick={scrollToFeatured}
              className="flex flex-col items-center text-white"
            >
              <span className="mb-2">Scroll Down</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </motion.div>
        </section>

        {/* Search Section */}
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
                    <option key={category.name} value={category.name}>{category.name}</option>
                  ))}
                </select>
                <button className="bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-md transition duration-300">
                  Search
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
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
                  <div className={`${category.color} w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl mb-4`}>
                    {category.icon}
                  </div>
                  <h3 className="font-medium">{category.name}</h3>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Featured Dishes Section */}
        <section ref={featuredRef} className="py-16 bg-gray-50">
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
                    <span className="text-xs font-semibold px-2 py-1 bg-gray-100 rounded-full text-gray-600">{dish.category}</span>
                    <h3 className="text-xl font-bold mt-2 mb-1">{dish.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{dish.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-orange-500">${dish.price.toFixed(2)}</span>
                      <button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full w-10 h-10 flex items-center justify-center transition duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

        {/* How It Works Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-2">How It Works</h2>
              <p className="text-gray-600">Easy steps to order your favorite food</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <div className="bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center text-orange-500 text-2xl font-bold mx-auto mb-6">
                  1
                </div>
                <h3 className="text-xl font-bold mb-3">Choose Your Food</h3>
                <p className="text-gray-600">Browse our menu and select your favorite dishes</p>
              </motion.div>

              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center text-orange-500 text-2xl font-bold mx-auto mb-6">
                  2
                </div>
                <h3 className="text-xl font-bold mb-3">Make Payment</h3>
                <p className="text-gray-600">Pay securely with your preferred payment method</p>
              </motion.div>

              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <div className="bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center text-orange-500 text-2xl font-bold mx-auto mb-6">
                  3
                </div>
                <h3 className="text-xl font-bold mb-3">Receive Delivery</h3>
                <p className="text-gray-600">Your food will be delivered to your doorstep fast</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-2">What Our Customers Say</h2>
              <p className="text-gray-600">We value customer feedback</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((item) => (
                <motion.div 
                  key={item}
                  className="bg-white p-6 rounded-lg shadow-md"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden mr-4">
                      <img 
                        src={`https://randomuser.me/api/portraits/${item === 2 ? 'women' : 'men'}/${item + 10}.jpg`} 
                        alt="Customer" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold">{item === 1 ? 'John Doe' : item === 2 ? 'Jane Smith' : 'Robert Johnson'}</h4>
                      <div className="flex text-orange-500">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600">
                    {item === 1 
                      ? "The food quality is amazing and always arrives hot. Delivery is super fast too! I'm a regular customer now."
                      : item === 2 
                      ? "I love the variety of options available. The app is easy to use and the delivery drivers are always professional."
                      : "Best food delivery service I've tried. Great prices, excellent food quality, and fantastic customer service!"
                    }
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        
      </div>
      <Footer />
    </>
  );
};

export default Home;