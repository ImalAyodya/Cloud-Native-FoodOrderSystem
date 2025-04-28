import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import DashboardSidebar from '../../components/Admin/AminSideBar';
import { 
  FaTruck, 
  FaUserCog,
  FaMapMarkedAlt, 
  FaUsers, 
  FaMotorcycle,
  FaCheckCircle,
  FaExclamationCircle,
  FaCarSide,
  FaBicycle,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaFilter,
  FaStar,
  FaChartBar,
  FaRoute,
  FaClock,
  FaList,
  FaUserPlus,
  FaEye
} from 'react-icons/fa';

// Map component for delivery tracking
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon issue
const DefaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const DriverIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const RestaurantIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const CustomerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const DeliveryManagement = () => {
  const [activeTab, setActiveTab] = useState('drivers');
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingDriver, setIsAddingDriver] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [mapCenter, setMapCenter] = useState([6.9271, 79.8612]); // Default Colombo
  const [mapZoom, setMapZoom] = useState(12);
  const [analytics, setAnalytics] = useState({
    activeDrivers: 0,
    totalDeliveries: 0,
    averageDeliveryTime: 0,
    deliveriesLastWeek: 0
  });
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverStats, setDriverStats] = useState({});
  const [isViewingDriverDetails, setIsViewingDriverDetails] = useState(false);
  
  // Form state for adding new driver
  const [driverForm, setDriverForm] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleType: 'Car',
    licensePlate: '',
    status: 'active'
  });
  
  // Fetch drivers and active orders
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // 1. Get all users with delivery_person role from User Service
        const driversResponse = await fetch('http://localhost:5000/api/users?role=delivery_person');
        const driversData = await driversResponse.json();
        
        if (driversData.success && driversData.users) {
          // Format the driver data
          const formattedDrivers = await Promise.all(driversData.users.map(async (driver) => {
            // For each driver, try to get their stats
            try {
              const statsResponse = await fetch(`http://localhost:5001/api/orders/driver/${driver._id}/stats`);
              const statsData = await statsResponse.json();
              
              // Get their active orders
              const ordersResponse = await fetch(`http://localhost:5001/api/orders/driver/${driver._id}`);
              const ordersData = await ordersResponse.json();
              
              const activeOrder = ordersData.success && ordersData.orders ? 
                ordersData.orders.find(order => ['On the way', 'Ready for Pickup'].includes(order.orderStatus)) : 
                null;
              
              return {
                id: driver._id,
                name: driver.name,
                email: driver.email,
                phone: driver.phoneNo || 'Not provided',
                vehicleType: driver.vehicleType || 'Car',
                licensePlate: driver.licensePlate || 'Not provided',
                rating: statsData.success ? statsData.stats.rating : 0,
                completedDeliveries: statsData.success ? statsData.stats.completed : 0,
                status: driver.isActive ? 'active' : 'inactive',
                onlineStatus: activeOrder ? 'online' : 'offline',
                currentLocation: activeOrder?.driverCurrentLocation || null,
                currentOrder: activeOrder
              };
            } catch (statsError) {
              console.warn(`Could not fetch stats for driver ${driver._id}:`, statsError);
              return {
                id: driver._id,
                name: driver.name,
                email: driver.email,
                phone: driver.phoneNo || 'Not provided',
                vehicleType: driver.vehicleType || 'Car',
                licensePlate: driver.licensePlate || 'Not provided',
                rating: 0,
                completedDeliveries: 0,
                status: driver.isActive ? 'active' : 'inactive',
                onlineStatus: 'offline',
                currentLocation: null
              };
            }
          }));
          
          setDrivers(formattedDrivers);
          setFilteredDrivers(formattedDrivers);
          
          // Count active drivers
          const activeDriversCount = formattedDrivers.filter(d => 
            d.status === 'active' && d.onlineStatus === 'online'
          ).length;
          
          // Update analytics with real driver count
          setAnalytics(prev => ({
            ...prev,
            activeDrivers: activeDriversCount
          }));
        }
        
        // 2. Get active orders (on the way or ready for pickup)
        const readyOrdersResponse = await fetch('http://localhost:5001/api/orders/ready-for-pickup');
        if (readyOrdersResponse.ok) {
          const readyOrdersData = await readyOrdersResponse.json();
          if (readyOrdersData.success) {
            setActiveOrders(readyOrdersData.orders || []);
            
            // Set the analytics data based on these orders
            let deliveryTimes = [];
            
            readyOrdersData.orders.forEach(order => {
              if (order.statusTimestamps && order.statusTimestamps.Delivered && order.placedAt) {
                const placedTime = new Date(order.placedAt);
                const deliveredTime = new Date(order.statusTimestamps.Delivered);
                const minutesDiff = (deliveredTime - placedTime) / (1000 * 60);
                if (minutesDiff > 0) {
                  deliveryTimes.push(minutesDiff);
                }
              }
            });
            
            // Calculate average delivery time
            const avgTime = deliveryTimes.length > 0 
              ? deliveryTimes.reduce((sum, time) => sum + time, 0) / deliveryTimes.length
              : 0;
            
            // Calculate deliveries in the last week
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            
            const lastWeekDeliveries = readyOrdersData.orders.filter(order => 
              order.placedAt && new Date(order.placedAt) >= oneWeekAgo
            ).length;
            
            setAnalytics(prev => ({
              ...prev,
              totalDeliveries: readyOrdersData.orders.length,
              averageDeliveryTime: Math.round(avgTime),
              deliveriesLastWeek: lastWeekDeliveries
            }));
          }
        }
        
      } catch (error) {
        console.error('Error fetching delivery management data:', error);
        toast.error('Failed to load delivery management data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    // Set up refresh interval (every 60 seconds)
    const intervalId = setInterval(() => {
      fetchData();
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Filter drivers based on search term and status
  useEffect(() => {
    let results = drivers;
    
    if (searchTerm.trim()) {
      const lowercasedSearch = searchTerm.toLowerCase();
      results = results.filter(driver => 
        driver.name.toLowerCase().includes(lowercasedSearch) ||
        driver.email.toLowerCase().includes(lowercasedSearch) ||
        driver.phone.toLowerCase().includes(lowercasedSearch) ||
        (driver.licensePlate && driver.licensePlate.toLowerCase().includes(lowercasedSearch))
      );
    }
    
    if (filterStatus !== 'all') {
      results = results.filter(driver => driver.status === filterStatus);
    }
    
    setFilteredDrivers(results);
  }, [searchTerm, filterStatus, drivers]);
  
  // Load detailed driver statistics when viewing details
  useEffect(() => {
    const loadDriverStats = async () => {
      if (selectedDriver) {
        try {
          // Get driver's delivery history
          const historyResponse = await fetch(`http://localhost:5001/api/orders/driver/${selectedDriver.id}/history`);
          const historyData = await historyResponse.json();
          
          // Get driver's statistics
          const statsResponse = await fetch(`http://localhost:5001/api/orders/driver/${selectedDriver.id}/stats`);
          const statsData = await statsResponse.json();
          
          if (historyData.success && statsData.success) {
            setDriverStats({
              orders: historyData.orders || [],
              activeOrders: historyData.ordersByStatus?.active || [],
              completedOrders: historyData.ordersByStatus?.completed || [],
              cancelledOrders: historyData.ordersByStatus?.cancelled || [],
              stats: statsData.stats
            });
          }
        } catch (error) {
          console.error('Error loading driver details:', error);
          toast.error('Failed to load driver statistics');
        }
      }
    };
    
    if (isViewingDriverDetails && selectedDriver) {
      loadDriverStats();
    }
  }, [isViewingDriverDetails, selectedDriver]);
  
  const handleAddDriver = async (e) => {
    e.preventDefault();
    
    try {
      // Create driver account via user service
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: driverForm.name,
          email: driverForm.email,
          password: 'Temp123!', // Temporary password that driver should change
          phoneNo: driverForm.phone,
          vehicleType: driverForm.vehicleType,
          licensePlate: driverForm.licensePlate,
          isActive: driverForm.status === 'active',
          role: 'delivery_person'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Driver account created successfully');
        
        // Add to local state
        const newDriver = {
          id: data.user._id,
          name: driverForm.name,
          email: driverForm.email,
          phone: driverForm.phone,
          vehicleType: driverForm.vehicleType,
          licensePlate: driverForm.licensePlate,
          rating: 0,
          completedDeliveries: 0,
          status: driverForm.status,
          onlineStatus: 'offline',
          currentLocation: null
        };
        
        setDrivers([...drivers, newDriver]);
        setFilteredDrivers([...filteredDrivers, newDriver]);
        setIsAddingDriver(false);
        setDriverForm({
          name: '',
          email: '',
          phone: '',
          vehicleType: 'Car',
          licensePlate: '',
          status: 'active'
        });
      } else {
        toast.error(data.message || 'Failed to create driver account');
      }
    } catch (error) {
      console.error('Error adding driver:', error);
      toast.error('Failed to add driver. Please try again.');
    }
  };
  
  const toggleDriverStatus = async (driverId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      // Update user active status
      const response = await fetch(`http://localhost:5000/api/users/${driverId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isActive: newStatus === 'active'
        })
      });
      
      if (response.ok) {
        const updatedDrivers = drivers.map(driver => {
          if (driver.id === driverId) {
            return { ...driver, status: newStatus };
          }
          return driver;
        });
        
        setDrivers(updatedDrivers);
        setFilteredDrivers(
          filteredDrivers.map(driver => {
            if (driver.id === driverId) {
              return { ...driver, status: newStatus };
            }
            return driver;
          })
        );
        
        toast.success(`Driver ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      } else {
        toast.error('Failed to update driver status');
      }
    } catch (error) {
      console.error('Error updating driver status:', error);
      toast.error('Failed to update driver status');
    }
  };
  
  const viewDriverDetails = (driver) => {
    setSelectedDriver(driver);
    setIsViewingDriverDetails(true);
    
    // If driver has a current location, center map on it
    if (driver.currentLocation?.latitude && driver.currentLocation?.longitude) {
      setMapCenter([
        parseFloat(driver.currentLocation.latitude), 
        parseFloat(driver.currentLocation.longitude)
      ]);
      setMapZoom(14);
    }
  };
  
  const getStatusLabel = (status) => {
    switch (status) {
      case 'Delivered':
      case 'Completed':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
            {status}
          </span>
        );
      case 'On the way':
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            On the way
          </span>
        );
      case 'Ready for Pickup':
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
            Ready for Pickup
          </span>
        );
      case 'Cancelled':
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
            {status}
          </span>
        );
    }
  };
  
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const calculateDeliveryTime = (order) => {
    if (order.statusTimestamps?.Delivered && order.placedAt) {
      const placedTime = new Date(order.placedAt);
      const deliveredTime = new Date(order.statusTimestamps.Delivered);
      const minutesDiff = Math.round((deliveredTime - placedTime) / (1000 * 60));
      return `${minutesDiff} mins`;
    }
    return 'N/A';
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Toaster position="top-right" />
      <DashboardSidebar />
      
      <div className="flex-grow overflow-y-auto">
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <FaTruck className="mr-2 text-orange-500" /> Delivery Management
              </h1>
              <p className="text-gray-600">Manage drivers, track deliveries, and monitor performance</p>
            </div>
            
            {activeTab === 'drivers' && (
              <button
                onClick={() => setIsAddingDriver(true)}
                className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
              >
                <FaUserPlus className="mr-2" /> Add New Driver
              </button>
            )}
          </div>
          
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-600 text-sm">Active Drivers</h3>
                <FaMotorcycle className="text-orange-500" />
              </div>
              <div className="flex items-end">
                <span className="text-3xl font-bold text-gray-800">{analytics.activeDrivers}</span>
                <span className="text-sm text-gray-500 ml-2 mb-1">drivers</span>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-600 text-sm">Total Deliveries</h3>
                <FaCheckCircle className="text-green-500" />
              </div>
              <div className="flex items-end">
                <span className="text-3xl font-bold text-gray-800">{analytics.totalDeliveries}</span>
                <span className="text-sm text-gray-500 ml-2 mb-1">completed</span>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-600 text-sm">Average Delivery Time</h3>
                <FaClock className="text-blue-500" />
              </div>
              <div className="flex items-end">
                <span className="text-3xl font-bold text-gray-800">{analytics.averageDeliveryTime}</span>
                <span className="text-sm text-gray-500 ml-2 mb-1">minutes</span>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-600 text-sm">This Week</h3>
                <FaChartBar className="text-purple-500" />
              </div>
              <div className="flex items-end">
                <span className="text-3xl font-bold text-gray-800">{analytics.deliveriesLastWeek}</span>
                <span className="text-sm text-gray-500 ml-2 mb-1">deliveries</span>
              </div>
            </motion.div>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b mb-6">
            <button
              onClick={() => setActiveTab('drivers')}
              className={`px-4 py-2 ${activeTab === 'drivers' 
                ? 'border-b-2 border-orange-500 text-orange-600' 
                : 'text-gray-600'}`}
            >
              <span className="flex items-center">
                <FaUsers className="mr-2" /> Delivery Drivers
              </span>
            </button>
            <button
              onClick={() => setActiveTab('tracking')}
              className={`px-4 py-2 ${activeTab === 'tracking' 
                ? 'border-b-2 border-orange-500 text-orange-600' 
                : 'text-gray-600'}`}
            >
              <span className="flex items-center">
                <FaMapMarkedAlt className="mr-2" /> Live Tracking
              </span>
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 ${activeTab === 'active' 
                ? 'border-b-2 border-orange-500 text-orange-600' 
                : 'text-gray-600'}`}
            >
              <span className="flex items-center">
                <FaRoute className="mr-2" /> Active Deliveries
              </span>
            </button>
          </div>
          
          {/* Drivers Tab */}
          {activeTab === 'drivers' && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex flex-col md:flex-row justify-between mb-4 items-start md:items-center gap-4">
                <div className="relative w-full md:w-64">
                  <input
                    type="text"
                    placeholder="Search drivers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-3 py-1 rounded-md ${
                      filterStatus === 'all'
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterStatus('active')}
                    className={`px-3 py-1 rounded-md ${
                      filterStatus === 'active'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setFilterStatus('inactive')}
                    className={`px-3 py-1 rounded-md ${
                      filterStatus === 'inactive'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    Inactive
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Driver
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vehicle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rating
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
                            <p className="text-gray-500">Loading drivers...</p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredDrivers.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <FaExclamationCircle className="text-gray-400 text-5xl mb-4" />
                            <p className="text-gray-500">No drivers found</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredDrivers.map(driver => (
                        <tr key={driver.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                                <span className="font-semibold text-orange-600">{driver.name.charAt(0)}</span>
                              </div>
                              <div className="ml-4">
                                <div className="font-medium text-gray-900">{driver.name}</div>
                                <div className="text-sm text-gray-500">{driver.email}</div>
                                <div className="text-xs text-gray-500">{driver.phone}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="flex items-center">
                                {driver.vehicleType === 'Car' && <FaCarSide className="text-gray-600 mr-2" />}
                                {driver.vehicleType === 'Motorcycle' && <FaMotorcycle className="text-gray-600 mr-2" />}
                                {driver.vehicleType === 'Bicycle' && <FaBicycle className="text-gray-600 mr-2" />}
                                <span className="text-gray-900">{driver.vehicleType}</span>
                              </div>
                              <div className="text-sm text-gray-500">{driver.licensePlate}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex items-center mr-2">
                                <FaStar className="text-yellow-400" />
                                <span className="ml-1 text-gray-900">{driver.rating ? driver.rating.toFixed(1) : 'N/A'}</span>
                              </div>
                              <span className="text-xs text-gray-500">
                                ({driver.completedDeliveries} deliveries)
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                driver.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {driver.status === 'active' ? 'Active' : 'Inactive'}
                              </span>
                              <div className="mt-1 flex items-center text-xs">
                                <span className={`w-2 h-2 rounded-full mr-1 ${
                                  driver.onlineStatus === 'online' ? 'bg-green-500' : 'bg-gray-400'
                                }`}></span>
                                <span className="text-gray-500">
                                  {driver.onlineStatus === 'online' ? 'Online' : 'Offline'}
                                </span>
                              </div>
                              {driver.currentOrder && (
                                <div className="mt-1 text-xs text-blue-600">
                                  On delivery: Order #{driver.currentOrder.orderId}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => viewDriverDetails(driver)}
                                className="text-indigo-600 hover:text-indigo-800"
                              >
                                <FaEye />
                              </button>
                              <button 
                                onClick={() => toggleDriverStatus(driver.id, driver.status)}
                                className={`${
                                  driver.status === 'active' 
                                    ? 'text-red-600 hover:text-red-800' 
                                    : 'text-green-600 hover:text-green-800'
                                }`}
                                title={driver.status === 'active' ? 'Deactivate driver' : 'Activate driver'}
                              >
                                {driver.status === 'active' ? (
                                  <FaTimes />
                                ) : (
                                  <FaCheckCircle />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Live Tracking Tab */}
          {activeTab === 'tracking' && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <FaMapMarkedAlt className="mr-2 text-orange-500" /> Live Delivery Tracking
              </h2>
              
              <div className="h-[500px] rounded-md overflow-hidden border border-gray-200">
                <MapContainer
                  center={mapCenter}
                  zoom={mapZoom}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  
                  {/* Plot active drivers */}
                  {drivers
                    .filter(driver => driver.currentLocation?.latitude && driver.currentLocation?.longitude)
                    .map(driver => (
                      <Marker
                        key={driver.id}
                        position={[
                          parseFloat(driver.currentLocation.latitude),
                          parseFloat(driver.currentLocation.longitude)
                        ]}
                        icon={DriverIcon}
                      >
                        <Popup>
                          <div className="p-1">
                            <p className="font-medium">{driver.name}</p>
                            <p className="text-sm text-gray-600">{driver.vehicleType} • {driver.licensePlate}</p>
                            {driver.currentOrder && (
                              <>
                                <p className="text-xs mt-1 text-blue-600">Currently delivering:</p>
                                <p className="text-xs">Order #{driver.currentOrder.orderId}</p>
                              </>
                            )}
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  
                  {/* Plot active delivery orders */}
                  {activeOrders
                    .filter(order => order.orderStatus === 'On the way' && order.driverCurrentLocation)
                    .map(order => (
                      <React.Fragment key={order._id}>
                        {/* Restaurant location if available */}
                        {order.restaurantLocation && (
                          <Marker
                            position={[
                              parseFloat(order.restaurantLocation.latitude),
                              parseFloat(order.restaurantLocation.longitude)
                            ]}
                            icon={RestaurantIcon}
                          >
                            <Popup>
                              <div className="p-1">
                                <p className="font-medium">{order.restaurantName}</p>
                                <p className="text-xs">Order #{order.orderId}</p>
                              </div>
                            </Popup>
                          </Marker>
                        )}
                        
                        {/* Customer delivery location */}
                        {order.customerCoordinates && (
                          <Marker
                            position={[
                              parseFloat(order.customerCoordinates.latitude),
                              parseFloat(order.customerCoordinates.longitude)
                            ]}
                            icon={CustomerIcon}
                          >
                            <Popup>
                              <div className="p-1">
                                <p className="font-medium">Delivery to: {order.customer.name}</p>
                                <p className="text-xs">{order.customer.address}</p>
                                <p className="text-xs mt-1">Order #{order.orderId}</p>
                              </div>
                            </Popup>
                          </Marker>
                        )}
                      </React.Fragment>
                    ))}
                </MapContainer>
              </div>
              
              <div className="mt-4">
                <h3 className="font-medium mb-2">Active Deliveries</h3>
                <div className="space-y-2">
                  {activeOrders
                    .filter(order => ['On the way', 'Ready for Pickup'].includes(order.orderStatus))
                    .slice(0, 5)
                    .map(order => (
                      <div 
                        key={order._id} 
                        className="p-3 bg-gray-50 rounded-md flex justify-between items-center"
                      >
                        <div>
                          <div className="flex items-center">
                            <span className="font-medium">Order #{order.orderId}</span>
                            <span className="ml-2">{getStatusLabel(order.orderStatus)}</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {order.diliveryDriverId ? (
                              <>Driver: {order.driverInfo?.name || 'Assigned'}</>
                            ) : (
                              <>No driver assigned</>
                            )}
                          </p>
                        </div>
                        <Link
                          to={`/admin/orders/${order.orderId}`}
                          className="text-orange-500 hover:text-orange-700"
                        >
                          View
                        </Link>
                      </div>
                    ))}
                  
                  {activeOrders.filter(order => 
                    ['On the way', 'Ready for Pickup'].includes(order.orderStatus)
                  ).length === 0 && (
                    <p className="text-gray-500 text-center py-4">No active deliveries at the moment</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Active Deliveries Tab */}
          {activeTab === 'active' && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Active Deliveries</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Restaurant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Driver
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
                            <p className="text-gray-500">Loading deliveries...</p>
                          </div>
                        </td>
                      </tr>
                    ) : activeOrders.filter(order => 
                      ['On the way', 'Ready for Pickup'].includes(order.orderStatus)
                    ).length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <FaExclamationCircle className="text-gray-400 text-5xl mb-4" />
                            <p className="text-gray-500">No active deliveries found</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      activeOrders
                        .filter(order => ['On the way', 'Ready for Pickup'].includes(order.orderStatus))
                        .map(order => (
                          <tr key={order._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">#{order.orderId}</div>
                              <div className="text-xs text-gray-500">{formatDateTime(order.placedAt)}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{order.restaurantName}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{order.customer.name}</div>
                              <div className="text-xs text-gray-500">{order.customer.phone}</div>
                            </td>
                            <td className="px-6 py-4">
                              {order.diliveryDriverId ? (
                                <div>
                                  <div className="text-sm text-gray-900">{order.driverInfo?.name || 'Assigned'}</div>
                                  {order.driverInfo?.phone && (
                                    <div className="text-xs text-gray-500">{order.driverInfo.phone}</div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-sm text-gray-500">Not assigned</div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {getStatusLabel(order.orderStatus)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Link
                                to={`/admin/orders/${order.orderId}`}
                                className="text-indigo-600 hover:text-indigo-800 mr-3"
                              >
                                View
                              </Link>
                              {!order.diliveryDriverId && order.orderStatus === 'Ready for Pickup' && (
                                <button
                                  className="text-orange-500 hover:text-orange-700"
                                >
                                  Assign Driver
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Driver Details Sidebar */}
      {isViewingDriverDetails && selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-40">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="bg-white w-full md:max-w-md h-full overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Driver Details</h2>
                <button
                  onClick={() => setIsViewingDriverDetails(false)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="mb-6 flex items-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-2xl font-bold text-orange-500">{selectedDriver.name.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold">{selectedDriver.name}</h3>
                  <p className="text-gray-600">{selectedDriver.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm text-gray-500 mb-1">Status</h4>
                  <div className={`font-medium ${selectedDriver.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedDriver.status === 'active' ? 'Active' : 'Inactive'}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm text-gray-500 mb-1">Rating</h4>
                  <div className="flex items-center font-medium">
                    <FaStar className="text-yellow-400 mr-1" />
                    {selectedDriver.rating ? selectedDriver.rating.toFixed(1) : 'N/A'}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm text-gray-500 mb-1">Phone</h4>
                  <div className="font-medium">
                    {selectedDriver.phone || 'Not provided'}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm text-gray-500 mb-1">Vehicle</h4>
                  <div className="font-medium">
                    {selectedDriver.vehicleType} • {selectedDriver.licensePlate || 'No plate'}
                  </div>
                </div>
              </div>
              
              {/* Performance Stats */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-700 mb-2">Delivery Performance</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-blue-50 p-3 rounded-md text-center">
                    <div className="text-xl font-bold text-blue-600">
                      {driverStats.stats?.total || selectedDriver.completedDeliveries || 0}
                    </div>
                    <div className="text-xs text-gray-500">Total</div>
                  </div>
                  
                  <div className="bg-green-50 p-3 rounded-md text-center">
                    <div className="text-xl font-bold text-green-600">
                      {driverStats.stats?.completed || 0}
                    </div>
                    <div className="text-xs text-gray-500">Completed</div>
                  </div>
                  
                  <div className="bg-red-50 p-3 rounded-md text-center">
                    <div className="text-xl font-bold text-red-600">
                      {driverStats.stats?.cancelled || 0}
                    </div>
                    <div className="text-xs text-gray-500">Cancelled</div>
                  </div>
                </div>
                
                {/* Completion Rate */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Completion Rate</span>
                    <span>
                      {driverStats.stats?.total > 0 ? 
                        Math.round((driverStats.stats.completed / driverStats.stats.total) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ 
                        width: `${driverStats.stats?.total > 0 ? 
                          Math.round((driverStats.stats.completed / driverStats.stats.total) * 100) : 0}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Current Order */}
              {selectedDriver.currentOrder && (
                <div className="mb-6">
                  <h3 className="font-bold text-gray-700 mb-2">Current Delivery</h3>
                  <div className="bg-blue-50 p-4 rounded-md">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">Order #{selectedDriver.currentOrder.orderId}</div>
                        <div className="text-sm text-gray-600">{selectedDriver.currentOrder.restaurantName}</div>
                      </div>
                      {getStatusLabel(selectedDriver.currentOrder.orderStatus)}
                    </div>
                    
                    <div className="text-sm mb-2">
                      <div><strong>Customer:</strong> {selectedDriver.currentOrder.customer.name}</div>
                      <div><strong>Address:</strong> {selectedDriver.currentOrder.customer.address}</div>
                    </div>
                    
                    <Link
                      to={`/admin/orders/${selectedDriver.currentOrder.orderId}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View Order Details
                    </Link>
                  </div>
                </div>
              )}
              
              {/* Recent Deliveries */}
              <div>
                <h3 className="font-bold text-gray-700 mb-2">Recent Deliveries</h3>
                <div className="space-y-3">
                  {isLoading ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                    </div>
                  ) : driverStats.orders && driverStats.orders.length > 0 ? (
                    driverStats.orders.slice(0, 5).map(order => (
                      <div key={order._id} className="p-3 bg-gray-50 rounded-md">
                        <div className="flex justify-between">
                          <div>
                            <div className="font-medium">Order #{order.orderId}</div>
                            <div className="text-xs text-gray-500">{formatDateTime(order.placedAt)}</div>
                          </div>
                          {getStatusLabel(order.orderStatus)}
                        </div>
                        
                        <div className="flex justify-between mt-2 text-xs text-gray-600">
                          <div>{order.restaurantName}</div>
                          <div>{calculateDeliveryTime(order)}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">No delivery history found</p>
                  )}
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to ${selectedDriver.status === 'active' ? 'deactivate' : 'activate'} this driver?`)) {
                      toggleDriverStatus(selectedDriver.id, selectedDriver.status);
                      setIsViewingDriverDetails(false);
                    }
                  }}
                  className={`w-full py-2 rounded-md ${
                    selectedDriver.status === 'active' 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {selectedDriver.status === 'active' ? 'Deactivate Driver' : 'Activate Driver'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Add Driver Modal */}
      {isAddingDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Add New Driver</h2>
              <button 
                onClick={() => setIsAddingDriver(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleAddDriver} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={driverForm.name}
                  onChange={(e) => setDriverForm({...driverForm, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={driverForm.email}
                  onChange={(e) => setDriverForm({...driverForm, email: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  required
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={driverForm.phone}
                  onChange={(e) => setDriverForm({...driverForm, phone: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Type
                </label>
                <select
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={driverForm.vehicleType}
                  onChange={(e) => setDriverForm({...driverForm, vehicleType: e.target.value})}
                >
                  <option value="Car">Car</option>
                  <option value="Motorcycle">Motorcycle</option>
                  <option value="Bicycle">Bicycle</option>
                  <option value="Van">Van</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  License Plate
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={driverForm.licensePlate}
                  onChange={(e) => setDriverForm({...driverForm, licensePlate: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={driverForm.status}
                  onChange={(e) => setDriverForm({...driverForm, status: e.target.value})}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddingDriver(false)}
                  className="px-4 py-2 border text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                >
                  Add Driver
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default DeliveryManagement;