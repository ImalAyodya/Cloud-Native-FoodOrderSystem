// import React, { useState, useEffect } from 'react';
// import { fetchRestaurants } from '../../services/restaurantService';
// import RestaurantForm from '../../components/Restaurant/RestaurantForm';

// const RestaurantList = () => {
//   const [restaurants, setRestaurants] = useState([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedRestaurant, setSelectedRestaurant] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const data = await fetchRestaurants();
//         setRestaurants(data.restaurants); // Assuming the API returns restaurants in `restaurants`
//       } catch (error) {
//         console.error('Error fetching restaurants:', error);
//         alert('Failed to fetch restaurants.');
//       }
//     };

//     fetchData();
//   }, []);

//   const handleAddEdit = (restaurant = null) => {
//     setSelectedRestaurant(restaurant);
//     setIsModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setSelectedRestaurant(null);
//   };

//   const handleSubmit = () => {
//     fetchRestaurants();
//     handleCloseModal();
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-4">Restaurants</h1>
//       <button
//         style={{
//           backgroundColor: '#007bff',
//           color: 'white',
//           padding: '10px 20px',
//           border: 'none',
//           borderRadius: '5px',
//           cursor: 'pointer',
//         }}
//         onClick={() => handleAddEdit()}
//       >
//         Add Restaurant
//       </button>
//       <ul>
//         {restaurants.map((restaurant) => (
//           <li key={restaurant._id}>
//             <h2>{restaurant.name}</h2>
//             <p>{restaurant.description}</p>
//             <p>{restaurant.address}</p>
//             <p>{restaurant.location.city}</p>
//             <button
//               style={{
//                 backgroundColor: '#20c997',
//                 color: 'white',
//                 padding: '5px 10px',
//                 border: 'none',
//                 borderRadius: '5px',
//                 cursor: 'pointer',
//                 marginRight: '8px',
//               }}
//               onClick={() => handleAddEdit(restaurant)}
//             >
//               Edit
//             </button>
//           </li>
//         ))}
//       </ul>

//       {isModalOpen && (
//         <RestaurantForm
//           restaurant={selectedRestaurant}
//           onClose={handleCloseModal}
//           onSubmit={handleSubmit}
//         />
//       )}
//     </div>
//   );
// };

// export default RestaurantList;