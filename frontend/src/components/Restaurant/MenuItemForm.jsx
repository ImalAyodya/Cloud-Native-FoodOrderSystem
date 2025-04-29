// import React, { useState, useCallback } from 'react';
// import { addMenuItem, updateMenuItem } from '../../services/menuItemService';

// const MenuItemForm = ({ menuItem, restaurantId, onClose, onSubmit }) => {
//   const [formData, setFormData] = useState(
//     menuItem || {
//       name: '',
//       description: '',
//       category: '',
//       price: 0,
//       variations: [],
//       image: '',
//       gallery: [],
//       tags: [],
//       ingredients: [],
//       nutrition: {
//         calories: null,
//         allergens: [],
//       },
//       dietary: {
//         isVegetarian: false,
//         isVegan: false,
//         isGlutenFree: false,
//         isNonVegetarian: false,
//       },
//       featured: false,
//       preparationTime: 15,
//       isAvailable: true,
//       restaurantId,
//     }
//   );

//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [setImagePreview] = useState('');


//   const categories = [
//     'Appetizers/Starters',
//     'Main Courses/Entrées',
//     'Side Dishes',
//     'Salads',
//     'Sandwiches & Burgers',
//     'Pizza',
//     'Seafood',
//     'Vegetarian/Vegan Options',
//     'Desserts',
//     'Beverages',
//     'Kids\' Menu',
//     'Daily Specials',
//     'Breakfast Items',
//     'Brunch',
//     'Bar Menu',
//     'other',
//   ];

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     if (type === 'checkbox') {
//       const [parent, child] = name.split('.');
//       setFormData({
//         ...formData,
//         [parent]: {
//           ...formData[parent],
//           [child]: checked,
//         },
//       });
//     } else {
//       setFormData({ ...formData, [name]: value });
//     }
//   };

//   const handleNestedChange = (parent, field, value) => {
//     setFormData({
//       ...formData,
//       [parent]: {
//         ...formData[parent],
//         [field]: value,
//       },
//     });
//   };

//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setImagePreview(reader.result);
//         // In a real app, you would upload to your server here
//         // For now, we'll just use the preview as the image URL
//         setFormData({ ...formData, image: reader.result });
//       };
//       reader.readAsDataURL(file);
//     }
//   };


//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (isSubmitting) return;
//     setIsSubmitting(true);

//     try {
//       // Prepare final data (convert empty strings to null, etc.)
//       const finalData = {
//         ...formData,
//         nutrition: {
//           calories: formData.nutrition.calories || null,
//           allergens: formData.nutrition.allergens || [],
//         },
//         ingredients: formData.ingredients || [],
//         tags: formData.tags || [],
//         variations: formData.variations || [],
//         gallery: formData.gallery || [],
//       };

//       let result;
//       if (menuItem) {
//         result = await updateMenuItem(menuItem._id, finalData);
//       } else {
//         result = await addMenuItem(finalData);
//       }

//       if (result.success) {
//         onSubmit(result.menuItem);
//         onClose();
//       } else {
//         alert(`Failed to ${menuItem ? 'update' : 'add'} menu item: ${result.message || 'Unknown error'}`);
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       alert(`An error occurred while ${menuItem ? 'updating' : 'adding'} the menu item.`);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-xl border border-gray-100">
//       <div className="mb-8 text-center">
//         <h2 className="text-3xl font-bold text-gray-800 mb-2">
//           {menuItem ? 'Edit Menu Item' : 'Add New Menu Item'}
//         </h2>
//         <p className="text-gray-600">
//           {menuItem ? 'Update your menu item details' : 'Fill in the details to add a new item to your menu'}
//         </p>
//       </div>

//       <form onSubmit={handleSubmit} className="space-y-6">
//         <input type="hidden" name="restaurantId" value={restaurantId} />

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {/* Name */}
//           <div className="col-span-2">
//             <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
//               Item Name <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="text"
//               id="name"
//               name="name"
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
//               value={formData.name}
//               onChange={handleChange}
//               required
//               placeholder="e.g., Margherita Pizza"
//             />
//           </div>

//           {/* Description */}
//           <div className="col-span-2">
//             <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
//               Description
//             </label>
//             <textarea
//               id="description"
//               name="description"
//               rows="3"
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
//               value={formData.description}
//               onChange={handleChange}
//               placeholder="Describe the item (ingredients, special notes, etc.)"
//             ></textarea>
//           </div>

//           {/* Category */}
//           <div>
//             <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
//               Category <span className="text-red-500">*</span>
//             </label>
//             <select
//               id="category"
//               name="category"
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
//               value={formData.category}
//               onChange={handleChange}
//               required
//             >
//               <option value="" disabled>Select a category</option>
//               {categories.map((category, index) => (
//                 <option key={index} value={category}>
//                   {category}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Price */}
//           <div>
//             <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
//               Price ($) <span className="text-red-500">*</span>
//             </label>
//             <div className="relative">
//               <span className="absolute left-3 top-2 text-gray-500">$</span>
//               <input
//                 type="number"
//                 id="price"
//                 name="price"
//                 className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
//                 value={formData.price}
//                 onChange={handleChange}
//                 step="0.01"
//                 min="0"
//                 required
//                 placeholder="0.00"
//               />
//             </div>
//           </div>

//           {/* Image Upload */}
//           <div className="col-span-2">
//             <label className="block text-sm font-medium text-gray-700 mb-2">Item Image</label>
//             <div className="mt-1 flex items-center">
//               <div className="inline-block h-24 w-24 rounded-md overflow-hidden bg-gray-100 mr-4">
//                 {formData.image ? (
//                   <img src={formData.image} alt="Preview" className="h-full w-full object-cover" />
//                 ) : (
//                   <div className="h-full w-full flex items-center justify-center text-gray-400">
//                     <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                     </svg>
//                   </div>
//                 )}
//               </div>
//               <div className="flex text-sm">
//                 <label className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500">
//                   <span>Upload image</span>
//                   <input 
//                     type="file" 
//                     className="sr-only" 
//                     onChange={handleImageUpload}
//                     accept="image/*"
//                   />
//                 </label>
//                 <p className="pl-1 text-gray-500">or drag and drop</p>
//               </div>
//             </div>
//           </div>


//           {/* Nutrition Information */}
//           <div className="col-span-2 border-t pt-4">
//             <h3 className="text-lg font-medium text-gray-900 mb-3">Nutrition Information</h3>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Calories</label>
//                 <input
//                   type="number"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md"
//                   value={formData.nutrition?.calories || ''}
//                   onChange={(e) => handleNestedChange('nutrition', 'calories', parseInt(e.target.value) || null)}
//                   min="0"
//                   placeholder="e.g., 250"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Dietary Options */}
//           <div className="col-span-2">
//             <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Options</label>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               <label className="flex items-center space-x-2 cursor-pointer">
//                 <input
//                   type="checkbox"
//                   name="dietary.isVegetarian"
//                   className="h-5 w-5 text-orange-600 rounded focus:ring-orange-500 border-gray-300"
//                   checked={formData.dietary.isVegetarian}
//                   onChange={handleChange}
//                 />
//                 <span className="text-gray-700">Vegetarian</span>
//               </label>
//               <label className="flex items-center space-x-2 cursor-pointer">
//                 <input
//                   type="checkbox"
//                   name="dietary.isVegan"
//                   className="h-5 w-5 text-orange-600 rounded focus:ring-orange-500 border-gray-300"
//                   checked={formData.dietary.isVegan}
//                   onChange={handleChange}
//                 />
//                 <span className="text-gray-700">Vegan</span>
//               </label>
//               <label className="flex items-center space-x-2 cursor-pointer">
//                 <input
//                   type="checkbox"
//                   name="dietary.isGlutenFree"
//                   className="h-5 w-5 text-orange-600 rounded focus:ring-orange-500 border-gray-300"
//                   checked={formData.dietary.isGlutenFree}
//                   onChange={handleChange}
//                 />
//                 <span className="text-gray-700">Gluten-Free</span>
//               </label>
//               <label className="flex items-center space-x-2 cursor-pointer">
//                 <input
//                   type="checkbox"
//                   name="dietary.isNonVegetarian"
//                   className="h-5 w-5 text-orange-600 rounded focus:ring-orange-500 border-gray-300"
//                   checked={formData.dietary.isNonVegetarian}
//                   onChange={handleChange}
//                 />
//                 <span className="text-gray-700">Non-Vegetarian</span>
//               </label>
//             </div>
//           </div>

//           {/* Preparation Time */}
//           <div className="col-span-2">
//             <label htmlFor="preparationTime" className="block text-sm font-medium text-gray-700 mb-1">
//               Preparation Time: <span className="font-semibold text-orange-600">{formData.preparationTime} minutes</span>
//             </label>
//             <input
//               type="range"
//               id="preparationTime"
//               name="preparationTime"
//               min="5"
//               max="60"
//               step="5"
//               value={formData.preparationTime}
//               onChange={(e) => setFormData({...formData, preparationTime: parseInt(e.target.value, 10)})}
//               className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
//             />
//             <div className="flex justify-between text-xs text-gray-500 mt-1">
//               <span>5 min</span>
//               <span>60 min</span>
//             </div>
//           </div>
//         </div>

//         {/* Form Actions */}
//         <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
//           <button
//             type="button"
//             onClick={onClose}
//             className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             className="px-6 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-70"
//             disabled={isSubmitting}
//           >
//             {isSubmitting ? (
//               <>
//                 <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                 </svg>
//                 {menuItem ? 'Updating...' : 'Adding...'}
//               </>
//             ) : menuItem ? 'Update Item' : 'Add Item'}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default MenuItemForm;

// MenuItemForm.jsx
import React, { useState } from 'react';
import { addMenuItem, updateMenuItem } from '../../services/menuItemService';
import { toast } from 'react-toastify'; // Ensure toast is imported for notifications
import axios from 'axios'; // Import axios for direct API calls

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
      nutrition: {
        calories: null,
        allergens: [],
      },
      dietary: {
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        isNonVegetarian: false,
      },
      featured: false,
      preparationTime: 15,
      isAvailable: true,
      restaurantId,
    }
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(formData.image || ''); // For previewing the image
  const [isUploading, setIsUploading] = useState(false); // Track upload progress

  const categories = [
    'Appetizers/Starters',
    'Main Courses/Entrées',
    'Side Dishes',
    'Salads',
    'Sandwiches & Burgers',
    'Pizza',
    'Seafood',
    'Vegetarian/Vegan Options',
    'Desserts',
    'Beverages',
    'Kids\' Menu',
    'Daily Specials',
    'Breakfast Items',
    'Brunch',
    'Bar Menu',
    'other',
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: checked,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData({
      ...formData,
      [parent]: {
        ...formData[parent],
        [field]: value,
      },
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, and WebP images are allowed.');
      return;
    }

    // Validate file size (e.g., max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error('Image size must be less than 5MB.');
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload the image to the backend
    setIsUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      const response = await axios.post('http://localhost:5003/api/menu/upload-image', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
          // 'Authorization': 'Bearer your-mock-jwt-token-here', // Replace with your actual token
        },
      });

      const imageUrl = response.data.imageUrl;
      setFormData({ ...formData, image: imageUrl });
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image: ' + 
        (error.response?.data?.message || error.message));
      setImagePreview(''); // Reset preview on failure
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image: '' });
    setImagePreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const finalData = {
        ...formData,
        price: parseFloat(formData.price), // Ensure price is a number
        image: formData.image,
      };

      let result;
      if (menuItem) {
        result = await updateMenuItem(menuItem._id, finalData);
      } else {
        result = await addMenuItem(finalData);
      }

      if (result.success) {
        onSubmit(result.menuItem);
        onClose();
      } else {
        toast.error(`Failed to ${menuItem ? 'update' : 'add'} menu item: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(`An error occurred while ${menuItem ? 'updating' : 'adding'} the menu item: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-xl border border-gray-100">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          {menuItem ? 'Edit Menu Item' : 'Add New Menu Item'}
        </h2>
        <p className="text-gray-600">
          {menuItem ? 'Update your menu item details' : 'Fill in the details to add a new item to your menu'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <input type="hidden" name="restaurantId" value={restaurantId} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div className="col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Item Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Margherita Pizza"
            />
          </div>

          {/* Description */}
          <div className="col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the item (ingredients, special notes, etc.)"
            ></textarea>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Select a category</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Price ($) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                id="price"
                name="price"
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Item Image</label>
            <div className="mt-1 flex items-center space-x-4">
              <div className="inline-block h-24 w-24 rounded-md overflow-hidden bg-gray-100">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-400">
                    <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500">
                  <span>{isUploading ? 'Uploading...' : 'Upload image'}</span>
                  <input
                    type="file"
                    className="sr-only"
                    onChange={handleImageUpload}
                    accept="image/jpeg,image/png,image/webp"
                    disabled={isUploading}
                  />
                </label>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                )}
                <p className="text-gray-500 text-sm">or drag and drop (max 5MB, JPEG/PNG/WebP)</p>
              </div>
            </div>
          </div>

          {/* Nutrition Information */}
          <div className="col-span-2 border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Nutrition Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Calories</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.nutrition?.calories || ''}
                  onChange={(e) => handleNestedChange('nutrition', 'calories', parseInt(e.target.value) || null)}
                  min="0"
                  placeholder="e.g., 250"
                />
              </div>
            </div>
          </div>

          {/* Dietary Options */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Options</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="dietary.isVegetarian"
                  className="h-5 w-5 text-orange-600 rounded focus:ring-orange-500 border-gray-300"
                  checked={formData.dietary.isVegetarian}
                  onChange={handleChange}
                />
                <span className="text-gray-700">Vegetarian</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="dietary.isVegan"
                  className="h-5 w-5 text-orange-600 rounded focus:ring-orange-500 border-gray-300"
                  checked={formData.dietary.isVegan}
                  onChange={handleChange}
                />
                <span className="text-gray-700">Vegan</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="dietary.isGlutenFree"
                  className="h-5 w-5 text-orange-600 rounded focus:ring-orange-500 border-gray-300"
                  checked={formData.dietary.isGlutenFree}
                  onChange={handleChange}
                />
                <span className="text-gray-700">Gluten-Free</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="dietary.isNonVegetarian"
                  className="h-5 w-5 text-orange-600 rounded focus:ring-orange-500 border-gray-300"
                  checked={formData.dietary.isNonVegetarian}
                  onChange={handleChange}
                />
                <span className="text-gray-700">Non-Vegetarian</span>
              </label>
            </div>
          </div>

          {/* Preparation Time */}
          <div className="col-span-2">
            <label htmlFor="preparationTime" className="block text-sm font-medium text-gray-700 mb-1">
              Preparation Time: <span className="font-semibold text-orange-600">{formData.preparationTime} minutes</span>
            </label>
            <input
              type="range"
              id="preparationTime"
              name="preparationTime"
              min="5"
              max="60"
              step="5"
              value={formData.preparationTime}
              onChange={(e) => setFormData({ ...formData, preparationTime: parseInt(e.target.value, 10) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5 min</span>
              <span>60 min</span>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-70"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {menuItem ? 'Updating...' : 'Adding...'}
              </>
            ) : menuItem ? 'Update Item' : 'Add Item'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MenuItemForm;