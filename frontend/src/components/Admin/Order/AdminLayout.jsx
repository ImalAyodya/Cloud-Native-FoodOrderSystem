import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../AminSideBar';
import { Toaster } from 'react-hot-toast';

const AdminLayout = () => {
  // Mock user data - replace with actual user data from authentication
  const user = {
    name: 'Admin User',
    email: 'admin@digidine.com'
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar user={user} />
      <div className="flex-1 ml-0 lg:ml-[250px] transition-all duration-200 overflow-auto">
        <Outlet />
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
};

export default AdminLayout;