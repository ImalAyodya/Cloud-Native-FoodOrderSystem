// const express = require('express');
// const MenuItemRouter = express.Router();
// const menuItemController = require('../controllers/menuItemController');
// const upload = require('../middleware/multerConfig');
// const { protect } = require('../middleware/authMiddleware');

// // Basic CRUD Operations
// //http://localhost:5003/api/menu/add
// MenuItemRouter.post('/add',protect, menuItemController.addMenuItem);

// //http://localhost:5003/api/menu/get
// MenuItemRouter.get('/get', menuItemController.getMenuItems);

// //http://localhost:5003/api/menu/get/:id
// MenuItemRouter.get('/get/:id', menuItemController.getMenuItemById);

// //http://localhost:5003/api/menu/update/:id
// MenuItemRouter.put('/update/:id', menuItemController.updateMenuItem);

// //http://localhost:5003/api/menu/delete/:id
// MenuItemRouter.delete('/delete/:id', menuItemController.deleteMenuItem);

// // Specialized Operations
// //http://localhost:5003/api/menu/setAvailability
// MenuItemRouter.put('/setAvailability', menuItemController.setAvailability);

// //http://localhost:5003/api/menu/setFeatured
// MenuItemRouter.put('/setFeatured', menuItemController.setFeatured);

// //http://localhost:5003/api/menu/featured
// MenuItemRouter.get('/featured', menuItemController.getFeaturedItems);

// //http://localhost:5003/api/menu/batch
// MenuItemRouter.put('/batch', menuItemController.batchUpdate);

// //http://localhost:5003/api/menu/:restaurantId
// MenuItemRouter.get('/:restaurantId/menu', menuItemController.getMenuItemsByRestaurant);

// // Bulk Import Endpoint //http://localhost:5003/api/menu/import
// MenuItemRouter.post('/import', upload.single('file'), menuItemController.importMenuItems);

// module.exports = MenuItemRouter;

const express = require('express');
const MenuItemRouter = express.Router();
const menuItemController = require('../controllers/menuItemController');
const { uploadForImport, uploadForImages } = require('../middleware/multerConfig'); // Destructure the two instances
const { protect } = require('../middleware/authMiddleware');

// Basic CRUD Operations
// http://localhost:5003/api/menu/add
MenuItemRouter.post('/add', protect, menuItemController.addMenuItem);

// http://localhost:5003/api/menu/get
MenuItemRouter.get('/get', menuItemController.getMenuItems);

// http://localhost:5003/api/menu/get/:id
MenuItemRouter.get('/get/:id', menuItemController.getMenuItemById);

// http://localhost:5003/api/menu/update/:id
MenuItemRouter.put('/update/:id', menuItemController.updateMenuItem);

// http://localhost:5003/api/menu/delete/:id
MenuItemRouter.delete('/delete/:id', menuItemController.deleteMenuItem);

// Specialized Operations
// http://localhost:5003/api/menu/setAvailability
MenuItemRouter.put('/setAvailability', menuItemController.setAvailability);

// http://localhost:5003/api/menu/setFeatured
MenuItemRouter.put('/setFeatured', menuItemController.setFeatured);

// http://localhost:5003/api/menu/featured
MenuItemRouter.get('/featured', menuItemController.getFeaturedItems);

// http://localhost:5003/api/menu/batch
MenuItemRouter.put('/batch', menuItemController.batchUpdate);

// http://localhost:5003/api/menu/:restaurantId/menu
MenuItemRouter.get('/:restaurantId/menu', menuItemController.getMenuItemsByRestaurant);

// Bulk Import Endpoint
// http://localhost:5003/api/menu/import
MenuItemRouter.post('/import', protect, uploadForImport.single('file'), menuItemController.importMenuItems);

// Image Upload Endpoint
// http://localhost:5003/api/menu/upload-image
MenuItemRouter.post('/upload-image', uploadForImages.single('image'), menuItemController.uploadImage);

module.exports = MenuItemRouter;