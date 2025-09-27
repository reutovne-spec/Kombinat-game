
import React from 'react';

interface TimerProps {
  remainingTime: number;
}

const Timer: React.FC<TimerProps> = ({ remainingTime }) => {
  const formatTime = (ms: number) => {
    if (ms < 0) ms = 0;
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
      .map(v => v.toString().padStart(2, '0'))
      .join(':');
  };

  return (
    <div className="text-center bg-gray-900/50 p-8 rounded-xl shadow-inner border-2 border-gray-700">
      <p className="text-lg font-semibold text-gray-400 uppercase tracking-widest">До конца смены</p>
      <p className="text-7xl font-mono font-bold text-yellow-400 tracking-wider">
        {formatTime(remainingTime)}
      </p>
    </div>
  );
};

export default Timer;
