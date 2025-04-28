import React, { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { 
  FaMotorcycle, FaLocationArrow, FaPowerOff, FaBox, 
  FaTruck, FaHistory, FaUser
} from 'react-icons/fa';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import socketService from '../../services/socketService';

// Fix Leaflet default icon issue
let DefaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const DeliveryDashboard = () => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const [pendingAssignments, setPendingAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [readyForPickupOrders, setReadyForPickupOrders] = useState([]);

  // Add this helper function before your useEffect that calls it
  const getCurrentOrderId = () => {
    // Check if there's a current order in progress
    if (pendingAssignments && pendingAssignments.length > 0) {
      return pendingAssignments[0].orderId;
    }
    return null;
  };

  useEffect(() => {
    // DEBUGGING: Add detailed authentication debugging
    console.log("------------ DELIVERY DASHBOARD MOUNTED ------------");
    console.log("Checking authentication...");
    
    // Get user data and log detailed information
    let userData;
    try {
      const rawData = localStorage.getItem('userData');
      console.log("Raw userData from localStorage:", rawData);
      
      userData = JSON.parse(rawData);
      console.log("Parsed userData:", userData);
      
      // Check if the structure matches what's expected
      if (!userData) {
        console.error("userData is null or undefined");
      } else if (!userData.user) {
        console.error("userData.user is missing");
      } else {
        console.log("User ID:", userData.user._id);
        console.log("User role:", userData.user.role);
        console.log("User name:", userData.user.name);
        console.log("Is correct role:", userData.user.role === 'delivery_person');
      }
    } catch (error) {
      console.error("Error parsing userData:", error);
    }

    // Check authentication status
    if (!userData || !userData.user) {
      console.error("Authentication failed: No user data found");
      toast.error('Please login as a delivery person');
      navigate('/login');
      return;
    }

    if (userData.user.role !== 'delivery_person') {
      console.error(`Authentication failed: Wrong role. Expected 'delivery_person', got '${userData.user.role}'`);
      toast.error('Please login as a delivery person');
      navigate('/login');
      return;
    }

    console.log("Authentication successful, continuing with component initialization");

    // Register user as driver in the delivery system if not already registered
    const registerAsDriver = async () => {
      try {
        console.log("Checking if user is registered as driver...");
        const registerResponse = await fetch(`http://localhost:5002/api/drivers/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userData.token}`
          },
          body: JSON.stringify({
            userId: userData.user._id,
            name: userData.user.name,
            email: userData.user.email,
            phone: userData.user.phone || "Not provided",
            vehicleType: "Car" // Default value, could be from user profile
          })
        });
        
        if (registerResponse.ok) {
          console.log("Driver registered/verified successfully");
        } else {
          console.log("Driver registration status:", registerResponse.status);
        }
      } catch (error) {
        console.log("Could not register as driver, continuing anyway:", error);
      }
    };
    
    registerAsDriver();

    // Connect to socket
    const socket = socketService.getSocket();
    
    // Log when driver joins the room
    console.log(`Joining driver room: driver_${userData.user._id}`);
    socketService.joinDriverRoom(userData.user._id);
    
    // Track socket connection status
    console.log("Socket connected:", socket.connected);
    
    socket.on('connect', () => {
      console.log("Socket connected successfully");
    });
    
    socket.on('connect_error', (error) => {
      console.error("Socket connection error:", error);
    });

    // Add comprehensive logging for assignment events
    socket.on('new_assignment', (assignment) => {
      console.log("🔔 NEW ASSIGNMENT RECEIVED 🔔");
      console.log("Assignment details:", assignment);
      console.log("Assignment order ID:", assignment.orderId);
      console.log("Assignment restaurant:", assignment.restaurantName);
      console.log("Assignment amount:", assignment.totalAmount);
      console.log("Timestamp:", new Date().toISOString());
      
      toast.success('New delivery assignment received!');
      setPendingAssignments(prev => {
        const updated = [...prev, assignment];
        console.log("Updated pending assignments:", updated);
        return updated;
      });
    });
    
    // Add listener for assignment status updates
    socket.on('assignment_update', (data) => {
      console.log("Assignment status update received:", data);
    });
    
    // Check if there are any existing assignments when component mounts
    const checkExistingAssignments = async () => {
      try {
        console.log("Checking for existing pending assignments...");
        
        // First try the dedicated delivery management API
        try {
          const response = await fetch(`http://localhost:5002/api/drivers/${userData.user._id}/pending-assignments`, {
            headers: {
              'Authorization': `Bearer ${userData.token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log("Existing pending assignments:", data);
            if (data && data.length > 0) {
              setPendingAssignments(data);
            } else {
              console.log("No existing pending assignments found");
            }
            return;
          }
        } catch (deliveryApiError) {
          console.log("Delivery API not available, trying Order Management API...");
        }
        
        // Fallback to order management API
        try {
          const response = await fetch(`http://localhost:5001/api/orders/driver/${userData.user._id}/pending`, {
            headers: {
              'Authorization': `Bearer ${userData.token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log("Existing pending assignments (from orders API):", data);
            if (data && data.orders && data.orders.length > 0) {
              setPendingAssignments(data.orders);
            } else {
              console.log("No existing pending assignments found in orders API");
            }
          } else {
            console.log("No pending assignments API available yet");
          }
        } catch (orderApiError) {
          console.log("Order API not available either, continuing without assignments");
        }
      } catch (error) {
        console.error("Error checking existing assignments:", error);
      } finally {
        // Always set loading to false so the dashboard displays
        setLoading(false);
      }
    };
    
    checkExistingAssignments();

    // Fetch all Ready for Pickup orders
    const fetchReadyForPickupOrders = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/orders/ready-for-pickup');
        
        if (!response.ok) {
          console.warn(`Failed to fetch ready for pickup orders (Status: ${response.status})`);
          return [];
        }
        
        const data = await response.json();
        
        if (data.success) {
          console.log(`Found ${data.count} orders ready for pickup`);
          if (data.orders && Array.isArray(data.orders)) {
            setReadyForPickupOrders(data.orders);
            return data.orders;
          }
        }
        return [];
      } catch (error) {
        console.error('Error fetching ready for pickup orders:', error);
        return [];
      }
    };

    fetchReadyForPickupOrders();

    // Fetch ready for pickup orders periodically
    const fetchOrders = async () => {
      const orders = await fetchReadyForPickupOrders();
      console.log("Ready for pickup orders:", orders);
    };

    fetchOrders();

    // Optionally, set up polling
    const intervalId = setInterval(fetchOrders, 60000); // every minute

    // Check token expiration if applicable
    if (userData.expiresAt) {
      const now = new Date();
      const expiryDate = new Date(userData.expiresAt);
      console.log("Token expires at:", expiryDate);
      console.log("Current time:", now);
      console.log("Is token expired:", now > expiryDate);
      
      if (now > expiryDate) {
        console.error("Token has expired");
        localStorage.removeItem('userData');
        toast.error('Your session has expired. Please login again.');
        navigate('/login');
        return;
      }
    }

    // Set loading to false after authentication check
    setLoading(false);

    return () => {
      console.log("Cleaning up DeliveryDashboard component");
      if (watchId) {
        console.log("Clearing geolocation watch");
        navigator.geolocation.clearWatch(watchId);
      }
      socket.off('new_assignment');
      socket.off('assignment_update');
      clearInterval(intervalId);
    };
  }, [navigate, watchId]);

  // Auto-update driver location when online
  useEffect(() => {
    if (isOnline && currentLocation && watchId) {
      // Get current order from state or context
      const currentOrderId = getCurrentOrderId(); // implement this function
      
      if (currentOrderId) {
        updateDriverLocation(
          currentOrderId,
          currentLocation[0], // latitude
          currentLocation[1]  // longitude
        );
      }
    }
  }, [isOnline, currentLocation, watchId]);

  // Add logging to online/offline toggle
  const toggleOnlineStatus = () => {
    if (!isOnline) {
      console.log("Driver going online...");
      
      // Going online
      if (!navigator.geolocation) {
        toast.error('Geolocation is not supported by your browser');
        return;
      }

      const id = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log(`Location updated: [${latitude}, ${longitude}]`);
          setCurrentLocation([latitude, longitude]);
          
          try {
            const userData = JSON.parse(localStorage.getItem('userData'));
            
            // Try to emit socket event if connected
            const socket = socketService.getSocket();
            if (socket && socket.connected) {
              console.log(`Emitting driver_online event for driver ${userData.user._id}`);
              socket.emit('driver_online', {
                driverId: userData.user._id,
                location: { latitude, longitude }
              });
            }
            
            // Also update location via REST API as a fallback
            fetch(`http://localhost:5001/api/drivers/${userData.user._id}/location`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userData.token}`
              },
              body: JSON.stringify({ 
                latitude,
                longitude
              })
            }).catch(error => {
              console.log('REST API fallback also failed:', error);
              // Continue anyway - the map UI will still work
            });
          } catch (error) {
            console.error('Error in location update:', error);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Unable to get your location. Please enable location services.');
        },
        {
          enableHighAccuracy: true,
          maximumAge: 30000,
          timeout: 27000
        }
      );

      setWatchId(id);
      setIsOnline(true);
      toast.success('You are now online and can receive orders');
    } else {
      console.log("Driver going offline...");
      // Going offline
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      }

      try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        const socket = socketService.getSocket();
        if (socket && socket.connected) {
          socket.emit('driver_offline', {
            driverId: userData.user._id
          });
        }
      } catch (error) {
        console.error('Error in offline status update:', error);
      }

      setIsOnline(false);
      toast.success('You are now offline');
    }
  };

  // Log order acceptance/rejection
  const handleAcceptOrder = async (orderId) => {
    try {
      console.log(`Accepting order ${orderId}`);
      const userData = JSON.parse(localStorage.getItem('userData'));
      
      // First update the order in the database through the API
      const response = await fetch(`http://localhost:5001/api/orders/${orderId}/driver-assignment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData.token}`
        },
        body: JSON.stringify({
          driverId: userData.user._id,
          assignmentStatus: 'accepted',
          assignmentHistoryUpdate: {
            driverId: userData.user._id,
            status: 'accepted',
            timestamp: new Date()
          },
          driverInfo: {
            name: userData.user.name,
            phone: userData.user.phone || 'Not provided',
            vehicleType: 'Car', // You could store this in user profile
            licensePlate: userData.user.licensePlate || 'Not provided' // You could store this in user profile
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to accept order');
      }
      
      // Also emit a socket event for real-time updates
      const socket = socketService.getSocket();
      if (socket && socket.connected) {
        socket.emit('order_response', {
          driverId: userData.user._id,
          orderId,
          response: 'accepted'
        });
      }

      // Update order status to "On the way"
      const statusResponse = await fetch(`http://localhost:5001/api/orders/update-status/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData.token}`
        },
        body: JSON.stringify({
          newStatus: 'On the way'
        })
      });
      
      if (!statusResponse.ok) {
        console.warn('Could not update order status, but assignment was successful');
      }

      // Remove from pending assignments
      setPendingAssignments(prev => prev.filter(a => a.orderId !== orderId));
      
      toast.success('Order accepted successfully');
      
      // Navigate to delivery management page
      navigate(`/driver/delivery/${userData.user._id}/${orderId}`);
    } catch (error) {
      console.error('Error accepting order:', error);
      toast.error(`Failed to accept order: ${error.message}`);
    }
  };

  const handleRejectOrder = async (orderId) => {
    try {
      console.log(`Rejecting order ${orderId}`);
      const userData = JSON.parse(localStorage.getItem('userData'));
      
      console.log("Emitting order_response with 'rejected'");
      socketService.getSocket().emit('order_response', {
        driverId: userData.user._id,
        orderId,
        response: 'rejected'
      });

      setPendingAssignments(prev => prev.filter(a => a.orderId !== orderId));
      toast.success('Order rejected');
    } catch (error) {
      console.error('Error rejecting order:', error);
      toast.error('Failed to reject order');
    }
  };

  // Assign a driver to an order
  const assignDriverToOrder = async (orderId, driverId, driverInfo) => {
    try {
      const response = await fetch(`http://localhost:5001/api/orders/${orderId}/driver-assignment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          driverId: driverId,
          assignmentStatus: 'assigned', // or 'accepted', 'rejected'
          assignmentHistoryUpdate: {
            driverId: driverId,
            status: 'accepted',
            timestamp: new Date()
          },
          driverInfo: {
            name: driverInfo.name,
            phone: driverInfo.phone,
            vehicleType: driverInfo.vehicleType,
            licensePlate: driverInfo.licensePlate
          }
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to assign driver to order');
      }
      
      const data = await response.json();
      console.log('Driver assignment updated:', data);
      
      return data.success;
    } catch (error) {
      console.error('Error assigning driver:', error);
      return false;
    }
  };

  // Update driver location for an order
  const updateDriverLocation = async (orderId, latitude, longitude) => {
    try {
      const response = await fetch(`http://localhost:5001/api/orders/${orderId}/update-driver-location`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          driverLocation: {
            latitude: latitude,
            longitude: longitude
          }
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update driver location');
      }
      
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error updating driver location:', error);
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Driver Dashboard</h1>
              <p className="text-sm opacity-90">Manage your deliveries</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/driver/profile')}
                className="px-6 py-2 rounded-full flex items-center gap-2 transition-colors bg-white text-orange-600 hover:bg-orange-50"
              >
                <FaUser />
                My Profile
              </button>
              <button
                onClick={() => navigate('/driver/my-deliveries')}
                className="px-6 py-2 rounded-full flex items-center gap-2 transition-colors bg-white text-orange-600 hover:bg-orange-50"
              >
                <FaHistory />
                My Deliveries
              </button>
              <button
                onClick={toggleOnlineStatus}
                className={`px-6 py-2 rounded-full flex items-center gap-2 transition-colors ${
                  isOnline 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                <FaPowerOff />
                {isOnline ? 'Go Offline' : 'Go Online'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaMotorcycle />
                Driver Status
              </h2>
              <div className="flex items-center justify-between">
                <span>Availability:</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  isOnline 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              {currentLocation && (
                <div className="mt-4 text-sm text-gray-600">
                  <div>Latitude: {currentLocation[0].toFixed(6)}</div>
                  <div>Longitude: {currentLocation[1].toFixed(6)}</div>
                </div>
              )}
            </motion.div>

            {/* Pending Assignments */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-4 bg-blue-50 border-b border-blue-100">
                <h2 className="font-semibold flex items-center gap-2">
                  <FaBox />
                  Pending Assignments ({pendingAssignments.length})
                </h2>
              </div>
              <div className="p-4 divide-y divide-gray-100">
                {pendingAssignments.map((assignment) => (
                  <div key={assignment.orderId} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex justify-between mb-2">
                      <div>
                        <h3 className="font-medium">Order #{assignment.orderId}</h3>
                        <p className="text-sm text-gray-600">{assignment.restaurantName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${assignment.totalAmount?.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptOrder(assignment.orderId)}
                        className="flex-1 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectOrder(assignment.orderId)}
                        className="flex-1 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
                {pendingAssignments.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No pending assignments
                  </p>
                )}
              </div>
            </motion.div>

            {/* Available Orders Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-4 bg-green-50 border-b border-green-100">
                <h2 className="font-semibold flex items-center gap-2">
                  <FaTruck />
                  Available Orders ({readyForPickupOrders.length})
                </h2>
              </div>
              <div className="p-4 divide-y divide-gray-100">
                {readyForPickupOrders.map((order) => (
                  <div key={order.orderId} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex justify-between mb-2">
                      <div>
                        <h3 className="font-medium">Order #{order.orderId}</h3>
                        <p className="text-sm text-gray-600">{order.restaurantName}</p>
                        <p className="text-xs text-gray-500">{order.customer.address}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${order.totalAmount?.toFixed(2)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAcceptOrder(order.orderId)}
                      className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    >
                      Accept Order
                    </button>
                  </div>
                ))}
                {readyForPickupOrders.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No orders available for pickup
                  </p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Map Column */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-md overflow-hidden h-[600px]"
            >
              {currentLocation ? (
                <MapContainer
                  center={currentLocation}
                  zoom={15}
                  className="h-full w-full"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={currentLocation}>
                    <Popup>Your current location</Popup>
                  </Marker>
                </MapContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center p-8">
                    <FaLocationArrow className="text-5xl text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-600 mb-2">
                      Location Required
                    </h3>
                    <p className="text-gray-500">
                      Please go online to enable location services and see the map
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;