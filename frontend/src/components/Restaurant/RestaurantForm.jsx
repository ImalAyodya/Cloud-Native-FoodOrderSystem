import React, { useState } from 'react';
import axios from 'axios';

const RestaurantForm = ({ restaurant, onClose, onSubmit }) => {
  const [formData, setFormData] = useState(
    restaurant || {
      name: '',
      description: '',
      address: '',
      location: { coordinates: [0, 0], city: '' },
      contact: { email: '', phone: '' },
      cuisine: [],
      businessHours: [],
      images: { logo: '', banner: '' },
      priceRange: '',
      deliveryFee: 0,
      minOrder: 0,
      isAvailable: true,
      status: 'pending',
      ownerId: '507f1f77bcf86cd799439012', // Hardcoded for now
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      const url = restaurant
        ? `http://localhost:5003/api/restaurant/update/${restaurant._id}`
        : 'http://localhost:5003/api/restaurant/add';
      const method = restaurant ? 'put' : 'post';

      await axios[method](url, formData);

      alert(restaurant ? 'Restaurant updated' : 'Restaurant added');
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
        <h2 style={{ margin: '0 0 20px 0' }}>
          {restaurant ? 'Edit Restaurant' : 'Add Restaurant'}
        </h2>
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
            <label htmlFor="address" style={{ display: 'block', marginBottom: '5px' }}>
              Address
            </label>
            <input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label htmlFor="city" style={{ display: 'block', marginBottom: '5px' }}>
              City
            </label>
            <input
              id="city"
              name="city"
              value={formData.location.city}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  location: { ...formData.location, city: e.target.value },
                })
              }
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>
              Email
            </label>
            <input
              id="email"
              name="email"
              value={formData.contact.email}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  contact: { ...formData.contact, email: e.target.value },
                })
              }
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label htmlFor="phone" style={{ display: 'block', marginBottom: '5px' }}>
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              value={formData.contact.phone}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  contact: { ...formData.contact, phone: e.target.value },
                })
              }
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

export default RestaurantForm;