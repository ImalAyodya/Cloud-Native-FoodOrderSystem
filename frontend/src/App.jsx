import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/Main/Home";
import AboutUs from "./pages/Main/AboutUs";
import ContactUs from "./pages/Main/ContactUs";
import Cart from "./pages/Main/Cart";
import MyOrders from "./pages/Main/MyOrders";
import AdminDashboard from "./pages/Admin/Order/AdminDashboard";
import AdminLayout from "./components/Admin/Order/AdminLayout";

import Root from "./components/Root";
import Login from "./pages/Main/Login";
import Register from "./pages/Main/Register";
import UserDashboard from "./pages/Admin/User/Dashboard";
import UserManagement from "./pages/Admin/UserManagement";
import ProtectedRoutes from "./utils/ProtectedRoutes";

import VerifyEmail from "./pages/Auth/VerifyEmail";


import AllOrders from "./pages/Admin/Order/AllOrders";
import OrderUpdatePage from "./pages/Order/OrderUpdatePage";
import Menu from "./pages/Main/Menu";
import Checkout from "./pages/Main/CheckoutPage";
import Resturent from "./pages/Main/Resturent";
import LoginPage from "./pages/Main/Login";
import RestaurantManagementDashboard from "./pages/Restaurant/RestaurantManagementDashboard";
import RestaurantList from "./pages/Restaurant/RestaurantList";
import MenuItemManagement from "./pages/Restaurant/MenuItemManagement";
import MyRestaurants from "./pages/Restaurant/MyRestaurants";
import AddRestaurant from "./pages/Restaurant/AddRestaurant";
import AddMenuItem from './pages/Restaurant/AddMenuItem';

import PaymentSuccessPage from './pages/Main/PaymentSuccessPage';
import PaymentCancelPage from './pages/Main/PaymentSuccessPage';
import RestaurantOrdersPage from "./pages/ResturentOrder/ResturentOrders";

import ContactTable from './components/Admin/Contact/ContactTable';


import ContactManagement from './pages/Admin/Contact/ContactManagement';
import ContactDetail from './pages/Admin/Contact/ContactDetail';

import RequestPasswordReset from "./pages/User/RequestPasswordReset";
import ResetPassword from "./pages/User/ResetPassword";
import UserProfile from "./pages/User/UserProfile";
import EditUser from "./pages/Admin/User/EditUser";

import authService from './services/authService';

function App() {
  useEffect(() => {
    // Initialize authentication when app starts
    authService.initializeAuth();
  }, []);

  return (
    <Router>
      <Routes>

        {/* <Route path="/" element={<Root />} /> */}
        <Route path="/" element={<Root />} />
        <Route path="/login" element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path="/dashboard" element={<Home />} />
        <Route path="/verification-sent" element={<VerifyEmail />} />

        
        {/* Public routes */}
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/resturents" element={<Resturent />} />
        
        {/* Protected customer routes */}
        <Route path="/cart" element={
          <ProtectedRoutes requireRole={["customer", "admin"]}>
            <Cart />
          </ProtectedRoutes>
        } />
        <Route path="/myOrders" element={
          <ProtectedRoutes requireRole={["customer", "admin"]}>
            <MyOrders />
          </ProtectedRoutes>
        } />
        <Route path="/checkout" element={
          <ProtectedRoutes requireRole={["customer", "admin"]}>
            <Checkout />
          </ProtectedRoutes>
        } />

        {/* Admin routes */}
        <Route path="/admin" element={
          <ProtectedRoutes requireRole={["admin"]}>
            <AdminLayout />
          </ProtectedRoutes>
        } />
        <Route path="/admin/orders" element={
          <ProtectedRoutes requireRole={["admin"]}>
            <AllOrders />
          </ProtectedRoutes>
        } />
        <Route path="/order/dashboard" element={
          <ProtectedRoutes requireRole={["admin"]}>
            <AdminDashboard />
          </ProtectedRoutes>
        } />
        {/* <Route path="/user/dashboard" element={
          <ProtectedRoutes requireRole={["admin"]}>
            <UserDashboard />
          </ProtectedRoutes>
        } />
        <Route path="/user/management" element={
          <ProtectedRoutes requireRole={["admin"]}>
            <UserManagement />
          </ProtectedRoutes>
        } /> */}

        {/* User Management Protected Routes */}
        <Route path="/user/management" element={
          <ProtectedRoutes requireRole={["admin"]}>
            <UserManagement />
          </ProtectedRoutes>
        } />
        <Route path="/admin/users/:userId" element={
          <ProtectedRoutes requireRole={["admin"]}>
            <UserProfile />
          </ProtectedRoutes>
        } />
        <Route path="/admin/users/edit/:userId" element={
          <ProtectedRoutes requireRole={["admin"]}>
            <EditUser />
          </ProtectedRoutes>
        } />
        
        {/* Public Authentication Routes */}
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/request-password-reset" element={<RequestPasswordReset />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        <Route
          path="/order/dashboard"
          element={
            <ProtectedRoutes requireRole={["admin"]}>
              <AdminDashboard />
            </ProtectedRoutes>
          }
        />
        <Route 
          path="user/dashboard" 
          element={<ProtectedRoutes requireRole={["admin"]}>
              <UserDashboard />
          </ProtectedRoutes>} 
        />
        <Route path="user/management" element={<UserManagement />} />
        <Route path="unauthorized" element={<p className="font bold text-3xl mt-20 ml-20">Unauthorized</p>} />

          

        {/* Admin Pages */}
        <Route path="/admin" element={<AdminLayout />} />
        <Route path="/admin/orders" element={<AllOrders />} />
        <Route path="/order/dashboard" element={<AdminDashboard />} />

        {/* Restaurant Management Pages */}
        <Route path="/restaurant/dashboard" element={<RestaurantManagementDashboard />} />
        <Route path="/restaurant/list" element={<RestaurantList />} />
        <Route path="/restaurant/:restaurantId/menu" element={<MenuItemManagement />} />
        <Route path="/restaurant/my-restaurants" element={<MyRestaurants />} />
        <Route path="/restaurant/add" element={<AddRestaurant />} />
        <Route path="/restaurant/dashboard/:id" element={<RestaurantManagementDashboard />} />
        <Route path="/add-menu-item" element={<AddMenuItem />} />
        <Route path="/restaurant/:restaurantId/add-menu-item" element={<AddMenuItem />} />

        <Route path="/restaurant/:id/orders" element={<RestaurantOrdersPage />} />
        {/* Order Update Page */}
        <Route path="/orders/update/:orderId" element={<OrderUpdatePage />} />

        {/* Payment routes */}
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/payment/cancel" element={<PaymentCancelPage />} />
        
        {/* Contact management routes */}
        <Route path="/admin/contacts" element={
          <ProtectedRoutes requireRole={["admin"]}>
            <ContactManagement />
          </ProtectedRoutes>
        } />
        <Route path="/admin/contacts/:id" element={
          <ProtectedRoutes requireRole={["admin"]}>
            <ContactDetail />
          </ProtectedRoutes>
        } />

        {/* Order update page */}
        <Route path="unauthorized" element={<p className="font bold text-3xl mt-20 ml-20">Unauthorized</p>} />
      
      </Routes>
    </Router>
  );
}

export default App;