import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchMenuItemsByRestaurant, deleteMenuItem } from '../../services/menuItemService';
import MenuItemForm from '../../components/Restaurant/MenuItemForm';
import Header from '../../components/Restaurant/RestaurantHeader';
import RestaurantSidebar from '../../components/Restaurant/RestaurantSidebar';

const MenuItemManagement = () => {
  const { restaurantId } = useParams();
  const [menuItems, setMenuItems] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState(null);

  const BACKEND_BASE_URL = 'http://localhost:5003';

  const fetchMenuItems = async () => {
    try {
      const data = await fetchMenuItemsByRestaurant(restaurantId);
      setMenuItems(data.menuItems);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchMenuItems();
    }
  }, [restaurantId]);

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

  return (
    <div className="flex">
      <RestaurantSidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header isNotHome={true} />
        <main className="flex-1 p-6 bg-gray-100">
          <h1 className="text-2xl font-bold mb-4">Menu Items</h1>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-indigo-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700 mb-4"
          >
            Add Menu Item
          </button>

          {isFormOpen && (
            <div className="mb-8">
              <MenuItemForm
                restaurantId={restaurantId}
                menuItem={editingMenuItem}
                onSubmit={editingMenuItem ? handleUpdateMenuItem : handleAddMenuItem}
                onClose={handleCloseForm}
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {menuItems.length > 0 ? (
              menuItems.map((item) => (
                <div
                  key={item._id}
                  className="relative shadow-md rounded-md p-4 text-black"
                  style={{ height: '250px' }}
                >
                  {/* Pseudo-element for background image with opacity */}
                  <div
                    className="absolute inset-0 bg-cover bg-center rounded-md"
                    style={{
                      backgroundImage: `url(${item.image ? `${BACKEND_BASE_URL}${item.image}` : 'https://via.placeholder.com/300'})`,
                      opacity: 0.5, // Adjust opacity here (0 to 1)
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
              <p>No menu items found.</p>
            )}
          </div>
        </main>
        
      </div>
    </div>
  );
};

export default MenuItemManagement;