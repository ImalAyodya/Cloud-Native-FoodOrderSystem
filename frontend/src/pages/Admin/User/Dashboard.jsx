import React from 'react';
import DashboardHeader from '../../../components/User/DashboardHeader';
import DashboardSidebar from '../../../components/User/DashboardSidebar';
import AdminSidebar from '../../../components/Admin/AminSideBar';

const Dashboard = () => {
  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-4">
        <DashboardHeader />
        <h1 className="text-2xl font-bold mt-4">User Management Dashboard</h1>
        {/* Additional dashboard content can be added here */}
      </div>
    </div>
  );
};

export default Dashboard;