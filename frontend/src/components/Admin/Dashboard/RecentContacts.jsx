import React from 'react';
import { Link } from 'react-router-dom';

const RecentContacts = ({ contacts }) => {
  if (!contacts || contacts.length === 0) {
    return (
      <div className="flex justify-center items-center h-60 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-500">No recent contacts</p>
      </div>
    );
  }

  // Status badge styling
  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'responded':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="overflow-hidden">
      <ul className="divide-y divide-gray-200">
        {contacts.map((contact) => (
          <li key={contact._id} className="py-4">
            <Link to={`/admin/contacts/${contact._id}`} className="block hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium text-gray-800">{contact.name}</p>
                  <p className="text-sm text-gray-500">{contact.email}</p>
                  <p className="text-sm font-medium text-gray-700 mt-1 line-clamp-1">{contact.subject}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(contact.status)}`}>
                    {contact.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(contact.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentContacts;