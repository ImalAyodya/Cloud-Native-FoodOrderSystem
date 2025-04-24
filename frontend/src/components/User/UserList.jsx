import React, { useState, useEffect } from 'react';
import Table from '../Common/Table';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch('/api/users'); // Replace with your API endpoint
      const data = await response.json();
      setUsers(data);
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const handleSort = (column) => {
    const sortedUsers = [...users].sort((a, b) => {
      if (sortOrder === 'asc') {
        return a[column] > b[column] ? 1 : -1;
      } else {
        return a[column] < b[column] ? 1 : -1;
      }
    });
    setUsers(sortedUsers);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="user-list">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <Table 
            data={currentUsers} 
            onSort={handleSort} 
            currentPage={currentPage} 
            usersPerPage={usersPerPage} 
            totalUsers={users.length} 
            paginate={paginate} 
          />
        </>
      )}
    </div>
  );
};

export default UserList;