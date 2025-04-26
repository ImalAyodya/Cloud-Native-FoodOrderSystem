import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchMenuItemsByRestaurant , deleteMenuItem } from '../../services/menuItemService';
import MenuItemForm from '../../components/Restaurant/MenuItemForm';
import Header from '../../components/Main/Header';
import Footer from '../../components/Main/Footer';
import RestaurantSidebar from '../../components/Restaurant/RestaurantSidebar';

const MenuItemManagement = () => {
  const { restaurantId } = useParams();
  const [menuItems, setMenuItems] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState(null); // Track the menu item being edited

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
    fetchMenuItems(); // Refresh the list
  };

  const handleEditMenuItem = (menuItem) => {
    setEditingMenuItem(menuItem); // Set the menu item to edit
    setIsFormOpen(true); // Open the form
  };

  const handleUpdateMenuItem = (updatedMenuItem) => {
    setMenuItems(menuItems.map(item => (item._id === updatedMenuItem._id ? updatedMenuItem : item)));
    setEditingMenuItem(null); // Clear the editing state
    setIsFormOpen(false); // Close the form
    fetchMenuItems(); // Refresh the list
  };

  const handleDeleteMenuItem = async (menuItemId) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        await deleteMenuItem(menuItemId);
        setMenuItems(menuItems.filter(item => item._id !== menuItemId)); // Remove from local state
        alert('Menu item deleted successfully!');
      } catch (error) {
        console.error('Error deleting menu item:', error);
        alert('Failed to delete menu item.');
      }
    }
  };

  const handleCloseForm = () => {
    setEditingMenuItem(null); // Clear the editing state
    setIsFormOpen(false); // Close the form
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <RestaurantSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <Header isNotHome={true} />

        {/* Menu Items Section */}
        <main className="flex-1 p-6 bg-gray-100">
          <h1 className="text-2xl font-bold mb-4">Menu Items</h1>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-indigo-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700 mb-4"
          >
            Add Menu Item
          </button>

          {isFormOpen && (
            <div className="mb-8"> {/* Add margin to separate the form from the list */}
              <MenuItemForm
                restaurantId={restaurantId}
                menuItem={editingMenuItem} // Pass the menu item to edit (null for adding)
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
                  className="relative bg-cover bg-center shadow-md rounded-md p-4 text-white"
                  style={{
                    backgroundImage: `url(${item.image || 'https://via.placeholder.com/300'})`, // Use item.image or a placeholder
                    height: '250px', // Increased height for better visibility
                  }}
                >
                  {/* Overlay for better text visibility */}
                  <div className="absolute inset-0 bg-orange bg-opacity-5 rounded-md"></div> {/* Reduced opacity */}

                  {/* Content */}
                  <div className="relative z-10 flex flex-col justify-between h-full">
                    <div>
                      <h2 className="text-lg font-bold drop-shadow-md">{item.name}</h2> {/* Added drop shadow */}
                      <p className="text-sm drop-shadow-md">{item.category}</p> {/* Added drop shadow */}
                      <p className="text-lg font-semibold drop-shadow-md">${item.price.toFixed(2)}</p> {/* Added drop shadow */}
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

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default MenuItemManagement;