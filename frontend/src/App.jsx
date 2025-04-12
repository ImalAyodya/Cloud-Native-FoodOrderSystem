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
import AllOrders from "./pages/Admin/Order/AllOrders";
import OrderUpdatePage from "./pages/Order/OrderUpdatePage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Main Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/myOrders" element={<MyOrders />} />

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