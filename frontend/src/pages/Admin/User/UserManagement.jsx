import React from 'react';
import UserList from '../../../components/User/UserList';
import UserForm from '../../../components/User/UserForm';
import DashboardHeader from '../../../components/User/DashboardHeader';
import DashboardSidebar from '../../../components/User/DashboardSidebar';

const UserManagement = () => {
  return (
    <div className="flex">
      <DashboardSidebar />
      <div className="flex-1 p-4">
        <DashboardHeader title="User Management" />
        
        <UserForm />
        <UserList />
      </div>
    </div>
  );
};

export default UserManagement;