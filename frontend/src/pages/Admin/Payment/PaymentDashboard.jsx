import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaMoneyBillWave, FaCreditCard, FaMoneyBill, FaPaypal, FaCalendarAlt, FaFilter, FaSearch, FaExclamationCircle, FaDownload, FaChartLine, FaChartPie, FaCheckCircle, FaFilePdf, FaChartBar } from 'react-icons/fa';
import { BsCashStack, BsCreditCard2Front } from 'react-icons/bs';
import { RiErrorWarningLine } from 'react-icons/ri';
import { format, parseISO, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import { toast, Toaster } from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';
import AdminSidebar from '../../../components/Admin/AminSideBar';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { format as formatDate } from 'date-fns'; // Rename to avoid conflict with the existing formatDate function

const PaymentDashboard = () => {
  // State for payment data and UI control
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [summaryData, setSummaryData] = useState({
    totalRevenue: 0,
    totalPayments: 0,
    pendingPayments: 0,
    failedPayments: 0,
    completedPayments: 0,
    avgOrderValue: 0,
    paymentMethodDistribution: {}
  });
  
  const paymentsPerPage = 10;

  // Colors for charts
  const COLORS = ['#FF6B35', '#3498db', '#2ecc71', '#9b59b6', '#f1c40f', '#e74c3c'];
  
  // Payment method icons
  const getPaymentMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case 'credit card':
        return <FaCreditCard className="text-blue-500" />;
      case 'cash on delivery':
        return <FaMoneyBill className="text-green-500" />;
      case 'paypal':
        return <FaPaypal className="text-indigo-500" />;
      default:
        return <BsCashStack className="text-gray-500" />;
    }
  };

  // Add this before the fetchPayments function
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found. Please log in and try again.');
          setIsLoading(false);
          return;
        }
        
        // First do a simple health check
        const response = await axios.get('http://localhost:5001/api/health', {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000 // 5 second timeout
        }).catch(err => {
          // If health endpoint doesn't exist, try main endpoint
          return axios.get('http://localhost:5001/api/orders?limit=1', {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000
          });
        });
        
        console.log('API connection test successful');
        fetchPayments();
      } catch (error) {
        console.error('API connection test failed:', error);
        
        // Try alternative endpoints
        try {
          const token = localStorage.getItem('token');
          // Try the order management service on a different port
          console.log('Trying alternative endpoint...');
          const altResponse = await axios.get('http://localhost:5002/api/orders?limit=1', {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000
          });
          
          console.log('Alternative API connection successful, updating endpoint');
          // If successful, use this endpoint for data fetch
          const originalFetchPayments = fetchPayments;
          fetchPayments = async () => {
            setIsLoading(true);
            try {
              // Same code but different endpoint
              const token = localStorage.getItem('token');
              const response = await axios.get('http://localhost:5002/api/orders?limit=1000', {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              // Continue with rest of your function...
              // ...
            } catch (error) {
              console.error('Error fetching from alternative endpoint:', error);
              setError('Could not connect to any order service. Please check your network connection and API status.');
              setIsLoading(false);
            }
          };
          fetchPayments();
        } catch (altError) {
          console.error('All connection attempts failed');
          setError('Could not connect to the Order Management Service. Please make sure the service is running.');
          setIsLoading(false);
        }
      }
    };
    
    checkApiConnection();
  }, []);

  // Fetch payment data from orders API
  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      console.log('Making API request to order service...');
      const response = await axios.get('http://localhost:5001/api/orders?limit=1000', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('API Response structure:', Object.keys(response.data));
      
      // Handle different response formats
      let ordersData = [];
      
      if (response.data && Array.isArray(response.data.orders)) {
        // Format 1: { orders: [...] }
        ordersData = response.data.orders;
      } else if (response.data && Array.isArray(response.data)) {
        // Format 2: [...]
        ordersData = response.data;
      } else if (response.data) {
        // Format 3: Try to find any array in the response
        const possibleArrays = Object.values(response.data).filter(val => Array.isArray(val));
        if (possibleArrays.length > 0) {
          ordersData = possibleArrays[0];
        } else {
          console.error('Response structure:', response.data);
          throw new Error('No order array found in API response');
        }
      } else {
        console.error('Invalid response format:', response);
        throw new Error('Invalid API response format');
      }
      
      console.log(`Found ${ordersData.length} orders to process`);
      
      // Extract payment data from orders
      const paymentData = ordersData.map(order => ({
        id: order._id,
        orderId: order.orderId,
        date: order.placedAt || order.createdAt,
        amount: order.totalAmount || 0,
        paymentMethod: order.paymentMethod || 'Not specified',
        paymentStatus: order.paymentStatus || 'Unknown',
        transactionId: order.paymentTransactionId || 'N/A',
        customerName: order.customer?.name || 'Unknown customer',
        customerEmail: order.customer?.email || 'N/A',
        restaurantName: order.restaurantName || 'Unknown restaurant'
      }));
      
      setPayments(paymentData);
      setFilteredPayments(paymentData);
      
      // Calculate summary data
      calculateSummaryData(paymentData);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching payment data:', error);
      setError(error.message || 'Failed to load payment data');
      setIsLoading(false);
      toast.error(`Error: ${error.message || 'Failed to load payment data'}`);
    }
  };
  
  // Calculate summary data for dashboard
  const calculateSummaryData = (paymentData) => {
    const totalPayments = paymentData.length;
    const totalRevenue = paymentData.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const pendingPayments = paymentData.filter(p => p.paymentStatus?.toLowerCase() === 'pending').length;
    const failedPayments = paymentData.filter(p => p.paymentStatus?.toLowerCase() === 'failed').length;
    const completedPayments = paymentData.filter(p => p.paymentStatus?.toLowerCase() === 'completed').length;
    const avgOrderValue = totalPayments > 0 ? totalRevenue / totalPayments : 0;
    
    // Get payment method distribution
    const paymentMethodDistribution = paymentData.reduce((acc, payment) => {
      const method = payment.paymentMethod || 'Unknown';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});
    
    setSummaryData({
      totalRevenue,
      totalPayments,
      pendingPayments,
      failedPayments,
      completedPayments,
      avgOrderValue,
      paymentMethodDistribution
    });
  };

  // Filter payments based on search, date range, payment method, and status
  useEffect(() => {
    let result = [...payments];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(payment => 
        payment.orderId?.toLowerCase().includes(query) ||
        payment.transactionId?.toLowerCase().includes(query) ||
        payment.customerName?.toLowerCase().includes(query) ||
        payment.customerEmail?.toLowerCase().includes(query) ||
        payment.restaurantName?.toLowerCase().includes(query)
      );
    }
    
    // Apply date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (dateRange) {
        case 'today':
          startDate = startOfDay(now);
          break;
        case 'yesterday':
          startDate = startOfDay(subDays(now, 1));
          break;
        case 'week':
          startDate = startOfWeek(now);
          break;
        case 'month':
          startDate = startOfMonth(now);
          break;
        default:
          startDate = null;
      }
      
      if (startDate) {
        result = result.filter(payment => {
          const paymentDate = new Date(payment.date);
          return paymentDate >= startDate;
        });
      }
    }
    
    // Apply payment method filter
    if (paymentMethodFilter !== 'all') {
      result = result.filter(payment => 
        payment.paymentMethod?.toLowerCase() === paymentMethodFilter.toLowerCase()
      );
    }
    
    // Apply payment status filter
    if (paymentStatusFilter !== 'all') {
      result = result.filter(payment => 
        payment.paymentStatus?.toLowerCase() === paymentStatusFilter.toLowerCase()
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'date':
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'orderId':
          comparison = a.orderId?.localeCompare(b.orderId) || 0;
          break;
        case 'paymentMethod':
          comparison = a.paymentMethod?.localeCompare(b.paymentMethod) || 0;
          break;
        case 'paymentStatus':
          comparison = a.paymentStatus?.localeCompare(b.paymentStatus) || 0;
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredPayments(result);
    setCurrentPage(1);
  }, [payments, searchQuery, dateRange, paymentMethodFilter, paymentStatusFilter, sortField, sortDirection]);

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // Helper function for startOfDay
  const startOfDay = (date) => {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  };

  // Prepare data for charts
  const preparePaymentMethodData = () => {
    return Object.entries(summaryData.paymentMethodDistribution).map(([name, value]) => ({
      name,
      value
    }));
  };
  
  const prepareWeeklyRevenueData = () => {
    // Create a map to store daily revenue
    const dailyRevenue = {};
    const today = new Date();
    
    // Initialize the last 7 days with 0 revenue
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const formattedDate = format(date, 'MMM dd');
      dailyRevenue[formattedDate] = 0;
    }
    
    // Calculate revenue for each day
    filteredPayments.forEach(payment => {
      const paymentDate = new Date(payment.date);
      // Only include payments from the last 7 days
      if (paymentDate >= subDays(today, 7)) {
        const formattedDate = format(paymentDate, 'MMM dd');
        dailyRevenue[formattedDate] = (dailyRevenue[formattedDate] || 0) + payment.amount;
      }
    });
    
    // Convert to array for chart
    return Object.entries(dailyRevenue).map(([date, revenue]) => ({
      date,
      revenue
    }));
  };
  
  // Handle sort changes
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Get status badge
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Completed</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pending</span>;
      case 'failed':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Failed</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{status || 'Unknown'}</span>;
    }
  };
  
  // Handle export data
  const handleExportCSV = () => {
    // Create CSV content
    const headers = [
      'Order ID', 
      'Date', 
      'Customer', 
      'Restaurant', 
      'Amount', 
      'Payment Method', 
      'Status', 
      'Transaction ID'
    ].join(',');
    
    const rows = filteredPayments.map(payment => [
      payment.orderId,
      formatDate(payment.date),
      payment.customerName,
      payment.restaurantName,
      payment.amount.toFixed(2),
      payment.paymentMethod,
      payment.paymentStatus,
      payment.transactionId
    ].join(','));
    
    const csvContent = [headers, ...rows].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `payment_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Payment report downloaded successfully');
  };
  
  // Add this function with your other handler functions
  const handleExportPDF = async () => {
    try {
      toast.loading('Generating PDF report...');
      
      // Create a new PDF document
      const doc = new jsPDF();
      
      // Set basic variables
      const today = new Date();
      const generatedDate = today.toLocaleDateString() + ' ' + today.toLocaleTimeString();
      let y = 10;
      
      // Add title
      doc.setFontSize(16);
      doc.text('DigiDine Payment Report', 14, y);
      y += 6;
      
      // Add generated date
      doc.setFontSize(10);
      doc.text(`Generated on: ${generatedDate}`, 14, y);
      y += 10;
      
      // Add summary section
      doc.setFontSize(12);
      doc.text('PAYMENT SUMMARY', 14, y);
      y += 4;
      
      autoTable(doc, {
        startY: y,
        head: [['Metric', 'Value']],
        body: [
          ['Total Revenue', `$${summaryData.totalRevenue.toFixed(2)}`],
          ['Total Payments', `${summaryData.totalPayments}`],
          ['Average Order Value', `$${summaryData.avgOrderValue.toFixed(2)}`],
          ['Completed Payments', `${summaryData.completedPayments} (${((summaryData.completedPayments / summaryData.totalPayments) * 100).toFixed(1)}%)`],
          ['Pending Payments', `${summaryData.pendingPayments} (${((summaryData.pendingPayments / summaryData.totalPayments) * 100).toFixed(1)}%)`],
          ['Failed Payments', `${summaryData.failedPayments} (${((summaryData.failedPayments / summaryData.totalPayments) * 100).toFixed(1)}%)`]
        ],
        theme: 'grid',
        headStyles: { fillColor: [255, 107, 53] },
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: { halign: 'right' }
        }
      });
      
      y = doc.lastAutoTable.finalY + 10;
      
      // Payment Method Distribution
      doc.setFontSize(12);
      doc.text('PAYMENT METHOD DISTRIBUTION', 14, y);
      y += 4;
      
      const paymentMethodData = preparePaymentMethodData();
      const paymentMethodRows = paymentMethodData.map(item => [
        item.name,
        `${item.value} payments`,
        `${((item.value / summaryData.totalPayments) * 100).toFixed(1)}%`
      ]);
      
      autoTable(doc, {
        startY: y,
        head: [['Payment Method', 'Count', 'Percentage']],
        body: paymentMethodRows,
        theme: 'grid',
        headStyles: { fillColor: [255, 107, 53] }
      });
      
      y = doc.lastAutoTable.finalY + 10;
      
      // Weekly Revenue
      doc.setFontSize(12);
      doc.text('WEEKLY REVENUE', 14, y);
      y += 4;
      
      const weeklyRevenueData = prepareWeeklyRevenueData();
      const weeklyRevenueRows = weeklyRevenueData.map(item => [
        item.date,
        `$${item.revenue.toFixed(2)}`
      ]);
      
      autoTable(doc, {
        startY: y,
        head: [['Date', 'Revenue']],
        body: weeklyRevenueRows,
        theme: 'grid',
        headStyles: { fillColor: [255, 107, 53] }
      });
      
      y = doc.lastAutoTable.finalY + 10;
      
      // Check if we need a new page
      if (y > 240) {
        doc.addPage();
        y = 10;
      }
      
      // Create a helper function for formatting transaction rows
      const formatTransactions = (transactions) =>
        transactions.map(payment => [
          payment.orderId || 'N/A',
          new Date(payment.date).toLocaleDateString(),
          payment.customerName,
          `$${payment.amount.toFixed(2)}`,
          payment.paymentMethod
        ]);
      
      // Group payments by status
      const completedPayments = filteredPayments.filter(p => p.paymentStatus?.toLowerCase() === 'completed');
      const pendingPayments = filteredPayments.filter(p => p.paymentStatus?.toLowerCase() === 'pending');
      const failedPayments = filteredPayments.filter(p => p.paymentStatus?.toLowerCase() === 'failed');
      
      // Add transactions by status section
      doc.setFontSize(12);
      doc.text('PAYMENT TRANSACTIONS BY STATUS', 14, y);
      y += 4;
      
      // Completed Payments
      if (completedPayments.length > 0) {
        doc.setFontSize(11);
        doc.text('Completed Payments', 14, y);
        y += 2;
        
        autoTable(doc, {
          startY: y,
          head: [['Order ID', 'Date', 'Customer', 'Amount', 'Method']],
          body: formatTransactions(completedPayments.slice(0, 10)),
          theme: 'grid',
          headStyles: { fillColor: [46, 204, 113] } // Green for completed
        });
        
        y = doc.lastAutoTable.finalY + 6;
        
        if (completedPayments.length > 10) {
          doc.setFontSize(8);
          doc.text(`Showing 10 of ${completedPayments.length} completed payments.`, 14, y);
          y += 4;
        }
      }
      
      // Check if we need a new page
      if (y > 240 && pendingPayments.length > 0) {
        doc.addPage();
        y = 10;
      }
      
      // Pending Payments
      if (pendingPayments.length > 0) {
        doc.setFontSize(11);
        doc.text('Pending Payments', 14, y);
        y += 2;
        
        autoTable(doc, {
          startY: y,
          head: [['Order ID', 'Date', 'Customer', 'Amount', 'Method']],
          body: formatTransactions(pendingPayments.slice(0, 10)),
          theme: 'grid',
          headStyles: { fillColor: [241, 196, 15] } // Yellow for pending
        });
        
        y = doc.lastAutoTable.finalY + 6;
        
        if (pendingPayments.length > 10) {
          doc.setFontSize(8);
          doc.text(`Showing 10 of ${pendingPayments.length} pending payments.`, 14, y);
          y += 4;
        }
      }
      
      // Check if we need a new page
      if (y > 240 && failedPayments.length > 0) {
        doc.addPage();
        y = 10;
      }
      
      // Failed Payments
      if (failedPayments.length > 0) {
        doc.setFontSize(11);
        doc.text('Failed Payments', 14, y);
        y += 2;
        
        autoTable(doc, {
          startY: y,
          head: [['Order ID', 'Date', 'Customer', 'Amount', 'Method']],
          body: formatTransactions(failedPayments.slice(0, 10)),
          theme: 'grid',
          headStyles: { fillColor: [231, 76, 60] } // Red for failed
        });
        
        y = doc.lastAutoTable.finalY + 6;
        
        if (failedPayments.length > 10) {
          doc.setFontSize(8);
          doc.text(`Showing 10 of ${failedPayments.length} failed payments.`, 14, y);
          y += 4;
        }
      }
      
      // Add final summary
      if (y > 240) {
        doc.addPage();
        y = 10;
      }
      
      doc.setFontSize(12);
      doc.text('PAYMENT OVERVIEW', 14, y);
      y += 6;
      
      autoTable(doc, {
        startY: y,
        head: [['Total Completed', 'Total Pending', 'Total Failed', 'Total Revenue']],
        body: [[
          `${summaryData.completedPayments} payments`,
          `${summaryData.pendingPayments} payments`,
          `${summaryData.failedPayments} payments`,
          `$${summaryData.totalRevenue.toFixed(2)}`
        ]],
        theme: 'grid',
        headStyles: { fillColor: [52, 152, 219] },
        styles: { fontStyle: 'bold' }
      });
      
      // Footer on each page
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `DigiDine Payment Report - Page ${i} of ${pageCount}`, 
          doc.internal.pageSize.width / 2, 
          doc.internal.pageSize.height - 10, 
          { align: 'center' }
        );
      }
      
      // Save the PDF
      doc.save(`DigiDine_Payment_Report_${format(today, 'yyyy-MM-dd')}.pdf`);
      
      toast.dismiss();
      toast.success('PDF report generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.dismiss();
      toast.error('Failed to generate PDF report');
    }
  };

  // Pagination
  const indexOfLastPayment = currentPage * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirstPayment, indexOfLastPayment);
  const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage);
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 p-8 lg:ml-64">
          <div className="flex justify-center items-center h-full">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600 font-medium">Loading payment data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 p-8 lg:ml-64">
          <div className="flex justify-center items-center h-full">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
              <div className="text-red-500 text-5xl mb-4">
                <FaExclamationCircle className="mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Payment Data</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
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
    <div className="flex min-h-screen bg-gray-100 ml-15">
      {/* Try to render the sidebar */}
      {(() => {
        try {
          return <AdminSidebar />;
        } catch (e) {
          console.error("Error rendering sidebar:", e);
          return (
            <div className="w-64 bg-white shadow-md">
              <div className="p-4">Admin Menu (Fallback)</div>
            </div>
          );
        }
      })()}
      
      <div className="flex-1 p-8 lg:ml-64 overflow-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Dashboard</h1>
        <p className="text-gray-500 mb-8">Monitor and manage all payments in the DigiDine platform</p>
        
        {isLoading ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading payment data...</p>
          </div>
        ) : error ? (
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto text-center">
            <div className="text-red-500 text-5xl mb-4">
              <FaExclamationCircle className="mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Payment Data</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Summary Cards - First Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
              {/* Total Revenue Card */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 col-span-1 xl:col-span-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
                    <h3 className="text-3xl font-bold text-gray-800 mt-1">${summaryData.totalRevenue.toFixed(2)}</h3>
                    <p className="text-xs text-gray-500 mt-1">From {summaryData.totalPayments} orders</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-500">
                    <FaMoneyBillWave size={20} />
                  </div>
                </div>
              </div>
              
              {/* Average Order Value Card */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 col-span-1 xl:col-span-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Average Order Value</p>
                    <h3 className="text-3xl font-bold text-gray-800 mt-1">${summaryData.avgOrderValue.toFixed(2)}</h3>
                    <p className="text-xs text-gray-500 mt-1">Per transaction</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
                    <FaChartLine size={20} />
                  </div>
                </div>
              </div>

              {/* Completed Payments Card - NEW */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 col-span-1 xl:col-span-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Completed Payments</p>
                    <h3 className="text-3xl font-bold text-gray-800 mt-1">{summaryData.completedPayments || 0}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {((summaryData.completedPayments / summaryData.totalPayments) * 100).toFixed(1)}% success rate
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-500">
                    <FaCheckCircle size={20} />
                  </div>
                </div>
              </div>

              {/* Pending Payments Card */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 col-span-1 xl:col-span-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Pending Payments</p>
                    <h3 className="text-3xl font-bold text-gray-800 mt-1">{summaryData.pendingPayments}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {summaryData.pendingPayments > 0 ? 'Require attention' : 'All payments processed'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500">
                    <FaCalendarAlt size={20} />
                  </div>
                </div>
              </div>

              {/* Failed Payments Card */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 col-span-1 xl:col-span-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Failed Payments</p>
                    <h3 className="text-3xl font-bold text-gray-800 mt-1">{summaryData.failedPayments}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {summaryData.failedPayments > 0 ? 'Need investigation' : 'No payment failures'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-500">
                    <RiErrorWarningLine size={20} />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts - Fix the layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Weekly Revenue Chart */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-full">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Weekly Revenue</h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={prepareWeeklyRevenueData()}
                      margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        angle={-15} 
                        textAnchor="end"
                        height={50}
                        tick={{fontSize: 12}}
                      />
                      <YAxis 
                        tickFormatter={(value) => `$${value}`}
                        width={80}
                      />
                      <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']} />
                      <Legend wrapperStyle={{ marginTop: 10 }} />
                      <Bar dataKey="revenue" name="Revenue" fill="#FF6B35" barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Payment Method Distribution */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-full">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Methods</h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={preparePaymentMethodData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={110}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {preparePaymentMethodData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value} payments`, name]} />
                      <Legend 
                        layout="horizontal" 
                        verticalAlign="bottom" 
                        align="center"
                        wrapperStyle={{ paddingTop: 20 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Filters and Controls */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold text-gray-800">Payment Transactions</h2>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleExportCSV}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaDownload size={14} />
                    Export CSV
                  </button>
                  
                  <button
                    onClick={handleExportPDF}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaFilePdf size={14} />
                    Export PDF Report
                  </button>
                  
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaSearch className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search transactions..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full min-w-[250px] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Date Range</label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
                
                {/* Payment Method Filter */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Payment Method</label>
                  <select
                    value={paymentMethodFilter}
                    onChange={(e) => setPaymentMethodFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="all">All Methods</option>
                    <option value="credit card">Credit Card</option>
                    <option value="cash on delivery">Cash on Delivery</option>
                    <option value="paypal">PayPal</option>
                  </select>
                </div>
                
                {/* Payment Status Filter */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Payment Status</label>
                  <select
                    value={paymentStatusFilter}
                    onChange={(e) => setPaymentStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="all">All Statuses</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                
                {/* Results Summary */}
                <div className="flex items-end">
                  <p className="text-sm text-gray-600">
                    Showing <span className="font-semibold">{filteredPayments.length}</span> transactions
                    {filteredPayments.length !== payments.length && (
                      <> (filtered from {payments.length})</>
                    )}
                  </p>
                </div>
              </div>
              
              {/* Payment Transactions Table */}
              <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('orderId')}
                      >
                        Order ID
                        {sortField === 'orderId' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('date')}
                      >
                        Date
                        {sortField === 'date' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('amount')}
                      >
                        Amount
                        {sortField === 'amount' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('paymentMethod')}
                      >
                        Method
                        {sortField === 'paymentMethod' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('paymentStatus')}
                      >
                        Status
                        {sortField === 'paymentStatus' && (
                          <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transaction ID
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentPayments.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                          No payment transactions found matching your filters.
                        </td>
                      </tr>
                    ) : (
                      currentPayments.map((payment, index) => (
                        <tr key={payment.id || index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {payment.orderId || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(payment.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {/* <div> */}
                              <div className="font-medium">{payment.customerName}</div>
                              <div className="text-xs text-gray-400">{payment.customerEmail}</div>
                            </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            ${payment.amount?.toFixed(2) || '0.00'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              {getPaymentMethodIcon(payment.paymentMethod)}
                              <span className="ml-2">{payment.paymentMethod}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {getStatusBadge(payment.paymentStatus)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="font-mono">
                              {payment.transactionId && payment.transactionId !== 'N/A' 
                                ? payment.transactionId.substring(0, 12) + '...'
                                : 'N/A'
                              }
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {filteredPayments.length > paymentsPerPage && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between">
                  <div className="text-sm text-gray-500 mb-4 sm:mb-0">
                    Showing {indexOfFirstPayment + 1} to {Math.min(indexOfLastPayment, filteredPayments.length)} of {filteredPayments.length} entries
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button
                      onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === 1 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Logic to show pages around current page
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1 rounded-md ${
                            currentPage === pageNum 
                              ? 'bg-orange-500 text-white' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(currentPage < totalPages ? currentPage + 1 : totalPages)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === totalPages 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Report Preview Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">Detailed Payment Reports</h2>
                  <p className="text-gray-600 mb-4">
                    Generate comprehensive PDF reports with detailed payment statistics, trends, and transaction lists categorized by status.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1 mb-4">
                    <li className="flex items-center gap-2">
                      <FaChartBar className="text-orange-500" />
                      Payment summary with key metrics
                    </li>
                    <li className="flex items-center gap-2">
                      <FaChartPie className="text-blue-500" />
                      Payment method distribution
                    </li>
                    <li className="flex items-center gap-2">
                      <FaCheckCircle className="text-green-500" />
                      Completed payment listings
                    </li>
                    <li className="flex items-center gap-2">
                      <FaCalendarAlt className="text-yellow-500" />
                      Pending payment listings
                    </li>
                    <li className="flex items-center gap-2">
                      <RiErrorWarningLine className="text-red-500" />
                      Failed payment listings
                    </li>
                  </ul>
                </div>
                <div className="flex-shrink-0 text-center">
                  <div className="mb-3 w-24 h-32 mx-auto bg-gray-100 rounded shadow-sm flex items-center justify-center">
                    <FaFilePdf size={40} className="text-red-500 opacity-80" />
                  </div>
                  <button
                    onClick={handleExportPDF}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mx-auto"
                  >
                    <FaFilePdf size={16} />
                    Generate Report
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentDashboard;