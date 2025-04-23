import React from "react";
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
import UserDashboard from "./pages/Admin/User/Dashboard";
import UserManagement from "./pages/Admin/User/UserManagement";
import ProtectedRoutes from "./utils/ProtectedRoutes";


import AllOrders from "./pages/Admin/Order/AllOrders";
import OrderUpdatePage from "./pages/Order/OrderUpdatePage";
import Menu from "./pages/Main/Menu";
import Checkout from "./pages/Main/CheckoutPage";
import Resturent from "./pages/Main/Resturent";
import LoginPage from "./pages/Main/Login";


function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Root />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Home />} />

        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/myOrders" element={<MyOrders />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/resturents" element={<Resturent />} />


        
        <Route path="/admin" element={<AdminLayout />}/>
        
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

        {/* Order Update Page */}
        <Route path="/orders/update/:orderId" element={<OrderUpdatePage />} />

      </Routes>
    </Router>
  );
}

export default App;