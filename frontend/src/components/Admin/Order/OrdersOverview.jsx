import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaClock, 
  FaTruck, 
  FaCheckCircle, 
  FaTimesCircle,
  FaChevronRight
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const OrdersOverview = ({ pendingOrders, deliveredOrders, completedOrders, cancelledOrders }) => {
  const orderStatuses = [
    {
      title: 'Pending Orders',
      count: pendingOrders,
      icon: <FaClock />,
      color: 'bg-yellow-100 text-yellow-700',
      link: '/admin/orders?status=Pending'
    },
    {
      title: 'Delivered Orders',
      count: deliveredOrders,
      icon: <FaTruck />,
      color: 'bg-blue-100 text-blue-700',
      link: '/admin/orders?status=Delivered'
    },
    {
      title: 'Completed Orders',
      count: completedOrders,
      icon: <FaCheckCircle />,
      color: 'bg-green-100 text-green-700',
      link: '/admin/orders?status=Completed'
    },
    {
      title: 'Cancelled Orders',
      count: cancelledOrders,
      icon: <FaTimesCircle />,
      color: 'bg-red-100 text-red-700',
      link: '/admin/orders?status=Cancelled'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">Orders Overview</h2>
        <p className="text-gray-500 text-sm mt-1">Breakdown of orders by status</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">
        {orderStatuses.map((status, index) => (
          <Link 
            key={index} 
            to={status.link}
            className="p-6 hover:bg-gray-50 transition-colors duration-150"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center mb-2">
                <div className={`w-10 h-10 rounded-full ${status.color} flex items-center justify-center mr-3`}>
                  {status.icon}
                </div>
                <h3 className="font-semibold text-gray-800">{status.title}</h3>
              </div>
              <div className="mt-auto flex items-center justify-between">
                <span className="text-3xl font-bold text-gray-800">{status.count}</span>
                <div className="text-gray-400">
                  <FaChevronRight />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default OrdersOverview;