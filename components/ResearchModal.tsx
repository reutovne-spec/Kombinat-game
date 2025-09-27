import React from 'react';
import { ResearchType } from '../types';
import ResearchItem from './ResearchItem';
import { MAX_RESEARCH_LEVEL, RESEARCH_BONUS_PER_LEVEL } from '../constants';

interface ResearchData {
  level: number;
}

interface Researches {
  [ResearchType.ECONOMIC]: ResearchData;
  [ResearchType.TRAINING]: ResearchData;
}

interface ActiveResearch {
  type: ResearchType;
  endTime: number;
}

interface ResearchModalProps {
  onClose: () => void;
  researches: Researches;
  activeResearch: ActiveResearch | null;
  onStartResearch: (type: ResearchType) => void;
  balance: number;
}

const ResearchModal: React.FC<ResearchModalProps> = ({ onClose, researches, activeResearch, onStartResearch, balance }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border-2 border-cyan-500 rounded-xl shadow-2xl p-8 max-w-2xl w-full text-center transform transition-all animate-fade-in-down relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors text-2xl"
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-3xl font-bold text-cyan-400 mb-6">Центр исследований</h2>
        
        <div className="space-y-6">
          <ResearchItem
            type={ResearchType.ECONOMIC}
            name="Инициатива с экономическим эффектом"
            description={`Увеличивает зарплату за смену на ${RESEARCH_BONUS_PER_LEVEL * 100}% за уровень.`}
            level={researches[ResearchType.ECONOMIC].level}
            maxLevel={MAX_RESEARCH_LEVEL}
            onStartResearch={onStartResearch}
            activeResearch={activeResearch}
            balance={balance}
          />
          <ResearchItem
            type={ResearchType.TRAINING}
            name="Обучение"
            description={`Увеличивает опыт за смену на ${RESEARCH_BONUS_PER_LEVEL * 100}% за уровень.`}
            level={researches[ResearchType.TRAINING].level}
            maxLevel={MAX_RESEARCH_LEVEL}
            onStartResearch={onStartResearch}
            activeResearch={activeResearch}
            balance={balance}
          />
        </div>
      </div>
    </div>
  );
};

export default ResearchModal;
