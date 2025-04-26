import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaFilter, FaSearch, FaSpinner, FaExclamationTriangle, FaSyncAlt } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';
import AdminLayout from '../../../components/Admin/Order/AdminLayout';
import ContactTable from '../../../components/Admin/Contact/ContactTable';
import { useAuth } from '../../../context/AuthContext';

const API_URL = 'http://localhost:5000/api/contact';

const ContactManagement = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'responded', 'resolved'
  const { user } = useAuth();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching contacts from API...');
      
      // Get JWT token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('API Response:', response);
      
      if (response.data.success) {
        const contactData = response.data.data || [];
        setContacts(contactData);
        if (contactData.length > 0) {
          toast.success(`Loaded ${contactData.length} contact messages`);
        }
      } else {
        setError(response.data.message || 'Failed to fetch contacts');
        toast.error('Failed to load contact messages');
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setError(error.message || 'Failed to fetch contacts');
      toast.error(error.message || 'Failed to load contact messages');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.put(`${API_URL}/${id}/status`, 
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        // Update the local state
        setContacts(prevContacts => 
          prevContacts.map(contact => 
            contact._id === id 
              ? { ...contact, status: newStatus } 
              : contact
          )
        );
        
        toast.success(`Status updated to ${newStatus}`);
      } else {
        toast.error(response.data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleDeleteContact = async (id) => {
    if (!id) {
      toast.error('Invalid contact ID');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        
        const response = await axios.delete(`${API_URL}/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          // Remove from local state
          setContacts(prevContacts => prevContacts.filter(contact => contact._id !== id));
          toast.success('Message deleted successfully');
        } else {
          toast.error(response.data.message || 'Failed to delete message');
        }
      } catch (error) {
        console.error('Error deleting contact:', error);
        toast.error(error.message || 'Failed to delete message');
      }
    }
  };

  // Filter and search contacts
  const filteredContacts = contacts.filter(contact => {
    const matchesFilter = filter === 'all' || contact.status === filter;
    const matchesSearch = 
      (contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (contact.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (contact.message?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex h-screen bg-gray-50 ml-20">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-30">
        <AdminLayout />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 ml-0 lg:ml-64 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-gray-800"
              >
                <FaEnvelope className="inline mr-2 text-orange-500" />
                Contact Message Management
              </motion.h1>
              <p className="text-gray-600 mt-1">
                View and manage customer inquiries and feedback
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <button 
                onClick={fetchContacts}
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors flex items-center"
              >
                <FaSyncAlt className="mr-2" />
                Refresh
              </button>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col md:flex-row justify-between gap-4">
            <div className="flex items-center gap-3">
              <FaFilter className="text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">All Messages</option>
                <option value="pending">Pending</option>
                <option value="responded">Responded</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            
            <div className="relative flex-grow md:max-w-md">
              <FaSearch className="absolute top-3 left-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="bg-white p-12 rounded-lg shadow-sm text-center">
              <FaSpinner className="animate-spin text-4xl text-orange-500 mx-auto mb-4" />
              <p className="text-gray-600">Loading contact messages...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-6 rounded-lg shadow-sm text-center">
              <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Error Loading Messages</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={fetchContacts}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4 flex justify-between items-center">
                <p className="text-gray-600 text-sm">
                  Showing {filteredContacts.length} of {contacts.length} messages
                  {filter !== 'all' && ` (filtered by ${filter})`}
                  {searchTerm && ` matching "${searchTerm}"`}
                </p>
                
                {(filter !== 'all' || searchTerm) && (
                  <button
                    onClick={() => {
                      setFilter('all');
                      setSearchTerm('');
                    }}
                    className="text-sm text-orange-500 hover:text-orange-600"
                  >
                    Clear filters
                  </button>
                )}
              </div>
              
              <ContactTable 
                contacts={filteredContacts} 
                onStatusChange={handleStatusChange} 
                onDelete={handleDeleteContact}
              />
            </>
          )}

          {!loading && !error && contacts.length === 0 && (
            <div className="bg-white p-12 rounded-lg shadow-sm text-center">
              <FaEnvelope className="text-5xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Contact Messages Yet</h3>
              <p className="text-gray-600">
                When customers submit contact forms, they will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
};

export default ContactManagement;