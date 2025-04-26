import React, { useState } from 'react';
import axios from 'axios';

const MenuItemForm = ({ menuItem, restaurantId, onClose, onSubmit }) => {
  const [formData, setFormData] = useState(
    menuItem || {
      name: '',
      description: '',
      category: '',
      price: 0,
      variations: [],
      image: '',
      gallery: [],
      tags: [],
      ingredients: [],
      nutrition: { calories: 0, allergens: [] },
      dietary: { isVegetarian: false, isVegan: false, isGlutenFree: false },
      featured: false,
      preparationTime: 15,
      isAvailable: true,
      restaurantId,
      createdBy: '507f1f77bcf86cd799439012', // Hardcoded for now
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      const url = menuItem
        ? `http://localhost:5003/api/menu/update/${menuItem._id}`
        : 'http://localhost:5003/api/menu/add';
      const method = menuItem ? 'put' : 'post';

      await axios[method](url, formData);

      alert(menuItem ? 'Menu item updated' : 'Menu item added');
      onSubmit();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || 'Server error'));
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          width: '400px',
          position: 'relative',
        }}
      >
        <h2 style={{ margin: '0 0 20px 0' }}>{menuItem ? 'Edit Menu Item' : 'Add Menu Item'}</h2>
        <button
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
          }}
          onClick={onClose}
        >
          ×
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>
              Name
            </label>
            <input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label htmlFor="description" style={{ display: 'block', marginBottom: '5px' }}>
              Description
            </label>
            <input
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label htmlFor="category" style={{ display: 'block', marginBottom: '5px' }}>
              Category
            </label>
            <input
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label htmlFor="price" style={{ display: 'block', marginBottom: '5px' }}>
              Price
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label htmlFor="preparationTime" style={{ display: 'block', marginBottom: '5px' }}>
              Preparation Time (minutes)
            </label>
            <input
              type="number"
              id="preparationTime"
              name="preparationTime"
              value={formData.preparationTime}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
        </div>
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
            onClick={handleSubmit}
          >
            Save
          </button>
          <button
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemForm;