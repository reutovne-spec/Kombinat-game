import React from 'react';

interface ExperienceBarProps {
  level: number;
  currentXp: number;
  xpForNextLevel: number;
}

const ExperienceBar: React.FC<ExperienceBarProps> = ({ level, currentXp, xpForNextLevel }) => {
  const progressPercentage = xpForNextLevel > 0 ? (currentXp / xpForNextLevel) * 100 : 0;

  return (
    <div className="w-full max-w-lg mx-auto mb-8">
      <div className="flex justify-between items-center mb-1 text-gray-300">
        <span className="font-bold text-lg uppercase tracking-wider">Уровень {level}</span>
        <span className="text-sm font-mono bg-gray-900/50 px-2 py-1 rounded">
          {currentXp} / {xpForNextLevel} XP
        </span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-4 shadow-inner overflow-hidden border-2 border-gray-600">
        <div
          className="bg-green-500 h-full rounded-full transition-all duration-500 ease-out"
          style={{ 
            width: `${progressPercentage}%`,
            background: 'linear-gradient(to right, #4ade80, #16a34a)',
            boxShadow: '0 0 8px #4ade80'
          }}
        ></div>
      </div>
    </div>
  );
};

export default ExperienceBar;
