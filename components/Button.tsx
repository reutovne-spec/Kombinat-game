
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className, ...props }) => {
  const baseClasses = "px-8 py-4 text-xl font-bold rounded-lg shadow-lg transition-all duration-300 ease-in-out transform focus:outline-none focus:ring-4 focus:ring-opacity-50";
  
  const variantClasses = {
    primary: "bg-yellow-500 hover:bg-yellow-600 text-gray-900 focus:ring-yellow-400 active:scale-95 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed",
    secondary: "bg-gray-700 hover:bg-gray-600 text-white focus:ring-gray-500 active:scale-95 disabled:bg-gray-800 disabled:cursor-not-allowed"
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className || ''}`} {...props}>
      {children}
    </button>
  );
};

export default Button;