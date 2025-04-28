import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import io from 'socket.io-client';

const DeliveryTracker = ({ deliveryId }) => {
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');

  // For debugging
  const BACKEND_URL = 'http://localhost:5002';

  // Connect to socket.io on component mount
  useEffect(() => {
    try {
      console.log('Connecting to socket service...');
      // Replace with your actual service URL
      const newSocket = io(BACKEND_URL, {
        reconnectionAttempts: 3,
        timeout: 10000,
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('Socket connected successfully');
        setConnectionStatus('Connected');
        setSocket(newSocket);
      });

      newSocket.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
        setConnectionStatus(`Connection error: ${err.message}`);
        setError(`Failed to connect to service: ${err.message}`);
      });

      return () => {
        console.log('Disconnecting socket');
        newSocket.disconnect();
      };
    } catch (err) {
      console.error('Error setting up socket:', err);
      setConnectionStatus(`Setup error: ${err.message}`);
      setError(`Failed to initialize connection: ${err.message}`);
    }
  }, []);

  // Start tracking the delivery once socket is connected
  useEffect(() => {
    if (!socket || !deliveryId) return;

    console.log(`Tracking delivery: ${deliveryId}`);
    
    // Join the delivery room to get updates
    socket.emit('track-delivery', deliveryId);

    // Listen for location updates
    socket.on('location-update', (data) => {
      console.log('Received location update:', data);
      if (data.deliveryId === deliveryId && data.driverLocation?.coordinates) {
        setDriverLocation({
          lat: data.driverLocation.coordinates[1],
          lng: data.driverLocation.coordinates[0]
        });
      }
    });

    // Listen for status updates
    socket.on('status-update', (data) => {
      console.log('Received status update:', data);
      if (data.deliveryId === deliveryId) {
        setDeliveryInfo(prevInfo => ({
          ...prevInfo,
          status: data.status
        }));
        
        if (data.driverLocation?.coordinates) {
          setDriverLocation({
            lat: data.driverLocation.coordinates[1],
            lng: data.driverLocation.coordinates[0]
          });
        }
      }
    });

    // Fetch initial delivery information
    const fetchDeliveryInfo = async () => {
      try {
        setLoading(true);
        console.log(`Fetching delivery info for: ${deliveryId}`);
        
        // Add proper error handling for the fetch request
        const response = await axios.get(`${BACKEND_URL}/api/deliveries/${deliveryId}`)
          .catch(err => {
            console.error('Error fetching delivery data:', err.response || err);
            throw new Error(err.response?.data?.error || err.message || 'Failed to fetch delivery data');
          });
          
        console.log('Received delivery data:', response.data);
        
        // Log full structure for debugging
        console.log('Full delivery structure:', JSON.stringify(response.data, null, 2));
        
        setDeliveryInfo(response.data);
        
        // Set initial driver location if available
        if (response.data.driverLocation?.coordinates) {
          setDriverLocation({
            lat: response.data.driverLocation.coordinates[1],
            lng: response.data.driverLocation.coordinates[0]
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching delivery:', err);
        setError(`Failed to load delivery information: ${err.message}`);
        setLoading(false);
      }
    };

    fetchDeliveryInfo();

    // Cleanup listener on unmount
    return () => {
      console.log('Removing socket listeners');
      socket.off('location-update');
      socket.off('status-update');
    };
  }, [socket, deliveryId]);

  // Update directions when driver location changes
  useEffect(() => {
    if (!deliveryInfo || !driverLocation) return;
    
    // Check if customer location coordinates exist and have the right format
    if (!deliveryInfo.customerLocation?.coordinates || 
        !Array.isArray(deliveryInfo.customerLocation.coordinates) ||
        deliveryInfo.customerLocation.coordinates.length < 2) {
      console.error('Invalid customer location format:', deliveryInfo.customerLocation);
      return;
    }
    
    const customerLocation = {
      lat: deliveryInfo.customerLocation.coordinates[1],
      lng: deliveryInfo.customerLocation.coordinates[0]
    };

    // Request directions
    const directionsCallback = (result, status) => {
      if (status === 'OK') {
        console.log('Directions retrieved successfully');
        setDirections(result);
      } else {
        console.error(`Directions request failed: ${status}`);
      }
    };
    
    // This will be used by the DirectionsService component
    window.directionsCallback = directionsCallback;
  }, [driverLocation, deliveryInfo]);

  // Handle rating submission
  const handleRating = async (value) => {
    setRating(value);
    
    try {
      console.log(`Submitting rating: ${value}`);
      await axios.post(`${BACKEND_URL}/api/deliveries/${deliveryId}/rate`, {
        rating: value
      });
      
      // Update the delivery info to reflect the rating
      setDeliveryInfo(prevInfo => ({
        ...prevInfo,
        rating: value
      }));
    } catch (err) {
      console.error('Error submitting rating:', err);
    }
  };

  // Helper functions
  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'Waiting for driver',
      'driver_assigned': 'Driver on the way to restaurant',
      'picked_up': 'Food picked up',
      'in_transit': 'On the way to you',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
  };

  const getEstimatedDelivery = () => {
    if (!deliveryInfo || !deliveryInfo.estimatedDeliveryTime) return 'Calculating...';
    
    const eta = new Date(deliveryInfo.estimatedDeliveryTime);
    return eta.toLocaleTimeString();
  };

  const getStatusIcon = (status) => {
    const iconMap = {
      'pending': '🕒',
      'driver_assigned': '🚗',
      'picked_up': '🍔',
      'in_transit': '🚚',
      'delivered': '✅',
      'cancelled': '❌'
    };
    return iconMap[status] || '🔄';
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-gray-600">Loading delivery information...</p>
        <p className="text-sm text-gray-500 mt-2">Socket status: {connectionStatus}</p>
        <p className="text-sm text-gray-500 mt-1">Delivery ID: {deliveryId || 'Not provided'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
        <p className="mt-2 text-sm">
          Please check if:
          <ul className="list-disc ml-5 mt-1">
            <li>Your server is running at port 5002</li>
            <li>The delivery ID "{deliveryId}" is valid</li>
            <li>You have installed all required packages</li>
            <li>Your MongoDB is properly connected and has the delivery record</li>
          </ul>
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-3 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!deliveryInfo) {
    return (
      <div className="text-gray-600 text-center py-8">
        <p className="text-xl">No delivery information available</p>
        <p className="text-sm mt-2">Socket status: {connectionStatus}</p>
        <p className="text-sm mt-1">Delivery ID: {deliveryId || 'Not provided'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 px-6">
        <h2 className="text-2xl font-bold">Track Your Delivery</h2>
        <div className="flex justify-between items-center">
          <p className="text-xs text-white opacity-80">ID: {deliveryId}</p>
          <p className="text-xs text-white opacity-80">Order: {deliveryInfo.orderId || 'N/A'}</p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4 p-6 bg-gray-50">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-2">{getStatusIcon(deliveryInfo.status)}</span>
            <h3 className="text-xl font-semibold">
              {getStatusText(deliveryInfo.status)}
            </h3>
          </div>
          <p className="text-gray-600">
            <span className="font-medium">Estimated arrival:</span> {getEstimatedDelivery()}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            <span className="font-medium">Restaurant:</span> {deliveryInfo.restaurantId || 'N/A'}
          </p>
        </div>
        
        {deliveryInfo.driverId && (
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Your Driver</h3>
            <div className="flex items-center">
              <div className="bg-gray-200 rounded-full w-12 h-12 flex items-center justify-center text-xl mr-3">
                {deliveryInfo.driverId.name ? deliveryInfo.driverId.name.charAt(0) : '?'}
              </div>
              <div>
                <p className="font-medium">{deliveryInfo.driverId.name || 'Unknown'}</p>
                <p className="text-gray-600 text-sm">{deliveryInfo.driverId.phone || 'No phone'}</p>
                <p className="text-sm">
                  <span className="text-amber-500">★</span> 
                  {deliveryInfo.driverId?.averageRating ? deliveryInfo.driverId.averageRating.toFixed(1) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {!deliveryInfo.driverId && deliveryInfo.status === 'delivered' && (
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Delivery Complete</h3>
            <p className="text-gray-600">
              Your order was delivered successfully.
            </p>
          </div>
        )}
      </div>
      
      {(driverLocation || (deliveryInfo.customerLocation?.coordinates && deliveryInfo.restaurantLocation?.coordinates)) && (
        <div className="p-4">
          <div className="rounded-lg overflow-hidden shadow-md">
            <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '400px' }}
                center={driverLocation || {
                  lat: deliveryInfo.customerLocation.coordinates[1],
                  lng: deliveryInfo.customerLocation.coordinates[0]
                }}
                zoom={15}
                options={{ disableDefaultUI: true, zoomControl: true }}
              >
                {/* Driver marker */}
                {driverLocation && (
                  <Marker
                    position={driverLocation}
                    icon={{
                      url: '/delivery-icon.png',
                      scaledSize: { width: 40, height: 40 }
                    }}
                  />
                )}
                
                {/* Customer marker */}
                {deliveryInfo.customerLocation?.coordinates && deliveryInfo.customerLocation.coordinates.length >= 2 && (
                  <Marker
                    position={{
                      lat: deliveryInfo.customerLocation.coordinates[1],
                      lng: deliveryInfo.customerLocation.coordinates[0]
                    }}
                    icon={{
                      url: '/home-icon.png',
                      scaledSize: { width: 40, height: 40 }
                    }}
                  />
                )}
                
                {/* Restaurant marker */}
                {deliveryInfo.status !== 'delivered' && 
                 deliveryInfo.restaurantLocation?.coordinates && 
                 deliveryInfo.restaurantLocation.coordinates.length >= 2 && (
                  <Marker
                    position={{
                      lat: deliveryInfo.restaurantLocation.coordinates[1],
                      lng: deliveryInfo.restaurantLocation.coordinates[0]
                    }}
                    icon={{
                      url: '/restaurant-icon.png',
                      scaledSize: { width: 40, height: 40 }
                    }}
                  />
                )}
                
                {/* Direction path */}
                {!directions && driverLocation && 
                 deliveryInfo.customerLocation?.coordinates && 
                 deliveryInfo.customerLocation.coordinates.length >= 2 && (
                  <DirectionsService
                    options={{
                      destination: {
                        lat: deliveryInfo.customerLocation.coordinates[1],
                        lng: deliveryInfo.customerLocation.coordinates[0]
                      },
                      origin: driverLocation,
                      travelMode: 'DRIVING'
                    }}
                    callback={window.directionsCallback}
                  />
                )}
                
                {directions && (
                  <DirectionsRenderer
                    options={{
                      directions: directions,
                      suppressMarkers: true // We're using custom markers
                    }}
                  />
                )}
              </GoogleMap>
            </LoadScript>
          </div>
          
          <div className="flex justify-between mt-4 text-sm text-gray-600 px-2">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span>Your location</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
              <span>Driver</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span>Restaurant</span>
            </div>
          </div>
        </div>
      )}
      
      {deliveryInfo.status === 'delivered' && !deliveryInfo.rating && (
        <div className="p-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold mb-3">Rate Your Delivery</h3>
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map(star => (
              <button 
                key={star}
                className="text-3xl focus:outline-none"
                onClick={() => handleRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
              >
                <span className={`${
                  (hoveredRating || rating) >= star 
                    ? 'text-amber-500' 
                    : 'text-gray-300'
                }`}>
                  ★
                </span>
              </button>
            ))}
          </div>
          <button 
            className={`mt-4 px-4 py-2 rounded ${
              rating > 0 
                ? 'bg-orange-500 text-white hover:bg-orange-600' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
            disabled={rating === 0}
            onClick={() => {
              if (rating > 0) {
                handleRating(rating);
              }
            }}
          >
            Submit Feedback
          </button>
        </div>
      )}
      
      {deliveryInfo.rating && (
        <div className="p-6 border-t border-gray-200 bg-green-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Your Rating</h3>
            <div className="flex">
              {[1, 2, 3, 4, 5].map(star => (
                <span key={star} className={`text-2xl ${star <= deliveryInfo.rating ? 'text-amber-500' : 'text-gray-300'}`}>
                  ★
                </span>
              ))}
            </div>
          </div>
          <p className="text-gray-600 mt-2">Thank you for your feedback!</p>
        </div>
      )}
    </div>
  );
};

export default DeliveryTracker;