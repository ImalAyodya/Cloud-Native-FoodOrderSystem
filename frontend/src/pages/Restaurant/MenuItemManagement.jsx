import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import MenuItemForm from '../../components/Restaurant/MenuItemForm';
import MenuItemBulkImport from '../../components/Restaurant/MenuItemBulkImport';

const MenuItemManagement = () => {
  const { restaurantId } = useParams();
  const [menuItems, setMenuItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get(`http://localhost:5003/api/menu/${restaurantId}/menu`);
      console.log('Menu items response:', response.data); // Debug log
      setMenuItems(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Fetch menu items error:', error.response?.data || error.message);
      alert('Error fetching menu items: ' + (error.response?.data?.message || 'Server error'));
      setMenuItems([]); // Reset to empty array on error
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchMenuItems();
    }
  }, [restaurantId]);

  const handleAddEdit = (menuItem = null) => {
    setSelectedMenuItem(menuItem);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMenuItem(null);
  };

  const handleBulkImportClose = () => {
    setIsBulkImportOpen(false);
  };

  const handleSubmit = () => {
    fetchMenuItems();
    handleCloseModal();
  };

  const handleBulkImportSubmit = () => {
    fetchMenuItems();
    handleBulkImportClose();
  };

  const handleToggleAvailability = async (menuItem) => {
    try {
      await axios.put(`http://localhost:5003/api/menu/update/${menuItem._id}`, {
        ...menuItem,
        isAvailable: !menuItem.isAvailable,
      });
      fetchMenuItems();
      alert('Menu item updated');
    } catch (error) {
      alert('Error updating menu item: ' + (error.response?.data?.message || 'Server error'));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px' }}>
      <h1>Menu Items for Restaurant {restaurantId}</h1>
      <button
        style={{
          backgroundColor: '#007bff',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
        onClick={() => handleAddEdit()}
      >
        Add Menu Item
      </button>
      <button
        style={{
          backgroundColor: '#20c997',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
        onClick={() => setIsBulkImportOpen(true)}
      >
        Bulk Import
      </button>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Description</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Category</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Price</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Available</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(menuItems) && menuItems.length > 0 ? (
            menuItems.map((item) => (
              <tr key={item._id}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.name}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.description}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.category}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>${item.price}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      id={`available-${item._id}`}
                      checked={item.isAvailable}
                      onChange={() => handleToggleAvailability(item)}
                    />
                    <label htmlFor={`available-${item._id}`} style={{ marginLeft: '8px' }}>
                      {item.isAvailable ? 'Yes' : 'No'}
                    </label>
                  </div>
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <button
                    style={{
                      backgroundColor: '#20c997',
                      color: 'white',
                      padding: '5px 10px',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      marginRight: '8px',
                    }}
                    onClick={() => handleAddEdit(item)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                No menu items found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {isModalOpen && (
        <MenuItemForm
          menuItem={selectedMenuItem}
          restaurantId={restaurantId}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
        />
      )}

      {isBulkImportOpen && (
        <MenuItemBulkImport
          restaurantId={restaurantId}
          onClose={handleBulkImportClose}
          onSubmit={handleBulkImportSubmit}
        />
      )}
    </div>
  );
};

export default MenuItemManagement;