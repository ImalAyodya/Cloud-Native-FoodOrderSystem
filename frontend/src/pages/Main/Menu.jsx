import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../../components/Main/Header';
import Footer from '../../components/Main/Footer';
import { FiPlus, FiShoppingCart, FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedItems, setSelectedItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedItems = sessionStorage.getItem('selectedItems');
    if (storedItems) {
      try {
        const parsedItems = JSON.parse(storedItems);
        setSelectedItems(parsedItems);
      } catch (error) {
        console.error("Failed to parse cart items from sessionStorage:", error);
        sessionStorage.removeItem('selectedItems');
      }
    }
  }, []);

  useEffect(() => {
    const totalCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(totalCount);

    if (selectedItems.length > 0) {
      sessionStorage.setItem('selectedItems', JSON.stringify(selectedItems));
    }
  }, [selectedItems]);

  const restaurants = [
    {
      id: "67fa25b81331d416afb5c3fb",
      name: "DigiDine Restaurant",
      logo: "https://via.placeholder.com/80x80.png?text=DigiDine",
      rating: 4.7,
      categories: ["Burgers", "Pizza", "Salads"],
      foods: [
        {
          id: "food1",
          name: "Classic Cheeseburger",
          description: "Juicy beef patty with melted cheese, lettuce, tomato, and our secret sauce",
          category: "Burgers",
          imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
          sizes: [
            { size: "Regular", price: 9.99 },
            { size: "Large", price: 12.99 },
            { size: "Double", price: 15.99 }
          ]
        },
      ]
    },
  ];

  const allCategories = ["All", ...new Set(restaurants.flatMap(restaurant => restaurant.categories))];

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredFoods = restaurants.flatMap(restaurant => restaurant.foods).filter(food => {
    const matchesCategory = activeCategory === 'All' || food.category === activeCategory;
    const matchesSearch = searchQuery === '' || food.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddItem = (restaurantId, restaurantName, food, size) => {
    const newItem = {
      restaurantId,
      restaurantName,
      foodId: food.id,
      name: food.name,
      size: size.size,
      price: size.price,
      image: food.imageUrl,
      quantity: 1,
    };

    setSelectedItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) =>
          item.foodId === food.id &&
          item.size === size.size &&
          item.restaurantId === restaurantId
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += 1;
        return updatedItems;
      } else {
        return [...prevItems, newItem];
      }
    });

    toast.success(`Added ${food.name} (${size.size}) to cart`);
  };

  return (
    <>
      <Header />
      <ToastContainer position="top-center" autoClose={2000} />

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
              Explore Our Menu
            </motion.h1>
            <motion.p 
              className="text-xl text-white/90 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Discover delicious food from our partner restaurants and order your favorites
            </motion.p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFoods.map(food => (
              <div key={food.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="w-full h-32 mb-4 rounded-lg overflow-hidden">
                    <img
                      src={food.imageUrl}
                      alt={food.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{food.name}</h3>
                  <p className="text-gray-600 mb-4">{food.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {food.sizes.map((size, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAddItem("67fa25b81331d416afb5c3fb", "DigiDine Restaurant", food, size)}
                        className="flex items-center px-4 py-2 rounded-lg border border-orange-500 hover:bg-orange-500 hover:text-white text-orange-500 transition-colors text-sm font-medium"
                      >
                        <span>{size.size} - ${size.price.toFixed(2)}</span>
                        <FiPlus className="ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Menu;