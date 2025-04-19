const MenuItem = require('../models/MenuItem');

// Add a new menu item
exports.addMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, portionSize, image } = req.body;
    // Validate input
    if (!name || !price || !category) {
      return res.status(400).json({ 
        error: 'Name, price, and category are required' 
    });
    }
    if (!price.regular || !price.large) {
      return res.status(400).json({ 
        error: 'Both regular and large prices are required' 
    });
    }

    // Create menu item
    const menuItem = new MenuItem({
      name,
      description,
      price,
      category,
      portionSize: portionSize || 'regular',
      image,
      restaurantId: req.user.restaurantId,
    });

    await menuItem.save();
    res.status(201).json({ message: 'Menu item added', menuItem });
  } catch (error) {
    console.error('Add menu item error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update a menu item
exports.updateMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, portionSize, image, isAvailable } = req.body;
    const menuItem = await MenuItem.findOneAndUpdate
    ({ 
        _id: req.params.id, 
        restaurantId: req.user.restaurantId 
    },
    { 
        name, 
        description, 
        price, 
        category, 
        portionSize, 
        image, 
        isAvailable 
    },
    { 
        new: true, 
        runValidators: true 
    });
    
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json({ message: 'Menu item updated', menuItem });
  } catch (error) {
    console.error('Update menu item error:', error.message);
    res.status(400).json({ error: 'Invalid input or server error' });
  }
};

// Delete a menu item
exports.deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findOneAndDelete({
      _id: req.params.id,
      restaurantId: req.user.restaurantId,
    });

    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json({ message: 'Menu item deleted' });
  } catch (error) {
    console.error('Delete menu item error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all menu items for a restaurant
exports.getMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find({
        restaurantId: req.user.restaurantId 
    });
    res.json(menuItems);
  } catch (error) {
    console.error('Get menu items error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};