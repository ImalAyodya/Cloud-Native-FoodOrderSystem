import { useState,useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useParams } from "react-router-dom";
import "./App.css";
import Home from "./pages/Main/Home";
import AboutUs from "./pages/Main/AboutUs";
import ContactUs from "./pages/Main/ContactUs";
import Cart from "./pages/Main/Cart";
import MyOrders from "./pages/Main/MyOrders";
import AdminOrderDashboard from "./pages/Admin/Order/AdminOrderDashboard";
import AdminLayout from "./components/Admin/Order/AdminLayout";

import AdminDashboard from "./pages/Admin/AdminDashboard";
import Profile from "./pages/User/Profile";
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

import PaymentSuccessPage from './pages/Main/PaymentSuccessPage';
import PaymentCancelPage from './pages/Main/PaymentSuccessPage';
import RestaurantOrdersPage from "./pages/ResturentOrder/ResturentOrders";

import ContactTable from './components/Admin/Contact/ContactTable';
import MainAdminDashboard from './pages/Admin/AdminDashboard'


import ContactManagement from './pages/Admin/Contact/ContactManagement';
import ContactDetail from './pages/Admin/Contact/ContactDetail';

import RequestPasswordReset from "./pages/User/RequestPasswordReset";
import ResetPassword from "./pages/User/ResetPassword";
import UserProfile from "./pages/User/UserProfile";
import EditUser from "./pages/Admin/User/EditUser";


import RestaurantRegister from "./pages/Main/RestaurantRegister"
import PaymentDashboard from "./pages/Admin/Payment/PaymentDashboard";
import DeliveryDashboard from "./pages/Driver/DeliveryDashboard";
import DriverDeliveryManager from "./components/Delivery/DriverDeliveryManager";
import MyDeliveries from "./pages/Driver/MyDeliveries";
import authService from './services/authService';
import OrderDetailsPage from './pages/Driver/OrderDetailsPage';
import DriverProfile from './pages/Driver/DriverProfile';
import DeliveryManagement from './pages/Admin/DeliveryManagement';

import NotFoundPage from './pages/Errors/NotFoundPage';
import UnauthorizedPage from './pages/Errors/UnauthorizedPage';


function App() {
  useEffect(() => {
    // Initialize authentication when app starts
    authService.initializeAuth();
  }, []);

  return (
    <Router>
      <Routes>



        <Route 
          path="/DeliveryDashboard" 
          element={
            (() => {
              console.log("Rendering DeliveryDashboard route");
              const userData = localStorage.getItem('userData');
              console.log("userData in route:", userData);
              return <DeliveryDashboard />;
            })()
          } 
        />
        {/* <Route path="/" element={<Root />} /> */}
        <Route path="/" element={<Root />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/restaurant/register' element={<RestaurantRegister />} />
        <Route path="/home" element={<Home />} />
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
            <MainAdminDashboard />
          </ProtectedRoutes>
        } />
        <Route path="/admin/orders" element={
          <ProtectedRoutes requireRole={["admin"]}>
            <AllOrders />
          </ProtectedRoutes>
        } />
        <Route path="/order/dashboard" element={
          <ProtectedRoutes requireRole={["admin"]}>
            <AdminOrderDashboard />
          </ProtectedRoutes>
        } />

        {/* Order Update Page */}
        <Route path="/orders/update/:orderId" 
          element={<ProtectedRoutes requireRole={["admin"]}>
            <OrderUpdatePage />
        </ProtectedRoutes>} />

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
              <AdminOrderDashboard />
            </ProtectedRoutes>
          }
        />
        <Route path="/admin/dashboard" element={
          <ProtectedRoutes requireRole={["admin"]}>
            <AdminDashboard />
          </ProtectedRoutes>
      } />
        <Route 
          path="user/dashboard" 
          element={<ProtectedRoutes requireRole={["admin"]}>
              <UserDashboard />
          </ProtectedRoutes>} 
        />  

        {/* Admin Pages */}
        <Route path="/admin" 
          element={<ProtectedRoutes requireRole={["admin"]}>
            <AdminLayout />
        </ProtectedRoutes>} />

        <Route path="/admin/orders" 
          element={<ProtectedRoutes requireRole={["admin"]}>
            <AllOrders />
        </ProtectedRoutes>} />

        <Route path="/order/dashboard" 
          element={<ProtectedRoutes requireRole={["admin"]}>
            <AdminOrderDashboard />
        </ProtectedRoutes>} />

        <Route path="/admin/payments" element={
          <ProtectedRoutes requireRole={["admin"]}>
            <PaymentDashboard />
          </ProtectedRoutes>
        } />

        {/* Restaurant Management Pages */}
        <Route path="/restaurant/dashboard" 
          element={<ProtectedRoutes requireRole={["admin"]}>
            <RestaurantManagementDashboard />
        </ProtectedRoutes>} />

        <Route path="/restaurant/list" 
          element={<ProtectedRoutes requireRole={["admin"]}>
            <RestaurantList />
        </ProtectedRoutes>} />

        <Route path="/restaurant/:restaurantId/menu" 
          element={<ProtectedRoutes requireRole={["admin"]}>
            <MenuItemManagement />
        </ProtectedRoutes>} />

        <Route path="/restaurant/my-restaurants" 
          element={<ProtectedRoutes requireRole={["admin","restaurant_owner"]}>
            <MyRestaurants />
        </ProtectedRoutes>} />

        <Route path="/restaurant/add" 
          element={<ProtectedRoutes requireRole={["admin","restaurant_owner"]}>
            <AddRestaurant />
        </ProtectedRoutes>} />

        <Route path="/restaurant/dashboard/:id" 
          element={<ProtectedRoutes requireRole={["admin","restaurant_owner"]}>
            <RestaurantManagementDashboard />
        </ProtectedRoutes>} />

        <Route path="/restaurant/:id/orders" 
          element={<ProtectedRoutes requireRole={["admin","restaurant_owner"]}> 
            <RestaurantOrdersPage /> 
        </ProtectedRoutes>} />

        

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

        {/* Driver routes */}
        <Route 
          path="/driver/delivery/:driverId/:orderId" 
          element={
            <ProtectedRoutes requireRole={["delivery_person"]}>
              <DriverDeliveryManager />
            </ProtectedRoutes>
          } 
        />
        <Route path="/driver/my-deliveries" 
          element={<ProtectedRoutes requireRole={["delivery_person"]}> 
            <MyDeliveries /> 
          </ProtectedRoutes>} />

        <Route path="/driver/profile" 
          element={<ProtectedRoutes requireRole={["delivery_person"]}> 
            <DriverProfile />
          </ProtectedRoutes>} />

        {/* Order update page */}
        <Route path="unauthorized" element={<UnauthorizedPage />} />

        {/* Order Details Page */}
        <Route path="/order/:orderId" element={<OrderDetailsPage />} />

        {/* Delivery Management Page */}
        <Route path="/admin/delivery" 
          element={<ProtectedRoutes requireRole={["admin"]}> 
            <DeliveryManagement /> 
          </ProtectedRoutes>} />
      
      <Route path="*" element={<NotFoundPage />} /> 
      </Routes>
    </Router>
  );
}

export default App;