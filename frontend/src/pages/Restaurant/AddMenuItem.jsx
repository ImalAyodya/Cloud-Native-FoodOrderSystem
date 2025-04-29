// import React from 'react';
// import { useParams } from 'react-router-dom';
// import MenuItemForm from '../../components/Restaurant/MenuItemForm';

// const AddMenuItem = () => {
//   const { restaurantId } = useParams();

//   const handleFormSubmit = () => {
//     alert('Menu item added successfully!');
//     window.location.reload(); // Refresh the page
//   };

//   return (
//     <div className="container mx-auto p-4">
//       {restaurantId ? (
//         <MenuItemForm restaurantId={restaurantId} onSubmit={handleFormSubmit} />
//       ) : (
//         <p className="text-red-500">Restaurant ID is missing. Please check the URL.</p>
//       )}
//     </div>
//   );
// };

// export default AddMenuItem;

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MenuItemForm from '../../components/Restaurant/MenuItemForm';

const AddMenuItem = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate(); // Hook for navigation

  const handleFormSubmit = () => {
    alert('Menu item added successfully!');
    navigate(`/restaurant/${restaurantId}/menu`); // Redirect to the menu page
  };

  return (
    <div className="container mx-auto p-4">
      {restaurantId ? (
        <MenuItemForm restaurantId={restaurantId} onSubmit={handleFormSubmit} />
      ) : (
        <p className="text-red-500">Restaurant ID is missing. Please check the URL.</p>
      )}
    </div>
  );
};

export default AddMenuItem;