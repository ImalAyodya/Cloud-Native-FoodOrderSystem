import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useParams } from "react-router-dom";
import "./App.css";
import Home from "./pages/Main/Home";
import AboutUs from "./pages/Main/AboutUs";
import ContactUs from "./pages/Main/ContactUs";
import Cart from "./pages/Main/Cart";
import MyOrders from "./pages/Main/MyOrders";
import AdminDashboard from "./pages/Admin/Order/AdminDashboard";
import AdminLayout from "./components/Admin/Order/AdminLayout";
import DeliveryTracker from "./components/Delivery/DeliveryTracker";
import DriverDeliveryManager from "./components/Delivery/DriverDeliveryManager";
import DeliveryDashboard from "./components/Admin/delivery/DeliveryDashboard"

// Create a wrapper component to extract the URL parameter
function DeliveryTrackerWrapper() {
  const { deliveryId } = useParams();
  return <DeliveryTracker deliveryId={deliveryId} />;
}

// Create a wrapper for DriverDeliveryManager as well
function DriverDeliveryWrapper() {
  const { deliveryId } = useParams();
  // You might need to add driverId here as well if needed
  return <DriverDeliveryManager deliveryId={deliveryId} />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/myOrders" element={<MyOrders />} />
        
        <Route path="/admin" element={<AdminLayout />}/>
        
        <Route path="/order/dashboard" element={<AdminDashboard />} />
        <Route path="/delivery-tracker/:deliveryId" element={<DeliveryTrackerWrapper />} />
        <Route path="/driver-delivery/:deliveryId" element={<DriverDeliveryWrapper />} />
        <Route path="/DeliveryDashboard" element={<DeliveryDashboard/>} />
      </Routes>
    </Router>
  );
}

export default App;