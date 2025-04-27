import React from 'react';

const UserDetails = ({ user }) => {
  if (!user) {
    return <div>No user selected</div>;
  }

  return (
    <div className="p-4 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">User Details</h2>
      <div className="mb-2">
        <strong>Name:</strong> {user.name}
      </div>
      <div className="mb-2">
        <strong>Email:</strong> {user.email}
      </div>
      <div className="mb-2">
        <strong>Role:</strong> {user.role}
      </div>
      <div className="mb-2">
        <strong>Joined:</strong> {new Date(user.joined).toLocaleDateString()}
      </div>
      <h3 className="text-lg font-semibold mt-4">Activity History</h3>
      <ul className="list-disc list-inside">
        {user.activityHistory.map((activity, index) => (
          <li key={index}>{activity}</li>
        ))}
      </ul>
    </div>
  );
};

export default UserDetails;