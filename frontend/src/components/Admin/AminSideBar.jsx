import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTruck,
  FaHome, 
  FaUtensils, 
  FaShoppingBag, 
  FaUsers, 
  FaChartPie, 
  FaCog, 
  FaSignOutAlt, 
  FaBars, 
  FaTimes, 
  FaBell, 
  FaQuestion, 
  FaMoneyBillWave, 
  FaClipboardList,
  FaUserShield,
  FaStar,
  FaTags,
  FaCreditCard,
  FaList,
  FaMapMarkerAlt,
  FaExclamationCircle,
  FaStream,
  FaEnvelope
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';

const AdminSidebar = ({ user }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch pending orders count
  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/orders?status=Pending');
        const data = await response.json();
        
        if (data && data.orders) {
          setPendingOrdersCount(data.orders.length);
        }
      } catch (error) {
        console.error('Error fetching pending orders:', error);
      }
    };

    fetchPendingOrders();
    
    // Set up polling to refresh the count every 2 minutes
    const intervalId = setInterval(fetchPendingOrders, 120000);
    
    // Mock unread notifications (replace with real API call)
    setUnreadNotifications(3);
    
    return () => clearInterval(intervalId);
  }, []);

  const menuItems = [
    { 
      name: 'Dashboard', 
      icon: <FaHome size={20} />, 
      path: '/admin/dashboard',
      badge: null
    },
    { 
      name: 'Orders', 
      icon: <FaShoppingBag size={20} />, 
      path: '/admin/orders',
      badge: pendingOrdersCount || null,
      subMenu: [
        { name: 'Order Dashboard', path: '/order/dashboard' },
        { name: 'All Orders', path: '/admin/orders' },
        
      ]
    },
    { 
      name: 'Restaurants', 
      icon: <FaUtensils size={20} />, 
      path: '/admin/restaurants',
      badge: null,
      subMenu: [
        { name: 'All Restaurants', path: '/admin/restaurants' },
        { name: 'Add Restaurant', path: '/admin/restaurants/add' },
        { name: 'Categories', path: '/admin/restaurant-categories' },
      ]
    },
    { 
      name: 'Menu Management', 
      icon: <FaList size={20} />, 
      path: '/admin/menu',
      badge: null
    },
    { 
      name: 'Users', 
      icon: <FaUsers size={20} />, 
      path: '/admin/users',
      badge: null,
      subMenu: [
        { name: 'Customers', path: '/admin/users/customers' },
        { name: 'Restaurant Owners', path: '/admin/users/restaurant-owners' },
        { name: 'Delivery Personnel', path: '/admin/users/delivery' },
        { name: 'Administrators', path: '/admin/users/administrators' },
      ]
    },
    { 
      name: 'Analytics', 
      icon: <FaChartPie size={20} />, 
      path: '/admin/analytics',
      badge: null,
      subMenu: [
        { name: 'Sales Overview', path: '/admin/analytics/sales' },
        { name: 'Restaurant Performance', path: '/admin/analytics/restaurants' },
        { name: 'User Activity', path: '/admin/analytics/users' },
        { name: 'Reports', path: '/admin/analytics/reports' },
      ]
    },
    { 
      name: 'Payments', 
      icon: <FaMoneyBillWave size={20} />, 
      path: '/admin/payments',
      badge: null,
      subMenu: [
        { name: 'Transactions', path: '/admin/payments/transactions' },
        { name: 'Refunds', path: '/admin/payments/refunds' },
        { name: 'Payment Methods', path: '/admin/payments/methods' },
      ]
    },
    {
      name: 'Delivery',
      icon: <FaTruck size={20} />,
      path: '/admin/delivery',
      badge: null,
      subMenu: [
        { name: 'Delivery Orders', path: '/admin/delivery/orders' },
        { name: 'Drivers', path: '/admin/delivery/drivers' },
        { name: 'Tracking', path: '/admin/delivery/tracking' },
      ]
    },
    { 
      name: 'Reviews', 
      icon: <FaStar size={20} />, 
      path: '/admin/reviews',
      badge: null
    },
    { 
      name: 'Locations', 
      icon: <FaMapMarkerAlt size={20} />, 
      path: '/admin/locations',
      badge: null
    },
    // Add this to your menuItems array in AdminSidebar.jsx
    { 
      name: 'Messages', 
      icon: <FaEnvelope size={20} />, 
      path: '/admin/contacts',
      badge: null
    },
  ];

  const secondaryMenuItems = [
    { 
      name: 'Notifications', 
      icon: <FaBell size={20} />, 
      path: '/admin/notifications',
      badge: unreadNotifications || null,
      onClick: () => {}
    },
    { 
      name: 'Settings', 
      icon: <FaCog size={20} />, 
      path: '/admin/settings',
      onClick: () => {},
      subMenu: [
        { name: 'System Settings', path: '/admin/settings/system' },
        { name: 'User Preferences', path: '/admin/settings/preferences' },
        { name: 'Security', path: '/admin/settings/security' },
      ]
    },
    { 
      name: 'Help & Support', 
      icon: <FaQuestion size={20} />, 
      path: '/admin/support',
      onClick: () => {}
    },
    { 
      name: 'Logout', 
      icon: <FaSignOutAlt size={20} />, 
      path: '#',
      onClick: () => {
        Swal.fire({
          title: 'Are you sure?',
          text: "You will be logged out of the admin panel",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#f97316',
          cancelButtonColor: '#64748b',
          confirmButtonText: 'Yes, log out'
        }).then((result) => {
          if (result.isConfirmed) {
            toast.success('Successfully logged out');
            // Add your logout logic here
            // Example: navigate('/login');
          }
        });
      }
    }
  ];

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  // Animation variants for the sidebar
  const sidebarVariants = {
    expanded: { width: 280 },
    collapsed: { width: 70 }
  };

  // Animation variants for menu text
  const textVariants = {
    expanded: { opacity: 1, display: 'block' },
    collapsed: { opacity: 0, display: 'none' }
  };

  // Animation variants for the mobile menu
  const mobileMenuVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: '-100%', opacity: 0 }
  };

  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleSubMenu = (menuName) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      // Wait for the sidebar to expand before showing submenu
      setTimeout(() => {
        setExpandedMenus(prev => ({
          ...prev,
          [menuName]: !prev[menuName]
        }));
      }, 200);
    } else {
      setExpandedMenus(prev => ({
        ...prev,
        [menuName]: !prev[menuName]
      }));
    }
  };

  const SubMenu = ({ items, parentPath }) => {
    return (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="ml-8 mt-1 mb-2 overflow-hidden"
      >
        {items.map((subItem, index) => (
          <Link
            key={`${parentPath}-sub-${index}`}
            to={subItem.path}
            className={`flex items-center py-2 px-3 text-sm rounded-md transition-colors mb-1
              ${location.pathname === subItem.path || location.pathname.startsWith(subItem.path + '/')
                ? 'bg-orange-50 text-orange-600 font-medium'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
          >
            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full mr-2"></span>
            {subItem.name}
          </Link>
        ))}
      </motion.div>
    );
  };

  const MenuItem = ({ item }) => {
    const isActive = location.pathname === item.path || 
                    location.pathname.startsWith(item.path + '/') ||
                    (item.subMenu?.some(subItem => 
                      location.pathname === subItem.path || 
                      location.pathname.startsWith(subItem.path + '/')
                    ));
    
    const hasSubMenu = item.subMenu && item.subMenu.length > 0;
    
    return (
      <>
        <div 
          className={`flex items-center py-3 px-4 my-1 rounded-lg transition-all duration-200 cursor-pointer
            ${isActive
              ? 'bg-orange-100 text-orange-600 font-medium'
              : 'text-gray-600 hover:bg-gray-100'}`}
          onClick={() => hasSubMenu ? toggleSubMenu(item.name) : item.onClick ? item.onClick() : navigate(item.path)}
        >
          <div className="flex items-center justify-center">
            {React.cloneElement(item.icon, { 
              className: isActive ? 'text-orange-500' : 'text-gray-500'
            })}
          </div>
          <motion.span 
            variants={textVariants}
            initial={isCollapsed ? 'collapsed' : 'expanded'}
            animate={isCollapsed ? 'collapsed' : 'expanded'}
            className="ml-3 whitespace-nowrap flex-grow"
          >
            {item.name}
          </motion.span>
          
          {item.badge && (
            <motion.div 
              variants={textVariants}
              initial={isCollapsed ? 'collapsed' : 'expanded'}
              animate={isCollapsed ? 'collapsed' : 'expanded'}
              className="ml-auto bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full"
            >
              {item.badge}
            </motion.div>
          )}
          
          {hasSubMenu && !isCollapsed && (
            <motion.div 
              animate={{ rotate: expandedMenus[item.name] ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="ml-2 text-gray-400"
            >
              <FaStream size={12} />
            </motion.div>
          )}
        </div>
        
        {/* Sub menu items */}
        {!isCollapsed && hasSubMenu && (
          <AnimatePresence>
            {expandedMenus[item.name] && (
              <SubMenu items={item.subMenu} parentPath={item.path} />
            )}
          </AnimatePresence>
        )}
      </>
    );
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={toggleMobileMenu}
          className="text-gray-600 focus:outline-none bg-white p-2 rounded-lg shadow-md hover:bg-gray-50"
        >
          {showMobileMenu ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleMobileMenu}
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={mobileMenuVariants}
            transition={{ type: 'tween' }}
            className="lg:hidden fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-50 overflow-y-auto"
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-2 rounded-lg">
                    <FaUserShield size={18} />
                  </div>
                  <span className="font-bold text-gray-800 text-lg">DigiDine Admin</span>
                </div>
                <button 
                  onClick={toggleMobileMenu}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <FaTimes size={20} />
                </button>
              </div>
            </div>

            <div className="p-4">
              {user && (
                <div className="flex items-center space-x-3 mb-6 pb-5 border-b border-gray-200">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold">
                    {user.name?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{user?.name || 'Admin User'}</h3>
                    <p className="text-xs text-gray-500">{user?.email || 'admin@digidine.com'}</p>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                {menuItems.map((item, index) => (
                  <div key={index}>
                    <div 
                      className={`flex items-center py-3 px-3 rounded-lg transition-all duration-200 ${
                        location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                          ? 'bg-orange-100 text-orange-600 font-medium' 
                          : 'text-gray-600 hover:bg-gray-100'
                      } cursor-pointer`}
                      onClick={() => {
                        if (item.subMenu && item.subMenu.length > 0) {
                          setExpandedMenus(prev => ({
                            ...prev,
                            [item.name]: !prev[item.name]
                          }));
                        } else {
                          navigate(item.path);
                          setShowMobileMenu(false);
                        }
                      }}
                    >
                      <div className="mr-3 text-gray-500">
                        {React.cloneElement(item.icon, { 
                          className: location.pathname === item.path || location.pathname.startsWith(item.path + '/') 
                            ? 'text-orange-500' 
                            : 'text-gray-500'
                        })}
                      </div>
                      <span className="flex-grow">{item.name}</span>
                      {item.badge && (
                        <div className="ml-auto bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                          {item.badge}
                        </div>
                      )}
                      {item.subMenu && item.subMenu.length > 0 && (
                        <motion.div 
                          animate={{ rotate: expandedMenus[item.name] ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="ml-2 text-gray-400"
                        >
                          <FaStream size={12} />
                        </motion.div>
                      )}
                    </div>
                    
                    {/* Mobile Submenu */}
                    <AnimatePresence>
                      {item.subMenu && expandedMenus[item.name] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="ml-8 mt-1 mb-2 overflow-hidden"
                        >
                          {item.subMenu.map((subItem, subIndex) => (
                            <div
                              key={subIndex}
                              className={`flex items-center py-2 px-3 text-sm rounded-md transition-colors mb-1
                                ${location.pathname === subItem.path || location.pathname.startsWith(subItem.path + '/')
                                  ? 'bg-orange-50 text-orange-600 font-medium'
                                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                } cursor-pointer`}
                              onClick={() => {
                                navigate(subItem.path);
                                setShowMobileMenu(false);
                              }}
                            >
                              <span className="w-1.5 h-1.5 bg-gray-300 rounded-full mr-2"></span>
                              {subItem.name}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 space-y-1">
                {secondaryMenuItems.map((item, index) => (
                  <div key={index}>
                    <div 
                      className="flex items-center py-3 px-3 rounded-lg transition-all duration-200 text-gray-600 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        if (item.onClick) {
                          item.onClick();
                        } else if (item.subMenu && item.subMenu.length > 0) {
                          setExpandedMenus(prev => ({
                            ...prev,
                            [item.name]: !prev[item.name]
                          }));
                        } else {
                          navigate(item.path);
                          setShowMobileMenu(false);
                        }
                      }}
                    >
                      <div className="mr-3 text-gray-500">{item.icon}</div>
                      <span className="flex-grow">{item.name}</span>
                      {item.badge && (
                        <div className="ml-auto bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                          {item.badge}
                        </div>
                      )}
                      {item.subMenu && item.subMenu.length > 0 && (
                        <motion.div 
                          animate={{ rotate: expandedMenus[item.name] ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="ml-2 text-gray-400"
                        >
                          <FaStream size={12} />
                        </motion.div>
                      )}
                    </div>
                    
                    {/* Mobile Secondary Submenu */}
                    <AnimatePresence>
                      {item.subMenu && expandedMenus[item.name] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="ml-8 mt-1 mb-2 overflow-hidden"
                        >
                          {item.subMenu.map((subItem, subIndex) => (
                            <div
                              key={subIndex}
                              className={`flex items-center py-2 px-3 text-sm rounded-md transition-colors mb-1
                                ${location.pathname === subItem.path || location.pathname.startsWith(subItem.path + '/')
                                  ? 'bg-orange-50 text-orange-600 font-medium'
                                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                } cursor-pointer`}
                              onClick={() => {
                                navigate(subItem.path);
                                setShowMobileMenu(false);
                              }}
                            >
                              <span className="w-1.5 h-1.5 bg-gray-300 rounded-full mr-2"></span>
                              {subItem.name}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.div
        variants={sidebarVariants}
        initial={isCollapsed ? 'collapsed' : 'expanded'}
        animate={isCollapsed ? 'collapsed' : 'expanded'}
        transition={{ type: 'tween', duration: 0.2 }}
        className="hidden lg:block fixed top-0 left-0 h-full bg-white shadow-md z-30 overflow-hidden"
      >
        <div className="h-full flex flex-col">
          {/* Logo and Toggle */}
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-4 border-b border-gray-200`}>
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-2 rounded-lg">
                  <FaUserShield size={18} />
                </div>
                <span className="font-bold text-gray-800">DigiDine Admin</span>
              </div>
            )}
            <button
              onClick={toggleCollapse}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <FaBars size={20} />
            </button>
          </div>

          {/* Admin Profile */}
          {user && !isCollapsed && (
            <div className="flex items-center space-x-3 p-4 mb-2 border-b border-gray-200">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold">
                {user.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div>
                <h3 className="font-medium text-gray-800">{user?.name || 'Admin User'}</h3>
                <p className="text-xs text-gray-500">{user?.email || 'admin@digidine.com'}</p>
              </div>
            </div>
          )}

          {/* Main Menu */}
          <div className="flex-1 px-3 py-2 overflow-y-auto">
            <div className="space-y-0.5">
              {menuItems.map((item, index) => (
                <MenuItem key={index} item={item} />
              ))}
            </div>
          </div>

          {/* Secondary Menu */}
          <div className="px-3 py-4 border-t border-gray-200">
            <div className="space-y-0.5">
              {secondaryMenuItems.map((item, index) => (
                <MenuItem key={index} item={item} />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default AdminSidebar;