import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaEnvelope, FaArrowLeft, FaUser, FaClock, FaTag, 
  FaSpinner, FaCheck, FaExclamationTriangle 
} from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';
import AdminLayout from '../../../components/Admin/Order/AdminLayout';

const API_URL = 'http://localhost:5000/api/contact';

const ContactDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [replyMessage, setReplyMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState(null);

  useEffect(() => {
    fetchContactDetails();
  }, [id]);

  const fetchContactDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get JWT token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      const response = await axios.get(`${API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setContact(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch contact details');
      }
    } catch (error) {
      console.error('Error fetching contact details:', error);
      setError(error.message || 'Error fetching contact details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
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
        setContact({ ...contact, status: newStatus });
        toast.success(`Status updated to ${newStatus}`);
      } else {
        toast.error(response.data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    
    if (!replyMessage.trim()) {
      toast.error('Reply message cannot be empty');
      return;
    }
    
    setIsSending(true);
    setSendStatus(null);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(`${API_URL}/${id}/reply`, 
        { replyMessage },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        setSendStatus({ type: 'success', message: 'Reply sent successfully' });
        setContact({ ...contact, status: 'responded' });
        setReplyMessage('');
        toast.success('Reply sent successfully');
        
        // After 2 seconds, redirect back to the contact list
        setTimeout(() => {
          navigate('/admin/contacts');
        }, 2000);
      } else {
        setSendStatus({ type: 'error', message: response.data.message || 'Failed to send reply' });
        toast.error(response.data.message || 'Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      setSendStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to send reply' 
      });
      toast.error(error.message || 'Failed to send reply');
    } finally {
      setIsSending(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'responded': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Changed layout structure to match ContactManagement.jsx
  return (
    <div className="flex h-screen bg-gray-50 ml-20">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-30">
        <AdminLayout />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 ml-0 lg:ml-64 overflow-auto">
        <div className="p-6">
          {/* Back button and header */}
          <div className="flex items-center mb-6">
            <button 
              onClick={() => navigate('/admin/contacts')}
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              <FaArrowLeft className="text-xl" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              Contact Message Details
            </h1>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <FaSpinner className="animate-spin text-4xl text-orange-500 mx-auto mb-4" />
                <p className="text-gray-600">Loading contact details...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="bg-red-50 p-6 rounded-lg shadow-sm text-center">
              <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Error Loading Contact Details</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={fetchContactDetails}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Not Found State */}
          {!loading && !error && !contact && (
            <div className="bg-yellow-50 p-6 rounded-lg shadow-sm text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Contact Not Found</h3>
              <p className="text-gray-600 mb-4">The contact message you're looking for couldn't be found.</p>
              <button 
                onClick={() => navigate('/admin/contacts')}
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
              >
                Back to Messages
              </button>
            </div>
          )}

          {/* Contact Details */}
          {!loading && !error && contact && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Message Details */}
              <div className="lg:col-span-2">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm p-6"
                >
                  <div className="flex justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800 truncate flex-grow">
                      {contact.subject || 'No Subject'}
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(contact.status)}`}>
                      {contact.status ? contact.status.charAt(0).toUpperCase() + contact.status.slice(1) : 'Unknown'}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-2">
                    <FaUser className="mr-2" />
                    <span className="mr-1 font-medium">From:</span>
                    <span>{contact.name || 'Unknown'} ({contact.email || 'No email'})</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-2">
                    <FaClock className="mr-2" />
                    <span className="mr-1 font-medium">Received:</span>
                    <span>{formatDate(contact.createdAt)}</span>
                  </div>
                  
                  <div className="flex items-start text-gray-600 mb-6">
                    <FaTag className="mr-2 mt-1" />
                    <span className="mr-1 font-medium">Subject:</span>
                    <span>{contact.subject || 'No subject'}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <h3 className="font-medium text-gray-700 mb-3">Message:</h3>
                    <div className="bg-gray-50 p-4 rounded-md whitespace-pre-line">
                      {contact.message || 'No message content'}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Actions Sidebar */}
              <div className="lg:col-span-1">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-lg shadow-sm p-6 mb-6"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Message Status
                  </h3>
                  
                  <div className="space-y-3">
                    <button 
                      onClick={() => handleStatusChange('pending')}
                      className={`w-full py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center ${
                        contact.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Mark as Pending
                      {contact.status === 'pending' && <FaCheck className="ml-2" />}
                    </button>
                    
                    <button 
                      onClick={() => handleStatusChange('responded')}
                      className={`w-full py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center ${
                        contact.status === 'responded' 
                          ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Mark as Responded
                      {contact.status === 'responded' && <FaCheck className="ml-2" />}
                    </button>
                    
                    <button 
                      onClick={() => handleStatusChange('resolved')}
                      className={`w-full py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center ${
                        contact.status === 'resolved' 
                          ? 'bg-green-100 text-green-800 border border-green-300' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Mark as Resolved
                      {contact.status === 'resolved' && <FaCheck className="ml-2" />}
                    </button>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-lg shadow-sm p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FaEnvelope className="mr-2 text-orange-500" />
                    Send Reply
                  </h3>
                  
                  <form onSubmit={handleSendReply}>
                    <div className="mb-4">
                      <textarea
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Type your reply here..."
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        rows="8"
                        required
                      ></textarea>
                    </div>
                    
                    {sendStatus && (
                      <div className={`p-3 rounded-md mb-4 ${
                        sendStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {sendStatus.message}
                      </div>
                    )}
                    
                    <button
                      type="submit"
                      disabled={isSending}
                      className={`w-full bg-orange-500 text-white font-medium py-2 px-4 rounded-md 
                        ${isSending ? 'opacity-70 cursor-not-allowed' : 'hover:bg-orange-600'} 
                        transition-colors flex items-center justify-center`}
                    >
                      {isSending ? (
                        <>
                          <FaSpinner className="animate-spin mr-2" />
                          Sending...
                        </>
                      ) : (
                        'Send Reply'
                      )}
                    </button>
                  </form>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
};

export default ContactDetail;