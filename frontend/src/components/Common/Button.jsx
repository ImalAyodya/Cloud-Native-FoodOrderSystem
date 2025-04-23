import React from 'react';

const Button = ({ onClick, children, className = '', disabled = false }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md text-white bg-blue-500 hover:bg-blue-600 transition duration-200 ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;