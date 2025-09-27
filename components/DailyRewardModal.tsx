import React from 'react';
import Button from './Button';

interface DailyRewardModalProps {
  onClaim: () => void;
  rewardAmount: number;
  streakDay: number;
}

const DailyRewardModal: React.FC<DailyRewardModalProps> = ({ onClaim, rewardAmount, streakDay }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border-2 border-yellow-500 rounded-xl shadow-2xl p-8 max-w-md w-full text-center transform transition-all animate-fade-in-down">
        <h2 className="text-3xl font-bold text-yellow-400 mb-2">Ежедневный бонус!</h2>
        <p className="text-lg font-semibold text-gray-300 mb-4">Серия входов: {streakDay} {streakDay > 1 ? (streakDay > 4 ? 'дней' : 'дня') : 'день'}</p>
        <p className="text-gray-400 text-md mb-6">
          Добро пожаловать обратно! За ваш упорный труд, получите награду.
        </p>
        <div className="bg-gray-900/50 p-4 rounded-lg mb-8 border border-gray-700">
            <p className="text-4xl font-bold text-white">+{rewardAmount} плавок</p>
        </div>
        <Button onClick={onClaim}>
          Забрать награду
        </Button>
      </div>
    </div>
  );
};

export default DailyRewardModal;