import React from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';

const RecentOrders = ({ orders }) => {
  if (!orders || orders.length === 0) {
    return (
      <div className="flex justify-center items-center h-60 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-500">No recent orders</p>
      </div>
    );
  }

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed': return 'bg-blue-100 text-blue-800';
      case 'Preparing': return 'bg-indigo-100 text-indigo-800';
      case 'Ready for Pickup': return 'bg-purple-100 text-purple-800';
      case 'On the way': return 'bg-cyan-100 text-cyan-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-emerald-100 text-emerald-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="overflow-hidden">
      <ul className="divide-y divide-gray-200">
        {orders.map((order) => (
          <li key={order._id} className="py-4">
            <Link to={`/orders/update/${order.orderId}`} className="block hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  {order.orderStatus === 'Pending' ? (
                    <FaExclamationCircle className="text-yellow-500 mr-2" />
                  ) : order.orderStatus === 'Completed' || order.orderStatus === 'Delivered' ? (
                    <FaCheckCircle className="text-green-500 mr-2" />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                  )}
                  <div>
                    <p className="font-medium text-gray-800">Order #{order.orderId}</p>
                    <p className="text-sm text-gray-500">
                      {order.customer?.name || 'Customer'} • ${Number(order.totalAmount).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(order.placedAt || order.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentOrders;