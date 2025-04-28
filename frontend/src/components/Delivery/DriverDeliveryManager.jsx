import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { toast, Toaster } from 'react-hot-toast';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import socketService from '../../services/socketService';
import axios from 'axios';

// Define icons for the map
const driverIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const restaurantIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const customerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component that updates the map center when locations change
function MapCenterUpdater({ positions }) {
  const map = useMap();
  
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [positions, map]);
  
  return null;
}

const DriverDeliveryManager = () => {
  const { driverId, orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [restaurantPosition, setRestaurantPosition] = useState(null);
  const [customerPosition, setCustomerPosition] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const [error, setError] = useState(null);

  // Fetch order details and set up location tracking
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5001/api/orders/orders/${orderId}`);
        
        if (!response.data || !response.data.success) {
          throw new Error(response.data?.message || 'Failed to fetch order');
        }
        
        const orderData = response.data.order;
        setOrder(orderData);
        
        // Extract restaurant and customer positions if available
        if (orderData.restaurantLocation?.latitude && orderData.restaurantLocation?.longitude) {
          setRestaurantPosition([orderData.restaurantLocation.latitude, orderData.restaurantLocation.longitude]);
        }
        
        if (orderData.customer?.coordinates?.latitude && orderData.customer?.coordinates?.longitude) {
          setCustomerPosition([orderData.customer.coordinates.latitude, orderData.customer.coordinates.longitude]);
        }
        
        // If customer has address but no coordinates, we could use geocoding here
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details');
        setLoading(false);
      }
    };
    
    // Start tracking driver location
    const startLocationTracking = () => {
      if (!navigator.geolocation) {
        toast.error('Geolocation is not supported by your browser');
        return;
      }
      
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentPosition([latitude, longitude]);
          
          // Update location in backend
          updateDriverLocation(latitude, longitude);
        },
        (error) => {
          console.error('Error watching position:', error);
          toast.error('Failed to track your location');
        },
        {
          enableHighAccuracy: true,
          maximumAge: 30000,
          timeout: 27000
        }
      );
      
      setWatchId(id);
    };
    
    fetchOrderDetails();
    startLocationTracking();
    
    // Initialize socket connection
    const socket = socketService.getSocket();
    socketService.joinOrderRoom(orderId);
    
    // Listen for order status updates
    const unregisterStatusListener = socketService.registerOrderStatusListener((data) => {
      if (data.orderId === orderId) {
        setOrder(prev => ({ ...prev, orderStatus: data.status }));
        toast.success(`Order status updated to: ${data.status}`);
      }
    });
    
    return () => {
      // Clean up geolocation and socket listeners
      if (watchId) navigator.geolocation.clearWatch(watchId);
      unregisterStatusListener();
    };
  }, [orderId, driverId]);
  
  // Update driver location in backend
  const updateDriverLocation = async (latitude, longitude) => {
    try {
      await axios.put(`http://localhost:5001/api/orders/${orderId}/update-driver-location`, {
        driverLocation: { latitude, longitude }
      });
    } catch (err) {
      console.error('Error updating driver location:', err);
    }
  };
  
  // Update order status
  const updateOrderStatus = async (newStatus) => {
    try {
      await axios.put(`http://localhost:5001/api/orders/update-status/${orderId}`, {
        newStatus
      });
      
      setOrder(prev => ({ ...prev, orderStatus: newStatus }));
      toast.success(`Order status updated to: ${newStatus}`);
    } catch (err) {
      console.error('Error updating order status:', err);
      toast.error('Failed to update order status');
    }
  };
  
  const handlePickedUp = () => {
    updateOrderStatus('On the way');
  };
  
  const handleDelivered = () => {
    updateOrderStatus('Delivered');
    toast.success('Delivery completed!');
    setTimeout(() => {
      navigate('/DeliveryDashboard');
    }, 2000);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading delivery information...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/DeliveryDashboard')}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  const positions = [
    currentPosition, 
    restaurantPosition, 
    customerPosition
  ].filter(Boolean);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Delivery #{orderId}</h1>
          <button
            onClick={() => navigate('/DeliveryDashboard')}
            className="px-4 py-2 bg-white text-orange-500 rounded-md hover:bg-gray-100"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8 grid md:grid-cols-5 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Order Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Order Details</h2>
            {order && (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Restaurant:</span>
                    <span className="font-medium">{order.restaurantName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer:</span>
                    <span className="font-medium">{order.customer?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Address:</span>
                    <span className="font-medium">{order.customer?.address || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium">{order.orderStatus}</span>
                  </div>
                </div>
                
                <div className="mt-6 space-y-2">
                  <h3 className="text-md font-medium">Order Items</h3>
                  <ul className="divide-y divide-gray-200">
                    {order.items?.map((item, index) => (
                      <li key={index} className="py-2">
                        <div className="flex justify-between">
                          <span>
                            {item.quantity} x {item.name} ({item.size})
                          </span>
                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-between pt-4 font-bold">
                    <span>Total:</span>
                    <span>${order.totalAmount?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Update Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Update Status</h2>
            <div className="space-y-4">
              {order?.orderStatus === 'Ready for Pickup' && (
                <button
                  onClick={handlePickedUp}
                  className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Mark as Picked Up
                </button>
              )}
              
              {order?.orderStatus === 'On the way' && (
                <button
                  onClick={handleDelivered}
                  className="w-full py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Mark as Delivered
                </button>
              )}
              
              {order?.orderStatus === 'Delivered' && (
                <div className="text-center py-2 bg-gray-100 rounded-md text-gray-600">
                  Delivery completed
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Map */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow-md h-[600px] overflow-hidden">
            {positions.length > 0 ? (
              <MapContainer
                center={currentPosition || [0, 0]}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                <MapCenterUpdater positions={positions} />
                
                {currentPosition && (
                  <Marker position={currentPosition} icon={driverIcon}>
                    <Popup>Your current location</Popup>
                  </Marker>
                )}
                
                {restaurantPosition && (
                  <Marker position={restaurantPosition} icon={restaurantIcon}>
                    <Popup>Restaurant: {order?.restaurantName || 'Restaurant'}</Popup>
                  </Marker>
                )}
                
                {customerPosition && (
                  <Marker position={customerPosition} icon={customerIcon}>
                    <Popup>Customer: {order?.customer?.name || 'Customer'}</Popup>
                  </Marker>
                )}
              </MapContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">Loading map location data...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDeliveryManager;