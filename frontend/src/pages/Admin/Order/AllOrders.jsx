import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaSort, 
  FaDownload, 
  FaSync
} from 'react-icons/fa';
import Swal from 'sweetalert2';
import AdminSidebar from '../../../components/Admin/AminSideBar';
import OrderDetails from '../../../components/Order/OrderDetails';

// Status badge styling
const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Completed':
      return 'bg-green-100 text-green-800';
    case 'Delivered':
      return 'bg-blue-100 text-blue-800';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'Cancelled':
      return 'bg-red-100 text-red-800';
    case 'Preparing':
      return 'bg-orange-100 text-orange-800';
    case 'On the way':
      return 'bg-indigo-100 text-indigo-800';
    case 'Ready for Pickup':
      return 'bg-emerald-100 text-emerald-800';
    case 'Failed':
      return 'bg-red-100 text-red-800';
    case 'Refunded':
      return 'bg-purple-100 text-purple-800';
    case 'Confirmed':
      return 'bg-sky-100 text-sky-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Date formatting
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    return 'Invalid date';
  }
};

const AllOrders = () => {
  // States
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'placedAt', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    paymentMethod: '',
    startDate: '',
    endDate: ''
  });
  
  // URL params
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Mock user for sidebar
  const user = {
    name: 'Admin User',
    email: 'admin@digidine.com'
  };

  // Effects
  useEffect(() => {
    // Get status from URL if present
    const statusParam = searchParams.get('status');
    if (statusParam) {
      setFilters(prev => ({ ...prev, status: statusParam }));
    }
    
    fetchOrders();
  }, [searchParams]);

  // Fetch orders from API
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/orders/');
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      
      // Find orders array in response
      let ordersData = [];
      if (Array.isArray(data)) {
        ordersData = data;
      } else if (data && Array.isArray(data.orders)) {
        ordersData = data.orders;
      } else if (data && typeof data === 'object') {
        const possibleOrdersArray = Object.values(data).find(val => Array.isArray(val));
        if (possibleOrdersArray) {
          ordersData = possibleOrdersArray;
        } else {
          throw new Error('Could not find orders array in API response');
        }
      }
      
      setOrders(ordersData);
      setTotalPages(Math.ceil(ordersData.length / ordersPerPage));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.message);
      setLoading(false);
      toast.error(`Failed to load orders: ${error.message}`);
    }
  };

  // Apply filters and search
  useEffect(() => {
    let result = [...orders];
    
    // Apply status filter
    if (filters.status) {
      result = result.filter(order => order.orderStatus === filters.status);
    }
    
    // Apply payment method filter
    if (filters.paymentMethod) {
      result = result.filter(order => order.paymentMethod === filters.paymentMethod);
    }
    
    // Apply date range filter
    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59); // Include the entire end day
      
      result = result.filter(order => {
        const orderDate = new Date(order.placedAt);
        return orderDate >= start && orderDate <= end;
      });
    }
    
    // Apply search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(order =>
        (order.orderId && order.orderId.toLowerCase().includes(searchLower)) ||
        (order.customer?.name && order.customer.name.toLowerCase().includes(searchLower)) ||
        (order.customer?.email && order.customer.email.toLowerCase().includes(searchLower)) ||
        (order.restaurantName && order.restaurantName.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Handle nested properties (e.g., customer.name)
        if (sortConfig.key.includes('.')) {
          const keys = sortConfig.key.split('.');
          aValue = keys.reduce((obj, key) => obj?.[key], a);
          bValue = keys.reduce((obj, key) => obj?.[key], b);
        }
        
        // Handle date sorting
        if (sortConfig.key === 'placedAt') {
          aValue = new Date(aValue || 0).getTime();
          bValue = new Date(bValue || 0).getTime();
        }
        
        // Handle string sorting
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        // Handle numeric sorting
        if (aValue === bValue) return 0;
        if (sortConfig.direction === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }
    
    setFilteredOrders(result);
  }, [orders, searchTerm, sortConfig, filters]);
  
  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Handle order selection
  const handleViewDetails = useCallback((order) => {
    const formattedOrder = {
      id: order.orderId || 'N/A',
      orderStatus: order.orderStatus || 'Pending',
      statusTimestamps: order.statusTimestamps || {},
      items: Array.isArray(order.items) ? order.items.map((item, index) => ({
        id: item._id || index,
        name: item.name || 'Unknown Item',
        price: item.price || 0,
        quantity: item.quantity || 1,
        category: item.category || 'N/A',
        size: item.size || 'N/A' // Include the size field
      })) : [],
      total: order.totalAmount || 0,
      deliveryAddress: order.customer?.address || 'No address provided',
      customer: order.customer || { name: 'N/A', email: 'N/A', phone: 'N/A' },
      restaurant: order.restaurantName || 'N/A',
      paymentMethod: order.paymentMethod || 'N/A',
      paymentStatus: order.paymentStatus || 'N/A',
      placedAt: order.placedAt || null,
      orderNote: order.orderNote || ''
    };
  
    setSelectedOrder(formattedOrder);
  }, []);

  // Handle close details
  const handleCloseDetails = () => {
    setSelectedOrder(null);
  };

  // Handle edit order
  const handleEditOrder = (orderId) => {
    toast.success(`Edit order ${orderId} feature coming soon`);
    // navigate(`/admin/orders/${orderId}/edit`);
  };

// Add this function to handle order deletion
const handleDeleteOrder = async (orderId) => {
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Yes, delete it!',
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        // Correct URL path with /orders/ segment before the orderId
        const response = await fetch(`http://localhost:5001/api/orders/orders/${orderId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete order');
        }

        // Remove the deleted order from the local state
        setOrders((prevOrders) => prevOrders.filter((order) => order.orderId !== orderId));
        toast.success(`Order ${orderId} deleted successfully`);
      } catch (error) {
        console.error('Error deleting order:', error);
        toast.error(`Failed to delete order: ${error.message}`);
      }
    }
  });
};

  // Handle filter toggle
  const toggleFilter = () => {
    setFilterVisible(!filterVisible);
  };

  // Handle filter reset
  const resetFilters = () => {
    setFilters({
      status: '',
      paymentMethod: '',
      startDate: '',
      endDate: ''
    });
    setSearchTerm('');
    
    // Also update URL params
    setSearchParams({});
  };

  // Apply filters from the form
  const applyFilters = (e) => {
    e.preventDefault();
    
    // Update URL with status if present
    if (filters.status) {
      setSearchParams({ status: filters.status });
    } else {
      setSearchParams({});
    }
    
    // Close filter panel
    setFilterVisible(false);
  };

  const exportToCSV = () => {
    try {
      // Get visible orders
      const ordersToExport = filteredOrders;
  
      // Prepare CSV content
      let csvContent = "data:text/csv;charset=utf-8,";
  
      // Add headers
      csvContent += "Order ID,Customer,Restaurant,Date,Total,Payment Method,Status,Items\n";
  
      // Add rows
      ordersToExport.forEach(order => {
        const items = order.items.map(item => `${item.quantity}x ${item.size} ${item.name}`).join(" | ");
        const row = [
          order.orderId || '',
          order.customer?.name || '',
          order.restaurantName || '',
          order.placedAt ? new Date(order.placedAt).toLocaleDateString() : '',
          order.totalAmount || 0,
          order.paymentMethod || '',
          order.orderStatus || '',
          items // Include items with size
        ].map(cell => `"${cell}"`).join(',');
  
        csvContent += row + '\n';
      });
  
      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
  
      // Trigger download
      link.click();
      document.body.removeChild(link);
  
      toast.success('Orders exported successfully');
    } catch (error) {
      toast.error(`Failed to export: ${error.message}`);
    }
  };
  // Get current items for pagination
  const getCurrentItems = () => {
    const indexOfLastItem = currentPage * ordersPerPage;
    const indexOfFirstItem = indexOfLastItem - ordersPerPage;
    return filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  };

  // Handle page change
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Pagination component
  const Pagination = () => {
    if (totalPages <= 1) return null;
    
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
    
    return (
      <nav className="flex justify-center mt-6">
        <ul className="inline-flex items-center -space-x-px">
          <li>
            <button
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="block px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700"
            >
              Previous
            </button>
          </li>
          {pageNumbers.map(number => (
            <li key={number}>
              <button
                onClick={() => paginate(number)}
                className={`px-3 py-2 leading-tight border border-gray-300 ${
                  currentPage === number
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                {number}
              </button>
            </li>
          ))}
          <li>
            <button
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="block px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700"
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen">
        <AdminSidebar user={user} />
        <div className="flex-1 lg:ml-[280px]">
          <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 font-medium">Loading orders...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen">
        <AdminSidebar user={user} />
        <div className="flex-1 lg:ml-[280px]">
          <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center p-8 bg-white rounded-xl shadow-md max-w-md mx-4">
              <div className="text-red-500 text-5xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Failed to Load Orders</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button 
                onClick={() => fetchOrders()} 
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar user={user} />
      <div className="flex-1 overflow-auto lg:ml-[280px]">
        <div className="container mx-auto px-4 py-8">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">All Orders</h1>
                <p className="text-gray-500 mt-1">
                  Manage and view all orders from the system
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
                <button
                  onClick={toggleFilter}
                  className="px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center gap-2 text-sm"
                >
                  <FaFilter />
                  Filters
                </button>
                
                <button
                  onClick={exportToCSV}
                  className="px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center gap-2 text-sm"
                >
                  <FaDownload />
                  Export
                </button>
                
                <button
                  onClick={fetchOrders}
                  className="px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center gap-2 text-sm"
                >
                  <FaSync />
                  Refresh
                </button>
              </div>
            </div>
            
            {/* Search and filter bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search orders by ID, customer or restaurant..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                
                {filters.status && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-800 rounded-lg">
                    <span>Status: {filters.status}</span>
                    <button 
                      onClick={() => {
                        setFilters(prev => ({ ...prev, status: '' }));
                        setSearchParams({});
                      }}
                      className="text-orange-700 hover:text-orange-900"
                    >
                      &times;
                    </button>
                  </div>
                )}
                
                {(filters.status || filters.paymentMethod || filters.startDate || filters.endDate || searchTerm) && (
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm"
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              {/* Advanced Filters Panel */}
              {filterVisible && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-4 border-t border-gray-200 pt-4"
                >
                  <form onSubmit={applyFilters}>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
                        <select
                          value={filters.status}
                          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                        >
                          <option value="">All Statuses</option>
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Preparing">Preparing</option>
                          <option value="Ready for Pickup">Ready for Pickup</option>
                          <option value="On the way">On the way</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                          <option value="Failed">Failed</option>
                          <option value="Refunded">Refunded</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                        <select
                          value={filters.paymentMethod}
                          onChange={(e) => setFilters(prev => ({ ...prev, paymentMethod: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                        >
                          <option value="">All Methods</option>
                          <option value="Credit Card">Credit Card</option>
                          <option value="Debit Card">Debit Card</option>
                          <option value="PayPal">PayPal</option>
                          <option value="Cash on delivery">Cash on Delivery</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={filters.startDate}
                          onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                          type="date"
                          value={filters.endDate}
                          onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setFilterVisible(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </div>
            
            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('orderId')}>
                        <div className="flex items-center gap-1">
                          Order ID
                          <FaSort className="text-gray-400" />
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('customer.name')}>
                        <div className="flex items-center gap-1">
                          Customer
                          <FaSort className="text-gray-400" />
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('restaurantName')}>
                        <div className="flex items-center gap-1">
                          Restaurant
                          <FaSort className="text-gray-400" />
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('placedAt')}>
                        <div className="flex items-center gap-1">
                          Date
                          <FaSort className="text-gray-400" />
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('totalAmount')}>
                        <div className="flex items-center gap-1">
                          Total
                          <FaSort className="text-gray-400" />
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('paymentMethod')}>
                        <div className="flex items-center gap-1">
                          Payment
                          <FaSort className="text-gray-400" />
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('orderStatus')}>
                        <div className="flex items-center gap-1">
                          Status
                          <FaSort className="text-gray-400" />
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getCurrentItems().map((order, idx) => (
                      <motion.tr 
                        key={order._id || order.orderId || idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        className={selectedRows.includes(order.orderId) ? 'bg-orange-50' : ''}
                      >
                        
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order.orderId?.slice(-6) || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.customer?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.restaurantName || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.placedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${order.totalAmount?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.paymentMethod || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.orderStatus)}`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-center space-x-2">
                            <button 
                              onClick={() => handleViewDetails(order)}
                              className="text-blue-600 hover:text-blue-800"
                              title="View Details"
                            >
                              <FaEye size={16} />
                            </button>
                            <button
      onClick={() => handleDeleteOrder(order.orderId)} // Call the delete function
      className="text-red-600 hover:text-red-800"
      title="Delete Order"
    >
      <FaTrash size={16} />
    </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                    
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan="9" className="px-6 py-10 text-center text-gray-500">
                          <div className="flex flex-col items-center justify-center">
                            <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <p className="text-xl font-medium mb-1">No orders found</p>
                            <p className="text-gray-400">
                              {searchTerm || filters.status || filters.paymentMethod || filters.startDate
                                ? 'Try changing your search or filter criteria'
                                : 'There are no orders in the system yet'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Table Footer */}
              <div className="bg-gray-50 px-6 py-3 flex flex-col md:flex-row items-center justify-between">
                <div className="text-sm text-gray-500 mb-4 md:mb-0">
                  Showing {Math.min(filteredOrders.length, ordersPerPage)} of {filteredOrders.length} orders
                </div>
                <Pagination />
              </div>
            </div>
          </motion.div>

          {/* Order Details Modal */}
          {selectedOrder && (
            <OrderDetails 
              order={selectedOrder} 
              onClose={handleCloseDetails}
            />
          )}
        </div>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
};

export default AllOrders;