import React, { useState, useEffect, useRef } from 'react';

const DriverDeliveryManager = ({ deliveryId, driverId }) => {
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [position, setPosition] = useState(null);
  const positionWatchId = useRef(null);

  // Fetch delivery information
  useEffect(() => {
    const fetchDelivery = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5002/api/deliveries/${deliveryId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch delivery data');
        }
        const data = await response.json();
        setDelivery(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load delivery information');
        setLoading(false);
        console.error('Error fetching delivery:', err);
      }
    };

    fetchDelivery();
  }, [deliveryId]);

  // Watch driver's position
  useEffect(() => {
    if ('geolocation' in navigator) {
      // Get initial position
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPosition([longitude, latitude]);
          
          // Update driver location on server
          updateDriverLocation([longitude, latitude]);
        },
        (err) => {
          console.error('Error getting location:', err);
          setError('Failed to get your location. Please enable location services.');
        }
      );
      
      // Watch position changes
      positionWatchId.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPosition([longitude, latitude]);
          
          // Update driver location on server
          updateDriverLocation([longitude, latitude]);
        },
        (err) => {
          console.error('Error watching position:', err);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 30000,
          timeout: 27000
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
    
    // Clean up
    return () => {
      if (positionWatchId.current) {
        navigator.geolocation.clearWatch(positionWatchId.current);
      }
    };
  }, [deliveryId]);

  // Update driver location on server
  const updateDriverLocation = async (coordinates) => {
    try {
      const response = await fetch(
        `http://localhost:5002/api/deliveries/${deliveryId}/driver-location`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ coordinates }),
        }
      );
      if (!response.ok) {
        throw new Error('Failed to update driver location');
      }
    } catch (err) {
      console.error('Error updating location:', err);
    }
  };

  // Update delivery status
  const updateDeliveryStatus = async (status) => {
    try {
      const response = await fetch(
        `http://localhost:5002/api/deliveries/${deliveryId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status, driverLocation: position }),
        }
      );
      if (!response.ok) {
        throw new Error('Failed to update delivery status');
      }
      const data = await response.json();
      setDelivery(data);
    } catch (err) {
      setError('Failed to update delivery status');
      console.error('Error updating status:', err);
    }
  };
  
  // Helper function to format coordinates
  const formatCoordinates = (coords) => {
    if (!coords || !coords.length) return "N/A";
    return `[${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}]`;
  };
  
  // Helper function to get status display
  const getStatusDisplay = (status) => {
    const statusMap = {
      'pending': { text: 'PENDING', color: 'bg-yellow-500' },
      'driver_assigned': { text: 'ASSIGNED', color: 'bg-blue-500' },
      'picked_up': { text: 'PICKED UP', color: 'bg-purple-500' },
      'in_transit': { text: 'IN TRANSIT', color: 'bg-indigo-500' },
      'delivered': { text: 'DELIVERED', color: 'bg-green-500' },
      'cancelled': { text: 'CANCELLED', color: 'bg-red-500' }
    };
    
    const statusInfo = statusMap[status] || { text: status.toUpperCase(), color: 'bg-gray-500' };
    
    return {
      text: statusInfo.text,
      color: statusInfo.color
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">{error}</div>;
  }

  if (!delivery) {
    return <div className="text-gray-600 text-center py-4">No delivery information available</div>;
  }

  // Determine which status buttons to show based on current status
  const getStatusButtons = () => {
    switch (delivery.status) {
      case 'driver_assigned':
        return (
          <button 
            onClick={() => updateDeliveryStatus('picked_up')}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
          >
            Picked Up Order
          </button>
        );
      case 'picked_up':
        return (
          <button 
            onClick={() => updateDeliveryStatus('in_transit')}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
          >
            Start Delivery
          </button>
        );
      case 'in_transit':
        return (
          <button 
            onClick={() => updateDeliveryStatus('delivered')}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
          >
            Complete Delivery
          </button>
        );
      case 'delivered':
        return (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative text-center">
            Delivery completed! Thank you.
          </div>
        );
      default:
        return null;
    }
  };

  const statusDisplay = getStatusDisplay(delivery.status);

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 px-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Delivery #{deliveryId}</h2>
          <div className={`${statusDisplay.color} px-3 py-1 rounded-full text-white text-sm font-medium`}>
            {statusDisplay.text}
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {/* GPS Status Section */}
        <div className="mb-6 bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">GPS Status</h3>
          {position ? (
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <p className="text-gray-700">
                Your GPS is active: {formatCoordinates(position)}
              </p>
            </div>
          ) : (
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <p className="text-gray-700">GPS inactive or loading...</p>
            </div>
          )}
        </div>
        
        {/* Locations Grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Pickup Location */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium">Pickup Location</h3>
            </div>
            <p className="text-gray-700 ml-10">Restaurant Coordinates:</p>
            <p className="font-mono text-sm bg-white p-2 rounded border border-gray-200 mt-1">
              {formatCoordinates(delivery.restaurantLocation?.coordinates)}
            </p>
          </div>
          
          {/* Delivery Location */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-2">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-lg font-medium">Delivery Location</h3>
            </div>
            <p className="text-gray-700 ml-10">Customer Coordinates:</p>
            <p className="font-mono text-sm bg-white p-2 rounded border border-gray-200 mt-1">
              {formatCoordinates(delivery.customerLocation?.coordinates)}
            </p>
          </div>
        </div>
        
        {/* Status Update Section */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Update Delivery Status</h3>
          
          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center">
              <div className={`w-6 h-6 rounded-full ${delivery.status !== 'pending' ? 'bg-green-500' : 'bg-gray-300'} text-white flex items-center justify-center text-xs`}>
                1
              </div>
              <div className={`flex-1 h-1 mx-2 ${delivery.status !== 'pending' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <div className={`w-6 h-6 rounded-full ${delivery.status === 'picked_up' || delivery.status === 'in_transit' || delivery.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'} text-white flex items-center justify-center text-xs`}>
                2
              </div>
              <div className={`flex-1 h-1 mx-2 ${delivery.status === 'in_transit' || delivery.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <div className={`w-6 h-6 rounded-full ${delivery.status === 'in_transit' || delivery.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'} text-white flex items-center justify-center text-xs`}>
                3
              </div>
              <div className={`flex-1 h-1 mx-2 ${delivery.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <div className={`w-6 h-6 rounded-full ${delivery.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'} text-white flex items-center justify-center text-xs`}>
                4
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Assigned</span>
              <span>Pickup</span>
              <span>In Transit</span>
              <span>Delivered</span>
            </div>
          </div>
          
          {getStatusButtons()}
        </div>
      </div>
    </div>
  );
};

export default DriverDeliveryManager;