import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { deleteMenuItem } from '../../services/menuItemService';
import MenuItemForm from '../../components/Restaurant/MenuItemForm';
import Header from '../../components/Restaurant/RestaurantHeader';
import RestaurantSidebar from '../../components/Restaurant/RestaurantSidebar';
import axios from 'axios'; // Import axios for direct API calls

const MenuItemManagement = () => {
  const { id } = useParams(); // This is the restaurant ID from the URL
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BACKEND_BASE_URL = 'http://localhost:5003';

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      
      // Check if restaurant ID exists
      if (!id) {
        setError("No restaurant ID provided");
        setLoading(false);
        return;
      }
      
      console.log("Fetching menu items for restaurant ID:", id);
      
      // Make a direct API call without using the menuItemService
      const response = await axios.get(`${BACKEND_BASE_URL}/api/menu/${id}/menu`);
      const responseData = response.data;
      
      console.log("Menu items received:", responseData);
      
      // Check if data exists in the response - adapt to the actual structure
      const menuItemsData = responseData.data || responseData.menuItems || [];
      setMenuItems(menuItemsData);
      
      if (menuItemsData.length === 0) {
        console.log("No menu items found in response");
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      setError("Failed to load menu items: " + (error.response?.data?.message || error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchMenuItems();
    }
  }, [id]);

  const handleAddMenuItem = (newMenuItem) => {
    setMenuItems([...menuItems, newMenuItem]);
    setIsFormOpen(false);
    fetchMenuItems();
  };

  const handleEditMenuItem = (menuItem) => {
    setEditingMenuItem(menuItem);
    setIsFormOpen(true);
  };

  const handleUpdateMenuItem = (updatedMenuItem) => {
    setMenuItems(menuItems.map(item => (item._id === updatedMenuItem._id ? updatedMenuItem : item)));
    setEditingMenuItem(null);
    setIsFormOpen(false);
    fetchMenuItems();
  };

  const handleDeleteMenuItem = async (menuItemId) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        await deleteMenuItem(menuItemId);
        setMenuItems(menuItems.filter(item => item._id !== menuItemId));
        alert('Menu item deleted successfully!');
      } catch (error) {
        console.error('Error deleting menu item:', error);
        alert('Failed to delete menu item.');
      }
    }
  };

  const handleCloseForm = () => {
    setEditingMenuItem(null);
    setIsFormOpen(false);
  };

  const handleAddItem = () => {
    setIsFormOpen(true);
    setEditingMenuItem(null);
  };

  return (
    <div className="flex">
      <RestaurantSidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header isNotHome={true} />
        <main className="flex-1 p-6 bg-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Menu Items</h1>
            {id && (
              <button
                onClick={handleAddItem}
                className="bg-indigo-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700"
              >
                Add Menu Item
              </button>
            )}
          </div>

          {isFormOpen && (
            <div className="mb-8">
              <MenuItemForm
                restaurantId={id} 
                menuItem={editingMenuItem}
                onSubmit={editingMenuItem ? handleUpdateMenuItem : handleAddMenuItem}
                onClose={handleCloseForm}
              />
            </div>
          )}

          {loading ? (
            <p>Loading menu items...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {menuItems.length > 0 ? (
                menuItems.map((item) => (
                  <div
                    key={item._id}
                    className="relative shadow-md rounded-md p-4 text-black"
                    style={{ height: '250px' }}
                  >
                    {/* Background image with opacity */}
                    <div
                      className="absolute inset-0 bg-cover bg-center rounded-md"
                      style={{
                        backgroundImage: `url(${item.image ? `${BACKEND_BASE_URL}${item.image}` : 'https://via.placeholder.com/300'})`,
                        opacity: 0.5,
                      }}
                    ></div>

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-orange bg-opacity-5 rounded-md"></div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col justify-between h-full">
                      <div>
                        <h2 className="text-lg font-bold drop-shadow-md">{item.name}</h2>
                        <p className="text-sm drop-shadow-md">{item.category}</p>
                        <p className="text-lg font-semibold drop-shadow-md">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="mt-2 flex space-x-2">
                        <button
                          onClick={() => handleEditMenuItem(item)}
                          className="bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMenuItem(item._id)}
                          className="bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>No menu items found for this restaurant.</p>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MenuItemManagement;