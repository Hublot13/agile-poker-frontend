import React from 'react';

interface VotingCardProps {
  value: string | number;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export const VotingCard: React.FC<VotingCardProps> = ({
  value,
  selected = false,
  disabled = false,
  onClick
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative w-16 h-24 sm:w-20 sm:h-28 rounded-lg border-2 font-bold text-lg sm:text-xl
        transition-all duration-200 transform hover:scale-105 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${
          selected
            ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
            : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
        }
      `}
    >
      <span className="absolute inset-0 flex items-center justify-center">
        {value}
      </span>
    </button>
  );
};