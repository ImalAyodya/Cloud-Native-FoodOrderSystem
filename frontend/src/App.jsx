import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify"; // Import Toastify components
import "react-toastify/dist/ReactToastify.css"; // Import Toastify CSS

function App() {
  const [count, setCount] = useState(0);

  const showToast = () => {
    toast.success("This is a success toast!");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-red-500 to-indigo-600 text-white p-6">
      {/* Logo Section */}
      <div className="flex space-x-8 mb-8">
        <a href="https://vite.dev" target="_blank">
          <motion.img
            src={viteLogo}
            className="h-24 transition-transform duration-500 transform hover:scale-110 hover:rotate-12"
            alt="Vite logo"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          />
        </a>
        <a href="https://react.dev" target="_blank">
          <motion.img
            src={reactLogo}
            className="h-24 transition-transform duration-500 transform hover:scale-110 hover:rotate-12"
            alt="React logo"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          />
        </a>
      </div>

      {/* Title */}
      <motion.h1
        className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 mb-6"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
      >
        Vite + React
      </motion.h1>

      {/* Card Section */}
      <motion.div
        className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full text-gray-800 space-y-6"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-xl font-semibold text-center">Click the button to increase the count:</h2>
        <button
          className="w-full py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transform hover:scale-105 transition duration-300"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
        <button
          className="w-full py-3 mt-4 text-lg font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 transform hover:scale-105 transition duration-300"
          onClick={showToast} // Show toast on button click
        >
          Show Toast
        </button>
        <p className="text-center text-gray-500">
          Edit <code className="bg-gray-200 px-2 py-1 rounded-md">src/App.jsx</code> and save to test HMR
        </p>
      </motion.div>

      {/* Footer Section */}
      <p className="mt-10 text-center text-gray-300">
        Click on the Vite and React logos to learn more.
      </p>

      {/* Toast Container */}
      <ToastContainer /> {/* Toast container to display toasts */}
    </div>
  );
}

export default App;
