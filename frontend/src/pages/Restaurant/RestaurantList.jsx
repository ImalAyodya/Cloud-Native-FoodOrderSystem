import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RestaurantForm from '../../components/Restaurant/RestaurantForm';

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get('http://localhost:5003/api/restaurant/get');
      setRestaurants(response.data);
    } catch (error) {
      alert('Error fetching restaurants: ' + (error.response?.data?.message || 'Server error'));
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleAddEdit = (restaurant = null) => {
    setSelectedRestaurant(restaurant);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRestaurant(null);
  };

  const handleSubmit = () => {
    fetchRestaurants();
    handleCloseModal();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px' }}>
      <h1>Restaurants</h1>
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
        Add Restaurant
      </button>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Description</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Address</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>City</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {restaurants.map((restaurant) => (
            <tr key={restaurant._id}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{restaurant.name}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{restaurant.description}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{restaurant.address}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{restaurant.location.city}</td>
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
                  onClick={() => handleAddEdit(restaurant)}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <RestaurantForm
          restaurant={selectedRestaurant}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default RestaurantList;