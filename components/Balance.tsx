
import React from 'react';

interface BalanceProps {
  amount: number;
}

const IngotIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 inline-block mr-3 text-yellow-400" {...props}>
        <path d="M2 20h20v2H2zM4.04 17h15.92l-1.6-4H5.64zM6.84 11h10.32l-1.2-3H8.04zM11.24 6h1.52l-.4-1h-0.72z" />
    </svg>
);

const Balance: React.FC<BalanceProps> = ({ amount }) => {
  return (
    <div className="absolute top-5 right-5 bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-lg px-6 py-3 shadow-lg flex items-center">
      <IngotIcon />
      <div>
        <span className="text-2xl font-bold text-white">{amount}</span>
        <span className="ml-2 text-gray-400 font-semibold">плавок</span>
      </div>
    </div>
  );
};

export default Balance;
