import React from 'react';

interface ActionButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex-1 bg-gray-700/50 hover:bg-gray-600/70 disabled:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-in-out rounded-lg flex flex-col items-center justify-center p-2 text-center shadow-lg border border-gray-600 focus:outline-none focus:ring-4 focus:ring-yellow-500 focus:ring-opacity-50"
      aria-label={label}
    >
      <span className="text-3xl mb-1" role="img" aria-hidden="true">{icon}</span>
      <span className="font-semibold text-white text-xs whitespace-nowrap">{label}</span>
    </button>
  );
};

export default ActionButton;