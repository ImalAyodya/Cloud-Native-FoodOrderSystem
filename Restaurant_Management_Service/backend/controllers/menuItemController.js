// const mongoose = require('mongoose');
// const MenuItem = require('../models/MenuItem');
// const Restaurant = require('../models/Restaurant');
// const fs = require('fs');
// const { parse } = require('csv-parse');
// const path = require('path');
// const asyncHandler = require('express-async-handler');

// //Create new menu item
// const addMenuItem = async (req, res) => {
//   try {
//     console.log('Request body:', req.body); // Log the incoming request body

//     // Validate if restaurant exists
//     const restaurant = await Restaurant.findById(req.body.restaurantId);
//     if (!restaurant) {
//       console.log('Restaurant not found'); // Debug log
//       return res.status(404).json({
//         success: false,
//         message: 'Restaurant not found',
//       });
//     }

//     // Create new menu item
//     const newMenuItem = new MenuItem({
//       ...req.body,
//     });

//     const menuItem = await newMenuItem.save();
//     console.log('Menu item saved:', menuItem); // Debug log
//     res.status(201).json({ success: true, menuItem }); // Send success response
//   } catch (error) {
//     console.error('Error in addMenuItem:', error); // Log the error
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// //Get all menu items
// const getMenuItems = async (req, res) => {
//   try {
//     const {
//       restaurantId,
//       category,
//       isVegetarian,
//       isVegan,
//       isGlutenFree,
//       featured,
//       isAvailable,
//       minPrice,
//       maxPrice,
//       search
//     } = req.query;
    
//     // Build filter object
//     const filter = {};
    
//     if (restaurantId) filter.restaurantId = restaurantId;
//     if (category) filter.category = category;
//     if (isVegetarian === 'true') filter['dietary.isVegetarian'] = true;
//     if (isVegan === 'true') filter['dietary.isVegan'] = true;
//     if (isGlutenFree === 'true') filter['dietary.isGlutenFree'] = true;
//     if (featured === 'true') filter.featured = true;
//     if (isAvailable === 'true') filter.isAvailable = true;
    
//     // Price range
//     if (minPrice || maxPrice) {
//       filter.price = {};
//       if (minPrice) filter.price.$gte = parseFloat(minPrice);
//       if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
//     }
    
//     // Text search
//     if (search) {
//       filter.$text = { $search: search };
//     }
    
//     // Find menu items with pagination
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;
    
//     // Option 1: Using populate to include restaurant details
//     const menuItems = await MenuItem.find(filter)
//       .populate('restaurantId', 'name images.logo priceRange rating location.city') // Include restaurant name and other fields
//       .sort({ featured: -1, createdAt: -1 })
//       .skip(skip)
//       .limit(limit);
    
//     // Count total documents for pagination info
//     const totalItems = await MenuItem.countDocuments(filter);
    
//     res.status(200).json({
//       success: true,
//       count: menuItems.length,
//       totalItems,
//       totalPages: Math.ceil(totalItems / limit),
//       currentPage: page,
//       menuItems
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // Get menu item by ID
// const getMenuItemById = async (req, res) => {
//   try {
//     const menuItem = await MenuItem.findById(req.params.id);
    
//     if (!menuItem) {
//       return res.status(404).json({
//         success: false,
//         message: "Menu item not found"
//       });
//     }
    
//     res.status(200).json({
//       success: true,
//       menuItem
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // Update menu item
// const updateMenuItem = async (req, res) => {
//   try {
//     const menuItem = await MenuItem.findById(req.params.id);
    
//     if (!menuItem) {
//       return res.status(404).json({
//         success: false,
//         message: "Menu item not found"
//       });
//     }
    
//     // If restaurantId is being updated, validate the restaurant
//     if (req.body.restaurantId && req.body.restaurantId !== menuItem.restaurantId.toString()) {
//       const restaurant = await Restaurant.findById(req.body.restaurantId);
//       if (!restaurant) {
//         return res.status(404).json({
//           success: false,
//           message: "New restaurant not found"
//         });
//       }
//     }
    
//     // Update the updatedAt field
//     req.body.updatedAt = Date.now();
    
//     const updatedMenuItem = await MenuItem.findByIdAndUpdate(
//       req.params.id,
//       { $set: req.body },
//       { new: true, runValidators: true }
//     );
    
//     res.status(200).json({
//       success: true,
//       menuItem: updatedMenuItem
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // Delete menu item
// const deleteMenuItem = async (req, res) => {
//   try {
//     const menuItem = await MenuItem.findById(req.params.id);
    
//     if (!menuItem) {
//       return res.status(404).json({
//         success: false,
//         message: "Menu item not found"
//       });
//     }
    
//     await MenuItem.findByIdAndDelete(req.params.id);
    
//     res.status(200).json({
//       success: true,
//       message: "Menu item deleted successfully"
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // Update menu item availability
// const setAvailability = async (req, res) => {
//   try {
//     const { id, isAvailable } = req.body;
    
//     if (isAvailable === undefined) {
//       return res.status(400).json({
//         success: false,
//         message: "isAvailable field is required"
//       });
//     }
    
//     const menuItem = await MenuItem.findByIdAndUpdate(
//       id,
//       { $set: { isAvailable, updatedAt: Date.now() } },
//       { new: true }
//     );
    
//     if (!menuItem) {
//       return res.status(404).json({
//         success: false,
//         message: "Menu item not found"
//       });
//     }
    
//     res.status(200).json({
//       success: true,
//       isAvailable: menuItem.isAvailable
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // Update featured status
// const setFeatured = async (req, res) => {
//   try {
//     const { id, featured } = req.body;
    
//     if (featured === undefined) {
//       return res.status(400).json({
//         success: false,
//         message: "featured field is required"
//       });
//     }
    
//     const menuItem = await MenuItem.findByIdAndUpdate(
//       id,
//       { $set: { featured, updatedAt: Date.now() } },
//       { new: true }
//     );
    
//     if (!menuItem) {
//       return res.status(404).json({
//         success: false,
//         message: "Menu item not found"
//       });
//     }
    
//     res.status(200).json({
//       success: true,
//       featured: menuItem.featured
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // Get featured menu items
// const getFeaturedItems = async (req, res) => {
//   try {
//     const { restaurantId, limit = 10 } = req.query;
//     const filter = { featured: true };
    
//     if (restaurantId) filter.restaurantId = restaurantId;
    
//     const menuItems = await MenuItem.find(filter)
//       .sort({ createdAt: -1 })
//       .limit(parseInt(limit));
    
//     res.status(200).json({
//       success: true,
//       count: menuItems.length,
//       menuItems
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // Batch update for menu items
// const batchUpdate = async (req, res) => {
//   try {
//     const { items } = req.body;
    
//     if (!Array.isArray(items) || items.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Items array is required"
//       });
//     }
    
//     const updateResults = [];
//     const errors = [];
    
//     for (const item of items) {
//       if (!item.id) {
//         errors.push({ item, error: "Menu item ID is required" });
//         continue;
//       }
      
//       try {
//         const updatedItem = await MenuItem.findByIdAndUpdate(
//           item.id,
//           { $set: { ...item.data, updatedAt: Date.now() } },
//           { new: true }
//         );
        
//         if (!updatedItem) {
//           errors.push({ id: item.id, error: "Menu item not found" });
//         } else {
//           updateResults.push(updatedItem);
//         }
//       } catch (error) {
//         errors.push({ id: item.id, error: error.message });
//       }
//     }
    
//     res.status(200).json({
//       success: true,
//       updated: updateResults.length,
//       failed: errors.length,
//       results: updateResults,
//       errors
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// const getMenuItemsByRestaurant = async (req, res) => {
//   try {
//     const { restaurantId } = req.params;

//     // Validate restaurantId format
//     if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid restaurant ID format',
//       });
//     }

//     // Query parameters for filtering
//     const { category, isAvailable, featured, search } = req.query;

//     // Build query object
//     const query = { restaurantId };

//     if (category) query.category = category;
//     if (isAvailable === 'true') query.isAvailable = true;
//     if (isAvailable === 'false') query.isAvailable = false;
//     if (featured === 'true') query.featured = true;

//     // Add text search if provided
//     if (search) {
//       query.$text = { $search: search };
//     }

//     // Fetch menu items
//     const menuItems = await MenuItem.find(query).sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       count: menuItems.length,
//       data: menuItems,
//     });
//   } catch (error) {
//     console.error('Error fetching menu items:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error while fetching menu items',
//       error: error.message,
//     });
//   }
// };

// //Import menu items from CSV or JSON
// const importMenuItems = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: 'No file uploaded'
//       });
//     }

//     const filePath = req.file.path;
//     const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
//     const results = [];
//     const errors = [];
//     let menuItems = [];

//     // Parse file based on extension
//     if (fileExtension === 'csv') {
//       // Parse CSV
//       fs.createReadStream(filePath)
//         .pipe(parse({ columns: true, trim: true }))
//         .on('data', (row) => menuItems.push(row))
//         .on('error', (error) => {
//           errors.push({ error: `CSV parsing error: ${error.message}` });
//         })
//         .on('end', async () => {
//           await processMenuItems(menuItems, req, results, errors);
//           cleanUp(filePath);
//           sendResponse(res, results, errors);
//         });
//     } else if (fileExtension === 'json') {
//       // Parse JSON
//       const rawData = fs.readFileSync(filePath);
//       try {
//         menuItems = JSON.parse(rawData);
//         await processMenuItems(menuItems, req, results, errors);
//         cleanUp(filePath);
//         sendResponse(res, results, errors);
//       } catch (error) {
//         cleanUp(filePath);
//         return res.status(400).json({
//           success: false,
//           message: `JSON parsing error: ${error.message}`
//         });
//       }
//     } else {
//       cleanUp(filePath);
//       return res.status(400).json({
//         success: false,
//         message: 'Unsupported file format'
//       });
//     }
//   } catch (error) {
//     cleanUp(req.file?.path);
//     res.status(500).json({
//       success: false,
//       message: `Server error: ${error.message}`
//     });
//   }
// };

// // Helper function to process menu items
// async function processMenuItems(menuItems, req, results, errors) {
//   for (const [index, item] of menuItems.entries()) {
//     try {
//       // Validate restaurantId
//       const restaurant = await Restaurant.findById(item.restaurantId);
//       if (!restaurant) {
//         errors.push({ index, item, error: 'Restaurant not found' });
//         continue;
//       }

//       // Validate required fields
//       if (!item.name || !item.price || !item.category || !item.createdBy) {
//         errors.push({ index, item, error: 'Missing required fields (name, price, category, createdBy)' });
//         continue;
//       }

//       // Parse nested fields (e.g., variations, nutrition, dietary)
//       const parsedItem = {
//         ...item,
//         price: parseFloat(item.price),
//         variations: item.variations ? JSON.parse(item.variations) : [],
//         nutrition: item.nutrition ? JSON.parse(item.nutrition) : { calories: 0, allergens: [] },
//         dietary: item.dietary ? JSON.parse(item.dietary) : {
//           isVegetarian: false,
//           isVegan: false,
//           isGlutenFree: false
//         },
//         gallery: item.gallery ? JSON.parse(item.gallery) : [],
//         tags: item.tags ? JSON.parse(item.tags) : [],
//         ingredients: item.ingredients ? JSON.parse(item.ingredients) : [],
//         preparationTime: item.preparationTime ? parseInt(item.preparationTime) : 15,
//         featured: item.featured ? item.featured === 'true' || item.featured === true : false,
//         isAvailable: item.isAvailable ? item.isAvailable === 'true' || item.isAvailable === true : true
//       };

//       // Create and validate MenuItem
//       const menuItem = new MenuItem(parsedItem);
//       await menuItem.validate(); // Run Mongoose validation
//       const savedItem = await menuItem.save();
//       results.push(savedItem);
//     } catch (error) {
//       errors.push({ index, item, error: error.message });
//     }
//   }
// }

// // Helper function to clean up uploaded file
// function cleanUp(filePath) {
//   if (filePath && fs.existsSync(filePath)) {
//     fs.unlinkSync(filePath);
//   }
// }

// // Helper function to send response
// function sendResponse(res, results, errors) {
//   res.status(200).json({
//     success: true,
//     imported: results.length,
//     failed: errors.length,
//     results: results.map(item => ({
//       _id: item._id,
//       name: item.name,
//       restaurantId: item.restaurantId
//     })),
//     errors
//   });
// }




// module.exports = {
//   addMenuItem,
//   getMenuItems,
//   getMenuItemById,
//   updateMenuItem,
//   deleteMenuItem,
//   setAvailability,
//   setFeatured,
//   getFeaturedItems,
//   batchUpdate,
//   getMenuItemsByRestaurant,
//   importMenuItems
// };

const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItem'); // Adjust path if necessary
const Restaurant = require('../models/Restaurant'); // Adjust path if necessary
const fs = require('fs');
const { parse } = require('csv-parse');
const path = require('path');
const asyncHandler = require('express-async-handler');

// Create new menu item
const addMenuItem = async (req, res) => {
  try {
    console.log('Request body:', req.body); // Log the incoming request body

    // Validate if restaurant exists
    const restaurant = await Restaurant.findById(req.body.restaurantId);
    if (!restaurant) {
      console.log('Restaurant not found'); // Debug log
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found',
      });
    }

    // Create new menu item
    const newMenuItem = new MenuItem({
      ...req.body,
    });

    const menuItem = await newMenuItem.save();
    console.log('Menu item saved:', menuItem); // Debug log
    res.status(201).json({ success: true, menuItem }); // Send success response
  } catch (error) {
    console.error('Error in addMenuItem:', error); // Log the error
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all menu items
const getMenuItems = async (req, res) => {
  try {
    const {
      restaurantId,
      category,
      isVegetarian,
      isVegan,
      isGlutenFree,
      featured,
      isAvailable,
      minPrice,
      maxPrice,
      search,
    } = req.query;

    // Build filter object
    const filter = {};

    if (restaurantId) filter.restaurantId = restaurantId;
    if (category) filter.category = category;
    if (isVegetarian === 'true') filter['dietary.isVegetarian'] = true;
    if (isVegan === 'true') filter['dietary.isVegan'] = true;
    if (isGlutenFree === 'true') filter['dietary.isGlutenFree'] = true;
    if (featured === 'true') filter.featured = true;
    if (isAvailable === 'true') filter.isAvailable = true;

    // Price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Find menu items with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Option 1: Using populate to include restaurant details
    const menuItems = await MenuItem.find(filter)
      .populate('restaurantId', 'name images.logo priceRange rating location.city') // Include restaurant name and other fields
      .sort({ featured: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Count total documents for pagination info
    const totalItems = await MenuItem.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: menuItems.length,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      menuItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get menu item by ID
const getMenuItemById = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }

    res.status(200).json({
      success: true,
      menuItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update menu item
const updateMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }

    // If restaurantId is being updated, validate the restaurant
    if (req.body.restaurantId && req.body.restaurantId !== menuItem.restaurantId.toString()) {
      const restaurant = await Restaurant.findById(req.body.restaurantId);
      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: 'New restaurant not found',
        });
      }
    }

    // Update the updatedAt field
    req.body.updatedAt = Date.now();

    const updatedMenuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      menuItem: updatedMenuItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete menu item
const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }

    await MenuItem.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update menu item availability
const setAvailability = async (req, res) => {
  try {
    const { id, isAvailable } = req.body;

    if (isAvailable === undefined) {
      return res.status(400).json({
        success: false,
        message: 'isAvailable field is required',
      });
    }

    const menuItem = await MenuItem.findByIdAndUpdate(
      id,
      { $set: { isAvailable, updatedAt: Date.now() } },
      { new: true }
    );

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }

    res.status(200).json({
      success: true,
      isAvailable: menuItem.isAvailable,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update featured status
const setFeatured = async (req, res) => {
  try {
    const { id, featured } = req.body;

    if (featured === undefined) {
      return res.status(400).json({
        success: false,
        message: 'featured field is required',
      });
    }

    const menuItem = await MenuItem.findByIdAndUpdate(
      id,
      { $set: { featured, updatedAt: Date.now() } },
      { new: true }
    );

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }

    res.status(200).json({
      success: true,
      featured: menuItem.featured,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get featured menu items
const getFeaturedItems = async (req, res) => {
  try {
    const { restaurantId, limit = 10 } = req.query;
    const filter = { featured: true };

    if (restaurantId) filter.restaurantId = restaurantId;

    const menuItems = await MenuItem.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: menuItems.length,
      menuItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Batch update for menu items
const batchUpdate = async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items array is required',
      });
    }

    const updateResults = [];
    const errors = [];

    for (const item of items) {
      if (!item.id) {
        errors.push({ item, error: 'Menu item ID is required' });
        continue;
      }

      try {
        const updatedItem = await MenuItem.findByIdAndUpdate(
          item.id,
          { $set: { ...item.data, updatedAt: Date.now() } },
          { new: true }
        );

        if (!updatedItem) {
          errors.push({ id: item.id, error: 'Menu item not found' });
        } else {
          updateResults.push(updatedItem);
        }
      } catch (error) {
        errors.push({ id: item.id, error: error.message });
      }
    }

    res.status(200).json({
      success: true,
      updated: updateResults.length,
      failed: errors.length,
      results: updateResults,
      errors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get menu items by restaurant
const getMenuItemsByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    // Validate restaurantId format
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid restaurant ID format',
      });
    }

    // Query parameters for filtering
    const { category, isAvailable, featured, search } = req.query;

    // Build query object
    const query = { restaurantId };

    if (category) query.category = category;
    if (isAvailable === 'true') query.isAvailable = true;
    if (isAvailable === 'false') query.isAvailable = false;
    if (featured === 'true') query.featured = true;

    // Add text search if provided
    if (search) {
      query.$text = { $search: search };
    }

    // Fetch menu items
    const menuItems = await MenuItem.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: menuItems.length,
      data: menuItems,
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching menu items',
      error: error.message,
    });
  }
};

// Import menu items from CSV or JSON
const importMenuItems = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const filePath = req.file.path;
    const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
    const results = [];
    const errors = [];
    let menuItems = [];

    // Parse file based on extension
    if (fileExtension === 'csv') {
      // Parse CSV
      fs.createReadStream(filePath)
        .pipe(parse({ columns: true, trim: true }))
        .on('data', (row) => menuItems.push(row))
        .on('error', (error) => {
          errors.push({ error: `CSV parsing error: ${error.message}` });
        })
        .on('end', async () => {
          await processMenuItems(menuItems, req, results, errors);
          cleanUp(filePath);
          sendResponse(res, results, errors);
        });
    } else if (fileExtension === 'json') {
      // Parse JSON
      const rawData = fs.readFileSync(filePath);
      try {
        menuItems = JSON.parse(rawData);
        await processMenuItems(menuItems, req, results, errors);
        cleanUp(filePath);
        sendResponse(res, results, errors);
      } catch (error) {
        cleanUp(filePath);
        return res.status(400).json({
          success: false,
          message: `JSON parsing error: ${error.message}`,
        });
      }
    } else {
      cleanUp(filePath);
      return res.status(400).json({
        success: false,
        message: 'Unsupported file format',
      });
    }
  } catch (error) {
    cleanUp(req.file?.path);
    res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};

// Helper function to process menu items
async function processMenuItems(menuItems, req, results, errors) {
  for (const [index, item] of menuItems.entries()) {
    try {
      // Validate restaurantId
      const restaurant = await Restaurant.findById(item.restaurantId);
      if (!restaurant) {
        errors.push({ index, item, error: 'Restaurant not found' });
        continue;
      }

      // Validate required fields
      if (!item.name || !item.price || !item.category || !item.createdBy) {
        errors.push({
          index,
          item,
          error: 'Missing required fields (name, price, category, createdBy)',
        });
        continue;
      }

      // Parse nested fields (e.g., variations, nutrition, dietary)
      const parsedItem = {
        ...item,
        price: parseFloat(item.price),
        variations: item.variations ? JSON.parse(item.variations) : [],
        nutrition: item.nutrition
          ? JSON.parse(item.nutrition)
          : { calories: 0, allergens: [] },
        dietary: item.dietary
          ? JSON.parse(item.dietary)
          : {
              isVegetarian: false,
              isVegan: false,
              isGlutenFree: false,
            },
        gallery: item.gallery ? JSON.parse(item.gallery) : [],
        tags: item.tags ? JSON.parse(item.tags) : [],
        ingredients: item.ingredients ? JSON.parse(item.ingredients) : [],
        preparationTime: item.preparationTime ? parseInt(item.preparationTime) : 15,
        featured: item.featured ? item.featured === 'true' || item.featured === true : false,
        isAvailable: item.isAvailable
          ? item.isAvailable === 'true' || item.isAvailable === true
          : true,
      };

      // Create and validate MenuItem
      const menuItem = new MenuItem(parsedItem);
      await menuItem.validate(); // Run Mongoose validation
      const savedItem = await menuItem.save();
      results.push(savedItem);
    } catch (error) {
      errors.push({ index, item, error: error.message });
    }
  }
}

// Helper function to clean up uploaded file
function cleanUp(filePath) {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

// Helper function to send response
function sendResponse(res, results, errors) {
  res.status(200).json({
    success: true,
    imported: results.length,
    failed: errors.length,
    results: results.map((item) => ({
      _id: item._id,
      name: item.name,
      restaurantId: item.restaurantId,
    })),
    errors,
  });
}

// Upload image for menu item (new controller function)
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided.' });
    }

    // The file has already been saved by multer
    const imageUrl = `/uploads/${req.file.filename}`; // Relative path to the uploaded file
    res.status(200).json({ success: true, imageUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ success: false, message: 'Failed to upload image.' });
  }
};

module.exports = {
  addMenuItem,
  getMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
  setAvailability,
  setFeatured,
  getFeaturedItems,
  batchUpdate,
  getMenuItemsByRestaurant,
  importMenuItems,
  uploadImage, // Added the new controller function
};