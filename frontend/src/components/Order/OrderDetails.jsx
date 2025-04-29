import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaClock,
  FaTimes, 
  FaBox, 
  FaMapMarkerAlt, 
  FaReceipt, 
  FaUser,
  FaStore,
  FaCreditCard,
  FaExclamationTriangle,
  FaInfoCircle,
  FaPercentage,
  FaClipboardList,
  FaCalendarAlt,
  FaHashtag,
  FaMoneyBill,
  FaShieldAlt,
  FaTruck,
  FaIdCard,
  FaPhone
} from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import socketService from '../../services/socketService';
import OrderTracker from './OrderTracker';

// Fix Leaflet icon issues
const DefaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom marker icons
const driverIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const destinationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const OrderDetails = ({ order, onClose }) => {
  const [driverLocation, setDriverLocation] = useState(null);
  const [isTrackingEnabled, setIsTrackingEnabled] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [fullOrderDetails, setFullOrderDetails] = useState(null);

  // Function to fetch order details via REST API
  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/orders/orders/${orderId}`);
      
      if (!response.ok) {
        console.warn(`Failed to fetch order details (Status: ${response.status})`);
        return null;
      }
      
      const data = await response.json();
      
      if (data.success && data.order) {
        console.log("✅ Successfully fetched order details via polling");
        setFullOrderDetails(data.order);
        
        // If we have driver location info, update it
        if (data.order.driverCurrentLocation?.latitude && 
            data.order.driverCurrentLocation?.longitude) {
          setDriverLocation([
            data.order.driverCurrentLocation.latitude,
            data.order.driverCurrentLocation.longitude
          ]);
          
          console.log("📍 Updated driver location from polling");
        }
        
        return data.order;
      }
      return null;
    } catch (error) {
      console.error('Error fetching order details:', error);
      return null;
    }
  };

  // Subscribe to real-time location updates when viewing orders that are being delivered
  useEffect(() => {
    if (!order || !order.orderId || !['On the way', 'Ready for Pickup'].includes(order.orderStatus)) {
      return;
    }

    // Initialize with current location from order if available
    if (order.driverCurrentLocation?.latitude && order.driverCurrentLocation?.longitude) {
      setDriverLocation([order.driverCurrentLocation.latitude, order.driverCurrentLocation.longitude]);
      // Since we at least have a stored location, indicate some form of tracking is available
      setIsTrackingEnabled(true);
    }

    // Try connecting to socket for real-time updates
    try {
      const socket = socketService.getSocket();
      
      if (socket) {
        console.log("Attempting to track order:", order.orderId);
        
        // Try to join the tracking room for this order
        socket.emit('track-order', order.orderId);
        
        if (socket.connected) {
          console.log("Socket connected, setting up live tracking");
          setIsTrackingEnabled(true);
          
          // Listen for driver location updates
          socket.on('driver_location_update', (data) => {
            if (data.orderId === order.orderId && data.driverLocation) {
              console.log("Received location update:", data.driverLocation);
              setDriverLocation([
                data.driverLocation.latitude,
                data.driverLocation.longitude
              ]);
            }
          });
          
          return () => {
            socket.off('driver_location_update');
          };
        } else {
          console.log("Socket not connected, using static tracking info");
          // Socket exists but not connected - use existing location data
        }
      }
    } catch (error) {
      console.error("Socket error in order tracking:", error);
      // Continue with static information even if socket fails
    }
  }, [order]);

  // Add useEffect to periodically poll for updates
  useEffect(() => {
    // Only poll for active orders that can change
    if (!order || !order.orderId || 
        !['On the way', 'Ready for Pickup', 'Preparing', 'Confirmed'].includes(order.orderStatus)) {
      return;
    }
    
    console.log("📊 Starting polling for order updates:", order.orderId);
    setIsPolling(true);
    
    // Immediately fetch once
    fetchOrderDetails(order.orderId);
    
    // Then set up interval
    const intervalId = setInterval(() => {
      fetchOrderDetails(order.orderId);
    }, 10000); // Poll every 10 seconds
    
    return () => {
      console.log("🛑 Stopping order polling");
      clearInterval(intervalId);
      setIsPolling(false);
    };
  }, [order?.orderId, order?.orderStatus]);

  // Calculate subtotal correctly by summing all item prices * quantities
  const calculateSubtotal = () => {
    if (!order || !order.items || !Array.isArray(order.items)) return 0;
    return order.items.reduce((total, item) => {
      return total + ((Number(item.price) || 0) * (Number(item.quantity) || 0));
    }, 0);
  };

  const subtotal = calculateSubtotal();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return 'Invalid date';
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-500';
    
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      case 'refunded': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      case 'delivered': return 'bg-green-500';
      case 'on the way': return 'bg-blue-400';
      case 'ready for pickup': return 'bg-yellow-500';
      case 'preparing': return 'bg-indigo-500';
      case 'confirmed': return 'bg-teal-500';
      case 'pending': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getCancellationByText = (cancelledBy) => {
    if (!cancelledBy) return 'Unknown';
    
    switch (cancelledBy) {
      case 'customer': return 'Customer';
      case 'restaurant': return 'Restaurant';
      case 'system': return 'System';
      default: return 'Unknown';
    }
  };

  const getPaymentStatusBadge = (status) => {
    if (!status) return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">Unknown</span>;
    
    switch (status.toLowerCase()) {
      case 'completed': return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Completed</span>;
      case 'failed': return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Failed</span>;
      case 'pending': return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Pending</span>;
      default: return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">{status}</span>;
    }
  };

  // Check if order object exists to avoid null reference errors
  if (!order) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md">
          <h2 className="text-xl font-bold text-red-500">Error</h2>
          <p className="mt-2">Order details could not be loaded.</p>
          <button 
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Safely access order properties
  const orderIdDisplay = order.id || order.orderId || 'No Order ID';
  const orderStatus = order.orderStatus || 'Unknown Status';
  const customerData = order.customer || {};
  const restaurantName = order.restaurantName || order.restaurant || 'Restaurant name not available';
  const orderItems = Array.isArray(order.items) ? order.items : [];
  const orderNote = order.orderNote || '';
  const statusTimestamps = order.statusTimestamps || {};
  const totalAmount = order.total || order.totalAmount || 0;
  const discount = order.discount || 0;
  const paymentMethod = order.paymentMethod || 'Not specified';
  const paymentStatus = order.paymentStatus || 'Unknown';
  const paymentTransactionId = order.paymentTransactionId || '';
  const loggedInUserName = order.loggedInUserName || 'Unknown user';
  const cancellation = order.cancellation || {};

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25 }}
          className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Section with Badge */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">Order Details</h2>
                <span className={`text-xs font-medium text-white px-3 py-1 rounded-full ${getStatusColor(orderStatus)}`}>
                  {orderStatus}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <FaHashtag className="text-gray-500" size={14} />
                <p className="text-gray-500 font-medium">{orderIdDisplay}</p>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <FaCalendarAlt className="text-gray-500" size={14} />
                <p className="text-gray-500 text-sm">Placed on {formatDate(order.placedAt || order.date)}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              aria-label="Close"
            >
              <FaTimes className="text-gray-500" size={20} />
            </button>
          </div>

          {/* Order Tracker */}
          {Object.keys(statusTimestamps).length > 0 && (
            <div className="mb-8">
              <OrderTracker
                currentStatus={orderStatus}
                statusTimestamps={statusTimestamps}
              />
            </div>
          )}

          {/* Updated Driver Information Section */}
          {(order.diliveryDriverId || order.driverInfo || (fullOrderDetails?.diliveryDriverId || fullOrderDetails?.driverInfo)) && (
            <div className="mb-8 bg-blue-50 border border-blue-100 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4 text-blue-600">
                <FaTruck />
                <h3 className="font-bold text-lg">Delivery Information</h3>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">Driver Details</h4>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
                    <FaUser size={20} />
                  </div>
                  <div>
                    <p className="font-medium">
                      {/* Use data from either source */}
                      {fullOrderDetails?.driverInfo?.name || 
                      order.driverInfo?.name || 
                      (fullOrderDetails?.diliveryDriverId || order.diliveryDriverId ? 'Assigned Driver' : 'Pending Assignment')}
                    </p>
                    {(fullOrderDetails?.driverInfo?.vehicleType || order.driverInfo?.vehicleType) && (
                      <p className="text-sm text-gray-500">
                        {fullOrderDetails?.driverInfo?.vehicleType || order.driverInfo?.vehicleType}
                        {(fullOrderDetails?.driverInfo?.licensePlate || order.driverInfo?.licensePlate) && 
                        ` • ${fullOrderDetails?.driverInfo?.licensePlate || order.driverInfo?.licensePlate}`}
                      </p>
                    )}
                  </div>
                </div>
                
                {(fullOrderDetails?.driverInfo?.phone || order.driverInfo?.phone) ? (
                  <a 
                    href={`tel:${fullOrderDetails?.driverInfo?.phone || order.driverInfo?.phone}`} 
                    className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors mt-2"
                  >
                    <FaPhone className="mr-2" size={14} /> Call Driver
                  </a>
                ) : (fullOrderDetails?.diliveryDriverId || order.diliveryDriverId) ? (
                  <span className="inline-block text-sm text-gray-500 mt-2">
                    Driver contact information not available
                  </span>
                ) : null}
                
                {/* Show connection status */}
                <div className="mt-3 text-sm">
                  <p className="text-gray-500">
                    {isPolling ? 
                      "Automatically refreshing delivery information..." : 
                      "Static delivery information"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Driver info for completed orders */}
          {orderStatus === 'Delivered' && order.diliveryDriverId && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-center items-center">
                <div className="mr-3 bg-green-100 rounded-full p-2">
                  <FaTruck className="text-green-500" />
                </div>
                <p className="text-sm text-gray-600">
                  Delivered by <span className="font-medium">{order.driverInfo?.name || 'Delivery Driver'}</span>
                  {order.statusTimestamps?.Delivered && (
                    <span className="ml-1">on {formatDate(order.statusTimestamps.Delivered)}</span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Cancellation Details - Displayed only if order was cancelled */}
          {orderStatus.toLowerCase() === 'cancelled' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 bg-red-50 border border-red-100 rounded-xl p-6"
            >
              <div className="flex items-center gap-2 mb-4 text-red-600">
                <FaExclamationTriangle />
                <h3 className="font-bold text-lg">Order Cancellation</h3>
              </div>
              <div className="space-y-3 text-gray-700">
                <div>
                  <span className="font-medium">Cancelled By:</span> {
                    cancellation && cancellation.cancelledBy 
                      ? getCancellationByText(cancellation.cancelledBy) 
                      : 'Unknown'
                  }
                </div>
                <div>
                  <span className="font-medium">Reason:</span> {
                    cancellation && cancellation.reason 
                      ? cancellation.reason 
                      : 'No reason provided'
                  }
                </div>
                {cancellation && cancellation.additionalInfo && (
                  <div>
                    <span className="font-medium">Additional Information:</span> {cancellation.additionalInfo}
                  </div>
                )}
                <div>
                  <span className="font-medium">Cancelled On:</span> {
                    cancellation && cancellation.timestamp 
                      ? formatDate(cancellation.timestamp) 
                      : 'N/A'
                  }
                </div>
              </div>
            </motion.div>
          )}

          {/* Two-column layout for details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Restaurant Information */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <FaStore className="text-gray-600" />
                <h3 className="font-bold text-lg">Restaurant</h3>
              </div>
              <p className="text-gray-800 font-medium">{restaurantName}</p>
              {order.restaurant && order.restaurantName && order.restaurant !== order.restaurantName && (
                <p className="text-gray-500 text-sm mt-1">ID: {order.restaurant}</p>
              )}
            </div>

            {/* Customer Information */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <FaUser className="text-gray-600" />
                <h3 className="font-bold text-lg">Customer</h3>
              </div>
              <div className="space-y-1">
                <p className="text-gray-800 font-medium">{customerData.name || 'Name not available'}</p>
                <p className="text-gray-600 text-sm flex items-center">
                  <FaIdCard className="mr-2 text-gray-400" size={12} />
                  {customerData.email || 'Email not available'}
                </p>
                <p className="text-gray-600 text-sm flex items-center">
                  <FaTruck className="mr-2 text-gray-400" size={12} />
                  {customerData.phone || 'Phone not available'}
                </p>
              </div>
            </div>
          </div>

          {/* Order Details Sections */}
          <div className="space-y-6">
            {/* Items Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <FaBox className="text-gray-600" />
                <h3 className="font-bold text-lg">Items</h3>
              </div>
              {orderItems.length > 0 ? (
                <div className="space-y-3">
                  {orderItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                      <div className="flex gap-4 items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                          <span className="text-sm font-medium">{item.quantity || 0}</span>
                        </div>
                        <div>
                          <span className="font-medium">{item.name || 'Unnamed item'}</span>
                          <div className="text-xs text-gray-500 mt-1">
                            Size: {item.size || 'N/A'} | Category: {item.category || 'N/A'}
                          </div>
                        </div>
                      </div>
                      <span className="font-medium">LKR {((item.price || 0) * (item.quantity || 0)).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No items in this order</p>
              )}
            </div>

            {/* Order Note (if exists) */}
            {orderNote && (
              <div className="bg-yellow-50 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FaClipboardList className="text-gray-600" />
                  <h3 className="font-bold text-lg">Order Note</h3>
                </div>
                <p className="text-gray-700 italic">"{orderNote}"</p>
              </div>
            )}

            {/* Delivery Address */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <FaMapMarkerAlt className="text-gray-600" />
                <h3 className="font-bold text-lg">Delivery Address</h3>
              </div>
              <p className="text-gray-600">{customerData.address || order.deliveryAddress || 'Address not available'}</p>
            </div>

            {/* Map Section - Show either live tracking or static map */}
            <div className="mt-6">
              <h4 className="font-medium text-gray-700 mb-3">
                {isTrackingEnabled ? 'Live Tracking' : 'Delivery Location'}
              </h4>
              <div className="h-64 rounded-lg overflow-hidden border border-gray-200">
                {(driverLocation || isTrackingEnabled) ? (
                  <MapContainer 
                    center={driverLocation || [6.9271, 79.8612]} // Default to Colombo if no location
                    zoom={15} 
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    
                    {driverLocation && (
                      <Marker position={driverLocation} icon={driverIcon}>
                        <Popup>Driver's current location</Popup>
                      </Marker>
                    )}
                    
                    <Marker 
                      position={[
                        parseFloat(order.customerCoordinates?.latitude || 6.9271),
                        parseFloat(order.customerCoordinates?.longitude || 79.8612)
                      ]} 
                      icon={destinationIcon}
                    >
                      <Popup>Delivery address: {customerData.address || 'Customer location'}</Popup>
                    </Marker>
                  </MapContainer>
                ) : (
                  // Static fallback when neither tracking nor location is available
                  <div className="flex flex-col items-center justify-center h-full bg-gray-100">
                    <FaMapMarkerAlt size={32} className="text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 text-center">
                      {orderStatus === 'On the way' ? 
                        'Location tracking unavailable. Your order is still on the way.' : 
                        'Delivery location information'
                      }
                    </p>
                  </div>
                )}
              </div>
              {order.driverCurrentLocation?.lastUpdated && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Last updated: {formatDate(order.driverCurrentLocation?.lastUpdated)}
                </p>
              )}
            </div>

            {/* Connection status indicator */}
            <div className="flex items-center justify-center mt-4">
              {isTrackingEnabled ? (
                <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Live tracking active
                </span>
              ) : isPolling ? (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                  Periodic location updates
                </span>
              ) : (
                <span className="text-xs bg-gray-100 text-gray-800 px-3 py-1 rounded-full flex items-center">
                  <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
                  Static location information
                </span>
              )}
            </div>

            {/* Price Summary */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <FaReceipt className="text-gray-600" />
                <h3 className="font-bold text-lg">Payment Summary</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>LKR {subtotal.toFixed(2)}</span>
                </div>
                
                {/* Show discount if exists */}
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center">
                      <FaPercentage className="mr-1" size={14} />
                      Discount {order.promoCode && `(${order.promoCode})`}
                    </span>
                    <span>-LKR {discount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-orange-500">LKR {Number(totalAmount).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <FaCreditCard className="text-gray-600" />
                <h3 className="font-bold text-lg">Payment Information</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 flex items-center">
                    <FaMoneyBill className="mr-2 text-gray-400" size={14} />
                    Payment Method
                  </span>
                  <span className="font-medium">{paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 flex items-center">
                    <FaShieldAlt className="mr-2 text-gray-400" size={14} />
                    Payment Status
                  </span>
                  <div>{getPaymentStatusBadge(paymentStatus)}</div>
                </div>
                {paymentTransactionId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID</span>
                    <span className="font-medium text-xs bg-gray-100 px-2 py-1 rounded">{paymentTransactionId}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order placed by (additional information) */}
          {loggedInUserName && (
            <div className="mt-6 pt-4 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-500 flex items-center justify-center">
                <FaInfoCircle className="mr-2" size={14} />
                Order placed by {customerData.name}
              </p>
            </div>
          )}

          {/* Order Status Footer for completed/cancelled statuses */}
          {['cancelled', 'refunded', 'completed', 'failed'].includes(orderStatus.toLowerCase()) && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 rounded-xl p-4 text-center"
              style={{ 
                backgroundColor: 
                  orderStatus.toLowerCase() === 'completed' ? 'rgba(52, 211, 153, 0.1)' : 
                  orderStatus.toLowerCase() === 'cancelled' ? 'rgba(239, 68, 68, 0.1)' : 
                  orderStatus.toLowerCase() === 'refunded' ? 'rgba(59, 130, 246, 0.1)' : 
                  'rgba(239, 68, 68, 0.1)' 
              }}
            >
              <p className={`text-lg font-semibold ${
                orderStatus.toLowerCase() === 'cancelled' ? 'text-red-500' :
                orderStatus.toLowerCase() === 'refunded' ? 'text-blue-500' :
                orderStatus.toLowerCase() === 'completed' ? 'text-green-500' :
                'text-red-500' // For Failed
              }`}>
                Order {orderStatus}
              </p>
              
              {statusTimestamps && statusTimestamps[orderStatus] && (
                <div className="flex items-center justify-center text-sm mt-2">
                  <FaClock className="mr-2 text-gray-500" size={12} />
                  <p className="text-gray-500">
                    {formatDate(statusTimestamps[orderStatus])}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Debug info section - add this before the closing motion.div */}
          {process.env.NODE_ENV !== 'production' && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <details className="text-xs text-gray-500">
                <summary className="cursor-pointer hover:text-gray-700">Debug Information</summary>
                <div className="mt-2 bg-gray-50 p-3 rounded text-left overflow-auto max-h-40">
                  <p>Order ID: {order.orderId}</p>
                  <p>Status: {order.orderStatus}</p>
                  <p>Driver ID: {order.diliveryDriverId || 'None'}</p>
                  <p>Socket Connected: {socketService.getSocket()?.connected ? 'Yes' : 'No'}</p>
                  <p>Tracking Enabled: {isTrackingEnabled ? 'Yes' : 'No'}</p>
                  <p>Polling Active: {isPolling ? 'Yes' : 'No'}</p>
                  <p>Driver Location: {driverLocation ? `[${driverLocation[0]}, ${driverLocation[1]}]` : 'None'}</p>
                  <p>Last Updated: {order.driverCurrentLocation?.lastUpdated ? formatDate(order.driverCurrentLocation.lastUpdated) : 'N/A'}</p>
                </div>
              </details>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OrderDetails;