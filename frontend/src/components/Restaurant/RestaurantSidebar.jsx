import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { 
  FaHome, 
  FaUtensils, 
  FaClipboardList, 
  FaChartLine, 
  FaCog, 
  FaSignOutAlt,
  FaChartBar
} from 'react-icons/fa';
import { MdRestaurantMenu, MdSettings } from 'react-icons/md';

const RestaurantSidebar = ({ onLogout }) => {
  const { id } = useParams();
  
  // Style for active navigation items
  const activeStyle = "flex items-center p-3 bg-orange-50 text-orange-600 rounded-lg font-medium";
  const inactiveStyle = "flex items-center p-3 hover:bg-gray-50 text-gray-600 hover:text-gray-900 rounded-lg transition-colors";
  
  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-full hidden md:block">
      <div className="p-4">
        <div className="flex items-center mb-8">
          <div className="w-10 h-10 rounded-md bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center text-white mr-3">
            <FaUtensils />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Restaurant</h1>
        </div>

        <nav className="space-y-1">
          <NavLink 
            to={`/restaurant/dashboard/${id}`}
            className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
            end
          >
            <FaHome className="mr-3" /> Dashboard
          </NavLink>
          
          <NavLink 
            to={`/restaurant/profile/${id}`}
            className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
          >
            <MdSettings className="mr-3" /> Restaurant Profile
          </NavLink>
          
          <NavLink 
            to={`/restaurant/${id}/menu`}
            className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
          >
            <MdRestaurantMenu className="mr-3" /> Menu Management
          </NavLink>
          
          <NavLink 
            to={`/restaurant/${id}/orders`}
            className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
          >
            <FaClipboardList className="mr-3" /> Orders
          </NavLink>
          
          <NavLink 
            to={`/restaurant/${id}/analytics`}
            className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
          >
            <FaChartLine className="mr-3" /> Analytics
          </NavLink>
          
        </nav>
      </div>
      
      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
        <button 
          onClick={onLogout}
          className="flex items-center w-full p-3 text-gray-600 hover:bg-gray-50 hover:text-red-500 rounded-lg transition-colors"
        >
          <FaSignOutAlt className="mr-3" /> Logout
        </button>
      </div>
    </aside>
  );
};

export default RestaurantSidebar;