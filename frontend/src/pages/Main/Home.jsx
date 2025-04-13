import React, { useRef, useEffect } from 'react';
import Header from '../../components/Main/Header';
import Footer from '../../components/Main/Footer';
import HeroSection from '../../components/Main/HeroSection';
import SearchSection from '../../components/Main/SearchSection';
import CategoriesSection from '../../components/Main/CategoriesSection';
import FeaturedDishesSection from '../../components/Main/FeaturedDishesSection';

const Home = () => {
  const featuredRef = useRef(null);

  const scrollToFeatured = () => {
    featuredRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Set logged-in user to localStorage
    const loggedInUser = {
      id: 'user12345',
      name: 'John Doe', // Replace with the actual user's name
    };
    localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
  }, []);

  const featuredDishes = [
    {
      id: 1,
      name: 'Premium Beef Burger',
      description: 'Juicy beef patty with cheese, lettuce, and our special sauce',
      price: 12.99,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      category: 'Burgers',
    },
    {
      id: 2,
      name: 'Margherita Pizza',
      description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
      price: 14.99,
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      category: 'Pizza',
    },
    {
      id: 3,
      name: 'Grilled Salmon',
      description: 'Fresh salmon fillet with lemon butter sauce and seasonal vegetables',
      price: 18.99,
      image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      category: 'Seafood',
    },
    {
      id: 4,
      name: 'Chicken Biryani',
      description: 'Fragrant basmati rice cooked with tender chicken and aromatic spices',
      price: 15.99,
      image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      category: 'Asian',
    },
  ];

  const categories = [
    { name: 'Burgers', icon: '🍔', color: 'bg-red-500' },
    { name: 'Pizza', icon: '🍕', color: 'bg-yellow-500' },
    { name: 'Asian', icon: '🍜', color: 'bg-green-500' },
    { name: 'Seafood', icon: '🍤', color: 'bg-blue-500' },
    { name: 'Desserts', icon: '🍰', color: 'bg-pink-500' },
    { name: 'Drinks', icon: '🍹', color: 'bg-purple-500' },
    { name: 'Sandwiches', icon: '🥪', color: 'bg-orange-500' },
    { name: 'Salads', icon: '🥗', color: 'bg-teal-500' },
    { name: 'Steaks', icon: '🥩', color: 'bg-gray-500' },
    { name: 'Pasta', icon: '🍝', color: 'bg-yellow-600' },
    { name: 'Breakfast', icon: '🍳', color: 'bg-indigo-500' },
    { name: 'BBQ', icon: '🍖', color: 'bg-red-600' },
];
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <>
      <Header />
      <HeroSection scrollToFeatured={scrollToFeatured} />
      <SearchSection categories={categories} />
      <CategoriesSection
        categories={categories}
        fadeInUp={fadeInUp}
        staggerContainer={staggerContainer}
      />
      <FeaturedDishesSection
        featuredDishes={featuredDishes}
        fadeInUp={fadeInUp}
        staggerContainer={staggerContainer}
      />
      <Footer />
    </>
  );
};

export default Home;