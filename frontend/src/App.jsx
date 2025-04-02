import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/Main/Home";
import AboutUs from "./pages/Main/AboutUs";
import ContactUs from "./pages/Main/ContactUs";
function App() {
 

  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
