import React from 'react';

const DashboardHeader = () => {
  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">User Management Dashboard</h1>
      <div className="flex items-center">
        <span className="mr-4">Total Users: 100</span>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Add User
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;