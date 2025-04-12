import React from 'react';

const PaymentSection = ({ paymentMethod, totalAmount, onUpdateOrder }) => {
  const handlePayment = () => {
    // Redirect to payment gateway or handle payment logic
    alert('Redirecting to payment gateway...');
  };

  return (
    <div className="mt-6 bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-bold mb-4">Payment</h2>
      <p className="text-gray-600 mb-4">Total Amount: ${totalAmount.toFixed(2)}</p>
      {paymentMethod === 'Cash on delivery' ? (
        <button
          onClick={onUpdateOrder}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-300"
        >
          Update Order
        </button>
      ) : (
        <button
          onClick={handlePayment}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors duration-300"
        >
          Pay Here
        </button>
      )}
    </div>
  );
};

export default PaymentSection;