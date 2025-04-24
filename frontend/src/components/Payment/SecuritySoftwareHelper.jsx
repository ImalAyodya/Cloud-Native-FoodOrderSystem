import React, { useState, useEffect } from 'react';
import { FaShieldAlt, FaInfoCircle } from 'react-icons/fa';

const SecuritySoftwareHelper = () => {
  const [securitySoftwareDetected, setSecuritySoftwareDetected] = useState(false);
  const [showHelper, setShowHelper] = useState(false);

  useEffect(() => {
    // Detect Kaspersky and similar security software
    const detectSecuritySoftware = () => {
      // Check for Kaspersky script injection attempt
      const kasperskyElements = document.querySelectorAll('script[src*="kaspersky"]');
      const scriptErrors = [];
      
      // Listen for script loading errors
      const handleError = (event) => {
        if (event.target.tagName === 'SCRIPT' && event.target.src) {
          scriptErrors.push(event.target.src);
        }
        
        if (event.message && event.message.includes('Refused to load')) {
          setSecuritySoftwareDetected(true);
        }
      };
      
      window.addEventListener('error', handleError, true);
      
      // After a small delay, check if we detected any security software
      setTimeout(() => {
        if (kasperskyElements.length > 0 || scriptErrors.length > 0) {
          setSecuritySoftwareDetected(true);
        }
        window.removeEventListener('error', handleError, true);
      }, 1000);
    };
    
    detectSecuritySoftware();
  }, []);

  if (!securitySoftwareDetected && !showHelper) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4 text-sm">
      <div className="flex items-start">
        <FaShieldAlt className="text-yellow-500 mt-1 mr-3" />
        <div>
          <p className="font-medium text-yellow-800">Security Software Detected</p>
          <p className="mt-1 text-yellow-700">
            We've detected that you might be using Kaspersky or similar security software, which can interfere
            with payment processing.
          </p>
          <div className="mt-3">
            <button
              onClick={() => setShowHelper(!showHelper)}
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              <FaInfoCircle className="mr-1" /> 
              {showHelper ? 'Hide instructions' : 'Show instructions to fix'}
            </button>
          </div>
          
          {showHelper && (
            <div className="mt-3 p-3 bg-white rounded-md border border-gray-200">
              <p className="font-medium mb-2">How to fix:</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Temporarily disable your security software protection</li>
                <li>Add this website to your security software's exceptions list</li>
                <li>Try using a different browser</li>
                <li>If all else fails, you can choose "Cash on Delivery" instead</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecuritySoftwareHelper;