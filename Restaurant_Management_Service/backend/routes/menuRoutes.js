const express = require('express');
const MenuItemRouter =express.Router();
const auth = require('../middleware/auth');
const menuItemController = require('../controllers/menuItemController');

// Menu Management
MenuItemRouter.post(
    '/add', 
    auth, 
    menuItemController.addMenuItem
);

MenuItemRouter.put(
    '/update/:id', 
    auth, 
    menuItemController.updateMenuItem
);

MenuItemRouter.delete(
    '/delete/:id', 
    auth, 
    menuItemController.deleteMenuItem
);

MenuItemRouter.get(
    '/get', 
    auth, 
    menuItemController.getMenuItems
);

module.exports = MenuItemRouter;