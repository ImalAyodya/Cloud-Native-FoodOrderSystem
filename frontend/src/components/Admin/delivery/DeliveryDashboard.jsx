import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DeliveryDashboard = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  
  // Fetch deliveries and drivers data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get all deliveries
      const deliveriesResponse = await axios.get('http://localhost:5002/api/deliveries');
      
      // Get all drivers
      const driversResponse = await axios.get('http://localhost:5002/api/drivers');
      
      setDeliveries(deliveriesResponse.data);
      setDrivers(driversResponse.data);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again later.');
      setLoading(false);
    }
  };
  
  // Initial fetch and set up interval
  useEffect(() => {
    fetchData();
    
    // Set up auto-refresh
    const intervalId = setInterval(fetchData, refreshInterval);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [refreshInterval]);
  
  // Get driver name by ID
  const getDriverName = (driverId) => {
    const driver = drivers.find(d => d._id === driverId);
    return driver ? driver.name : 'Unassigned';
  };
  
  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleTimeString();
  };
  
  // Get status color
  const getStatusColor = (status) => {
    const statusColors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'driver_assigned': 'bg-blue-100 text-blue-800',
      'picked_up': 'bg-purple-100 text-purple-800',
      'in_transit': 'bg-indigo-100 text-indigo-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };
  
  if (loading && deliveries.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Delivery Management Dashboard</h1>
        <div className="flex gap-2">
          <button 
            onClick={fetchData}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
          >
            Refresh
          </button>
          <select 
            value={refreshInterval} 
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value={5000}>Refresh: 5s</option>
            <option value={10000}>Refresh: 10s</option>
            <option value={30000}>Refresh: 30s</option>
            <option value={60000}>Refresh: 1m</option>
          </select>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="flex bg-gray-100 font-semibold">
          <div className="w-1/6 p-3">Order ID</div>
          <div className="w-1/6 p-3">Status</div>
          <div className="w-1/6 p-3">Driver</div>
          <div className="w-1/6 p-3">Assigned At</div>
          <div className="w-1/6 p-3">Picked Up At</div>
          <div className="w-1/6 p-3">Delivered At</div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {deliveries.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No deliveries found</div>
          ) : (
            deliveries.map(delivery => (
              <div key={delivery._id} className="flex hover:bg-gray-50">
                <div className="w-1/6 p-3 font-mono text-sm">{delivery.orderId}</div>
                <div className="w-1/6 p-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(delivery.status)}`}>
                    {delivery.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="w-1/6 p-3">{getDriverName(delivery.driverId)}</div>
                <div className="w-1/6 p-3">{formatTime(delivery.assignedAt)}</div>
                <div className="w-1/6 p-3">{formatTime(delivery.pickedUpAt)}</div>
                <div className="w-1/6 p-3">{formatTime(delivery.deliveredAt)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;