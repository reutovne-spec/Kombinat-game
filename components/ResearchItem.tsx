
import React, { useState, useEffect } from 'react';
import Button from './Button';
import { ResearchType } from '../types';
import { getResearchCost, getResearchDurationMs } from '../constants';

interface ActiveResearch {
  type: ResearchType;
  endTime: number;
}

interface ResearchItemProps {
  type: ResearchType;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  onStartResearch: (type: ResearchType) => void;
  activeResearch: ActiveResearch | null;
  balance: number;
}

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

const ResearchItem: React.FC<ResearchItemProps> = ({ type, name, description, level, maxLevel, onStartResearch, activeResearch, balance }) => {
  const isThisResearchActive = activeResearch?.type === type;

  const getInitialRemainingTime = () => {
    if (isThisResearchActive) {
      const timeLeft = activeResearch.endTime - Date.now();
      return timeLeft > 0 ? timeLeft : 0;
    }
    return 0;
  };
  
  const [remainingTime, setRemainingTime] = useState(getInitialRemainingTime);

  const isAnotherResearchActive = activeResearch !== null && !isThisResearchActive;
  const isMaxLevel = level >= maxLevel;

  const nextLevel = level + 1;
  const cost = getResearchCost(nextLevel);
  const durationMs = getResearchDurationMs(nextLevel);
  const canAfford = balance >= cost;

  useEffect(() => {
    if (isThisResearchActive) {
      const interval = setInterval(() => {
        const timeLeft = activeResearch.endTime - Date.now();
        setRemainingTime(timeLeft > 0 ? timeLeft : 0);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isThisResearchActive, activeResearch]);
  
  const getButtonState = () => {
    if (isMaxLevel) {
      return { text: 'Макс. уровень', disabled: true };
    }
    if (isThisResearchActive) {
      return { text: `Изучается: ${formatTime(remainingTime)}`, disabled: true };
    }
    if (isAnotherResearchActive) {
      return { text: 'Идет другое исследование', disabled: true };
    }
    if (!canAfford) {
      return { text: 'Недостаточно плавок', disabled: true };
    }
    return { text: 'Изучить', disabled: false };
  }

  const { text: buttonText, disabled: isButtonDisabled } = getButtonState();

  return (
    <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700 text-left flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex-grow">
        <h3 className="text-xl font-bold text-white">{name}</h3>
        <p className="text-gray-400 text-sm mb-2">{description}</p>
        <div className="flex items-center gap-4">
          <span className="font-semibold text-cyan-400">Уровень: {level} / {maxLevel}</span>
          {!isMaxLevel && (
            <div className="text-sm font-mono bg-gray-800 px-2 py-1 rounded">
              <span>Стоимость: {cost} | </span>
              <span>Время: {formatTime(durationMs)}</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex-shrink-0 w-full sm:w-auto">
        <Button 
          onClick={() => onStartResearch(type)}
          disabled={isButtonDisabled}
          variant={isButtonDisabled ? 'secondary' : 'primary'}
          className="w-full"
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
};

export default ResearchItem;