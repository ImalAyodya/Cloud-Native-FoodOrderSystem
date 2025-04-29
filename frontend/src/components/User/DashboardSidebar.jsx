import React from 'react';
import { NavLink } from 'react-router-dom';

const DashboardSidebar = () => {
  return (
    <div className="w-64 h-full bg-gray-800 text-white">
      <div className="p-4 text-lg font-bold">User Management</div>
      <nav className="mt-4">
        <ul>
          <li>
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => 
                `block py-2 px-4 rounded hover:bg-gray-700 ${isActive ? 'bg-gray-600' : ''}`
              }
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/users" 
              className={({ isActive }) => 
                `block py-2 px-4 rounded hover:bg-gray-700 ${isActive ? 'bg-gray-600' : ''}`
              }
            >
              Users
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/settings" 
              className={({ isActive }) => 
                `block py-2 px-4 rounded hover:bg-gray-700 ${isActive ? 'bg-gray-600' : ''}`
              }
            >
              Settings
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default DashboardSidebar;