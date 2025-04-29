import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  FaArrowLeft,
  FaSpinner,
  FaClock,
  FaReceipt,
  FaStore,
  FaUser,
  FaMapMarkedAlt,
  FaBox,
  FaMotorcycle,
  FaTruck,
  FaCheck,
  FaCheckCircle,
  FaExclamationCircle,
  FaHistory,
  FaCreditCard,
  FaMoneyBill,
  FaPhoneAlt,
  FaDirections
} from 'react-icons/fa';

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

const RestaurantIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const DestinationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markingComplete, setMarkingComplete] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5001/api/orders/orders/${orderId}`);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.order) {
          setOrder(data.order);
          console.log('Order details:', data.order);
        } else {
          throw new Error('Failed to fetch order details');
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError(error.message);
        toast.error(`Failed to load order details: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [orderId]);
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };
  
  // Calculate subtotal from items
  const calculateSubtotal = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };
  
  // Mark order as delivered
  const markAsDelivered = async () => {
    try {
      setMarkingComplete(true);
      
      // Get driver information from localStorage
      const userData = JSON.parse(localStorage.getItem('userData'));
      let driverId;
      
      // Check different possible structures for driver ID
      if (userData?.id) {
        driverId = userData.id;
      } else if (userData?.user?.id) {
        driverId = userData.user.id;
      } else if (userData?._id) {
        driverId = userData._id;
      } else if (userData?.user?._id) {
        driverId = userData.user._id;
      } else {
        throw new Error('Driver information not found');
      }
      
      console.log("Using driver ID:", driverId);
      
      // 1. Update order status using the existing route
      const statusResponse = await fetch(`http://localhost:5001/api/orders/update-status/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newStatus: 'Delivered'
        })
      });
      
      if (!statusResponse.ok) {
        const errorData = await statusResponse.json();
        throw new Error(errorData.message || 'Failed to update order status');
      }
      
      // 2. Update driver assignment status
      const assignmentResponse = await fetch(`http://localhost:5001/api/orders/${orderId}/driver-assignment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          driverId: driverId,
          assignmentStatus: 'completed',
          assignmentHistoryUpdate: {
            driverId: driverId,
            status: 'completed',
            timestamp: new Date()
          }
        })
      });
      
      if (!assignmentResponse.ok) {
        console.warn('Could not update assignment status, but order was marked as delivered');
      }
      
      // Record the timestamp for the Delivered status if your controller doesn't do this
      if (!order.statusTimestamps) {
        order.statusTimestamps = {};
      }
      order.statusTimestamps.Delivered = new Date();
      
      // If payment method is COD, update payment status
      if (order.paymentMethod === 'Cash on delivery' && order.paymentStatus === 'Pending') {
        try {
          const paymentResponse = await fetch(`http://localhost:5001/api/orders/${orderId}/payment-status`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              paymentStatus: 'Completed',
              paymentDetails: {
                method: 'Cash on delivery',
                collectedBy: driverId,
                collectedAt: new Date()
              }
            })
          });
          
          if (!paymentResponse.ok) {
            console.warn('Could not update payment status');
          }
        } catch (paymentError) {
          console.error('Error updating payment status:', paymentError);
        }
      }
      
      toast.success('Order marked as delivered!');
      
      // Refresh order data
      const updatedOrderResponse = await fetch(`http://localhost:5001/api/orders/orders/${orderId}`);
      const updatedOrderData = await updatedOrderResponse.json();
      
      if (updatedOrderData.success) {
        setOrder(updatedOrderData.order);
      }
      
    } catch (error) {
      console.error('Error marking order as delivered:', error);
      toast.error(`Failed to update order: ${error.message}`);
    } finally {
      setMarkingComplete(false);
    }
  };
  
  // Get Google Maps directions URL
  const getDirectionsUrl = (address) => {
    if (!address) return '#';
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  };
  
  // Call customer
  const callCustomer = (phone) => {
    if (!phone) {
      toast.error('No phone number available');
      return;
    }
    window.location.href = `tel:${phone}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="bg-red-50 p-6 rounded-lg border border-red-100 text-center max-w-2xl mx-auto">
          <FaExclamationCircle className="text-4xl text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-3">Failed to Load Order</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => navigate('/driver/my-deliveries')}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Back to My Deliveries
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-100 text-center max-w-2xl mx-auto">
          <FaExclamationCircle className="text-4xl text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-3">Order Not Found</h2>
          <p className="text-gray-700 mb-4">The requested order could not be found.</p>
          <button
            onClick={() => navigate('/driver/my-deliveries')}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          >
            Back to My Deliveries
          </button>
        </div>
      </div>
    );
  }

  const {
    orderStatus,
    restaurantName,
    restaurant,
    customer,
    items = [],
    totalAmount = 0,
    paymentMethod,
    paymentStatus,
    placedAt,
    diliveryDriverId,
    driverInfo,
    orderNote,
    assignmentHistory = []
  } = order;
  
  const isDeliverableStatus = ['Ready for Pickup', 'On the way'].includes(orderStatus);
  const isCompleted = ['Delivered', 'Completed'].includes(orderStatus);
  const isCancelled = orderStatus === 'Cancelled';
  const subtotal = calculateSubtotal(items);

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/driver/my-deliveries')} 
                className="p-2 rounded-full hover:bg-orange-400 transition-colors"
              >
                <FaArrowLeft />
              </button>
              <div>
                <h1 className="text-2xl font-bold">Order #{orderId}</h1>
                <p className="text-sm opacity-90">{formatDate(placedAt)}</p>
              </div>
            </div>
            <div>
              <span className={`inline-block px-4 py-1 rounded-full text-sm font-medium
                ${orderStatus === 'Delivered' ? 'bg-green-100 text-green-800' : 
                  orderStatus === 'On the way' ? 'bg-blue-100 text-blue-800' :
                  orderStatus === 'Ready for Pickup' ? 'bg-yellow-100 text-yellow-800' :
                  orderStatus === 'Cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}
              >
                {orderStatus}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Restaurant & Customer Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Restaurant Info */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-100 flex items-center justify-center rounded-full">
                    <FaStore className="text-orange-500" />
                  </div>
                  <h2 className="text-lg font-medium">Restaurant</h2>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">{restaurantName}</p>
                  {restaurant !== restaurantName && (
                    <p className="text-sm text-gray-500">ID: {restaurant}</p>
                  )}
                </div>
              </div>
              
              {/* Customer Info */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 flex items-center justify-center rounded-full">
                    <FaUser className="text-blue-500" />
                  </div>
                  <h2 className="text-lg font-medium">Customer</h2>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">{customer.name}</p>
                  <p className="text-sm text-gray-600">{customer.email}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-600">{customer.phone}</p>
                    <button
                      onClick={() => callCustomer(customer.phone)}
                      className="p-1 text-blue-500 hover:text-blue-700"
                      title="Call customer"
                    >
                      <FaPhoneAlt size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Delivery Address with Map */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 flex items-center justify-center rounded-full">
                  <FaMapMarkedAlt className="text-green-500" />
                </div>
                <h2 className="text-lg font-medium">Delivery Address</h2>
                <a 
                  href={getDirectionsUrl(customer.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 flex items-center gap-1"
                >
                  <FaDirections size={14} />
                  <span>Directions</span>
                </a>
              </div>
              <p className="text-gray-700 mb-4">{customer.address}</p>
              
              <div className="h-64 rounded-lg overflow-hidden border border-gray-200 mb-2">
                <MapContainer 
                  center={[6.9271, 79.8612]} // Colombo as default
                  zoom={15} 
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {/* Show customer destination */}
                  <Marker 
                    position={[6.9271, 79.8612]} 
                    icon={DestinationIcon}
                  >
                    <Popup>
                      <div>
                        <p><strong>Delivery Location</strong></p>
                        <p>{customer.address}</p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Map shows approximate delivery location
              </p>
            </div>
            
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 flex items-center justify-center rounded-full">
                  <FaBox className="text-purple-500" />
                </div>
                <h2 className="text-lg font-medium">Order Items</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {items.map((item, index) => (
                  <div key={index} className="py-3 flex justify-between">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center text-sm font-medium">
                        {item.quantity}
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          {item.size} • {item.category}
                        </p>
                      </div>
                    </div>
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              
              {orderNote && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-md">
                  <p className="text-sm font-medium text-gray-700">Order Note:</p>
                  <p className="text-sm text-gray-600 italic">"{orderNote}"</p>
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                
                {subtotal !== totalAmount && (
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Additional Fees/Discounts</span>
                    <span>${(totalAmount - subtotal).toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between font-semibold text-lg mt-2">
                  <span>Total</span>
                  <span className="text-orange-500">${totalAmount.toFixed(2)}</span>
                </div>
                
                <div className="mt-4 text-sm flex items-center gap-2 text-gray-600">
                  <FaCreditCard />
                  <span>Payment: {paymentMethod} ({paymentStatus})</span>
                </div>
              </div>
            </div>
            
            {/* Delivery Timeline */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-100 flex items-center justify-center rounded-full">
                  <FaHistory className="text-indigo-500" />
                </div>
                <h2 className="text-lg font-medium">Delivery Timeline</h2>
              </div>
              
              <div className="space-y-6">
                {order.statusTimestamps && Object.entries(order.statusTimestamps).map(([status, timestamp], index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mt-0.5
                      ${status === 'Delivered' ? 'bg-green-100 text-green-600' : 
                        status === 'Ready for Pickup' ? 'bg-yellow-100 text-yellow-600' :
                        status === 'On the way' ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-100 text-gray-600'
                      }
                    `}>
                      {status === 'Delivered' ? <FaCheck /> : <FaClock />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{status}</p>
                      <p className="text-sm text-gray-500">{formatDate(timestamp)}</p>
                    </div>
                  </div>
                ))}
                
                {assignmentHistory && assignmentHistory.length > 0 && (
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mt-0.5">
                      <FaMotorcycle />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Driver Assigned</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(assignmentHistory[0].timestamp)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Actions Panel */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium mb-4">Actions</h2>
              
              {isDeliverableStatus && (
                <button
                  onClick={markAsDelivered}
                  disabled={markingComplete}
                  className="w-full py-3 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {markingComplete ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <FaCheckCircle />
                      <span>Mark as Delivered</span>
                    </>
                  )}
                </button>
              )}
              
              {isCompleted && (
                <div className="text-center py-3">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FaCheckCircle size={30} className="text-green-500" />
                  </div>
                  <p className="text-green-700 font-medium">This order has been delivered</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {order.statusTimestamps?.Delivered && 
                      `Completed on ${formatDate(order.statusTimestamps.Delivered)}`
                    }
                  </p>
                </div>
              )}
              
              {isCancelled && (
                <div className="text-center py-3">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FaExclamationCircle size={30} className="text-red-500" />
                  </div>
                  <p className="text-red-700 font-medium">This order was cancelled</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {order.cancellation?.reason && 
                      `Reason: ${order.cancellation.reason}`
                    }
                  </p>
                </div>
              )}
              
              <div className="mt-4 space-y-2">
                <a 
                  href={`tel:${customer.phone}`} 
                  className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center justify-center gap-2"
                >
                  <FaPhoneAlt />
                  <span>Call Customer</span>
                </a>
                
                <a 
                  href={getDirectionsUrl(customer.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 flex items-center justify-center gap-2"
                >
                  <FaDirections />
                  <span>Get Directions</span>
                </a>
              </div>
            </div>
            
            {/* Driver Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium mb-4">Driver Information</h2>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
                  <FaTruck size={24} />
                </div>
                <div>
                  <p className="font-medium">
                    {driverInfo?.name || 'You'}
                  </p>
                  {driverInfo?.vehicleType && (
                    <p className="text-sm text-gray-500">
                      {driverInfo.vehicleType}
                      {driverInfo.licensePlate && ` • ${driverInfo.licensePlate}`}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                <p>Assignment Status: <span className="font-medium">{order.driverAssignmentStatus || 'N/A'}</span></p>
                {assignmentHistory && assignmentHistory.length > 0 && 
                  <p className="mt-1">Assigned on: <span className="font-medium">{formatDate(assignmentHistory[0].timestamp)}</span></p>
                }
              </div>
            </div>
            
            {/* Payment Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium mb-4">Payment Information</h2>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {paymentMethod === 'Cash on delivery' ? 
                    <FaMoneyBill className="text-green-500" /> : 
                    <FaCreditCard className="text-blue-500" />
                  }
                  <span className="font-medium">{paymentMethod}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`text-sm font-medium px-2 py-0.5 rounded-full
                    ${paymentStatus === 'Completed' ? 'bg-green-100 text-green-800' :
                      paymentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}
                  >
                    {paymentStatus}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-semibold">${totalAmount.toFixed(2)}</span>
                </div>
                
                {paymentMethod === 'Cash on delivery' && paymentStatus === 'Pending' && (
                  <div className="mt-3 p-3 bg-yellow-50 rounded-md text-sm">
                    <p className="text-yellow-800 font-medium">Collection Required</p>
                    <p className="mt-1 text-gray-700">
                      Please collect ${totalAmount.toFixed(2)} in cash from the customer.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;