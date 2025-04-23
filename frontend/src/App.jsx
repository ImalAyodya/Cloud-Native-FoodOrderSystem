import { useState } from "react";
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

          
      </Routes>
    </Router>
  );
}

export default App;
