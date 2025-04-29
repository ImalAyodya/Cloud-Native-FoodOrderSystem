import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MenuItemForm from '../../components/Restaurant/MenuItemForm';
import { toast } from 'react-toastify';

const AddMenuItem = () => {
  const params = useParams();
  const { id } = params; // Get the ID directly
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  
  // Debug output
  console.log("AddMenuItem component params:", params);
  console.log("Restaurant ID from URL params:", id);
  
  useEffect(() => {
    // Validate token on component mount
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      toast.error('Authentication required. Please login first.');
      navigate('/login');
    } else {
      setToken(storedToken);
    }
    
    // Validate restaurant ID
    if (!id) {
      toast.error('Restaurant ID is missing. Please go back to restaurant page.');
      console.error("No restaurant ID in URL params");
    } else {
      console.log('Restaurant ID from URL:', id);
    }
  }, [id, navigate]);

  const handleFormSubmit = () => {
    toast.success('Menu item added successfully!');
    navigate(`/restaurant/${id}/menu`); // Redirect to the menu page
  };

  return (
    <div className="container mx-auto p-4">
      {id ? (
        <>
          <h1 className="text-2xl font-bold mb-4">Add New Menu Item</h1>
          <p className="mb-6">Restaurant ID: {id}</p>
          <MenuItemForm 
            restaurantId={id} 
            onSubmit={handleFormSubmit}
            onClose={() => navigate(`/restaurant/${id}/menu`)}
          />
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-red-500 text-xl font-semibold">Restaurant ID is missing. Please check the URL.</p>
          <button 
            onClick={() => navigate('/restaurant/my-restaurants')}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          >
            Go to My Restaurants
          </button>
        </div>
      )}
    </div>
  );
};

export default AddMenuItem;