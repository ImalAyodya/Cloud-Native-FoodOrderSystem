import React from 'react';

const PaymentSection = ({ paymentMethod, totalAmount }) => {
  return (
    <div className="mt-3">
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {paymentMethod === 'Credit Card' && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            )}
            {paymentMethod === 'Cash on delivery' && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
            )}
            {paymentMethod === 'PayPal' && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="font-medium">{paymentMethod}</span>
          </div>
          <span className="text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded-full">Cannot change</span>
        </div>
        <p className="mt-3 text-sm text-gray-500">
          Payment method cannot be changed for existing orders. Your additional items will be charged using the same method.
        </p>
        {totalAmount > 0 && (
          <div className="mt-2 p-2 bg-orange-50 border border-orange-100 rounded text-sm">
            <span className="font-medium text-orange-700">Additional charge: </span>
            <span className="text-orange-700">${totalAmount.toFixed(2)}</span>
          </div>
        )}
        {paymentMethod === 'Cash on delivery' ? (
          <div className="mt-2 p-2 bg-green-50 border border-green-100 rounded text-sm">
            <span className="font-medium text-green-700">Cash on Delivery: </span>
            <span className="text-green-700">You can modify or remove any items.</span>
          </div>
        ) : (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-100 rounded text-sm">
            <span className="font-medium text-yellow-700">Online Payment: </span>
            <span className="text-yellow-700">You cannot remove original items, only add new ones.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSection;