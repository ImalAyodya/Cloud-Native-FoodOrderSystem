const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

// Create new menu item
const addMenuItem = async (req, res) => {
  try {
    // Validate if restaurant exists
    const restaurant = await Restaurant.findById(req.body.restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    // Create new menu item
    const newMenuItem = new MenuItem({
      ...req.body
      // createdBy should be provided in the request body since we're not using auth
    });
    
    const menuItem = await newMenuItem.save();
    res.status(201).json({ success: true, menuItem });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all menu items (with optional filters)
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
      search
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
      menuItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
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
        message: "Menu item not found"
      });
    }
    
    res.status(200).json({
      success: true,
      menuItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
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
        message: "Menu item not found"
      });
    }
    
    // If restaurantId is being updated, validate the restaurant
    if (req.body.restaurantId && req.body.restaurantId !== menuItem.restaurantId.toString()) {
      const restaurant = await Restaurant.findById(req.body.restaurantId);
      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: "New restaurant not found"
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
      menuItem: updatedMenuItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
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
        message: "Menu item not found"
      });
    }
    
    await MenuItem.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: "Menu item deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
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
        message: "isAvailable field is required"
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
        message: "Menu item not found"
      });
    }
    
    res.status(200).json({
      success: true,
      isAvailable: menuItem.isAvailable
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
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
        message: "featured field is required"
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
        message: "Menu item not found"
      });
    }
    
    res.status(200).json({
      success: true,
      featured: menuItem.featured
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
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
      menuItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
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
        message: "Items array is required"
      });
    }
    
    const updateResults = [];
    const errors = [];
    
    for (const item of items) {
      if (!item.id) {
        errors.push({ item, error: "Menu item ID is required" });
        continue;
      }
      
      try {
        const updatedItem = await MenuItem.findByIdAndUpdate(
          item.id,
          { $set: { ...item.data, updatedAt: Date.now() } },
          { new: true }
        );
        
        if (!updatedItem) {
          errors.push({ id: item.id, error: "Menu item not found" });
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
      errors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
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
  batchUpdate
};