import React from 'react';
import Button from './Button';
import PartnershipItem from './PartnershipItem';
import { PARTNERSHIPS } from '../constants';

interface PartnershipModalProps {
  onClose: () => void;
  ownedPartnershipIds: Set<string>;
  onPurchasePartnership: (partnershipId: string) => void;
  unclaimedIncome: number;
  onClaimIncome: () => void;
  balance: number;
}

const PartnershipModal: React.FC<PartnershipModalProps> = ({ onClose, ownedPartnershipIds, onPurchasePartnership, unclaimedIncome, onClaimIncome, balance }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border-2 border-purple-500 rounded-xl shadow-2xl p-8 max-w-4xl w-full transform transition-all animate-fade-in-down relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors text-2xl"
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-3xl font-bold text-purple-400 mb-6 text-center">Партнерство</h2>

        <div className="bg-gray-900/50 p-4 rounded-lg mb-6 border border-gray-700 flex items-center justify-between flex-wrap gap-4">
            <div>
                <p className="text-gray-400">Накопленный доход:</p>
                <p className="text-3xl font-bold text-white">{Math.floor(unclaimedIncome).toLocaleString()} плавок</p>
            </div>
            <Button onClick={onClaimIncome} disabled={unclaimedIncome < 1}>Собрать</Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
          {PARTNERSHIPS.map(p => (
            <PartnershipItem
              key={p.id}
              partnership={p}
              isOwned={ownedPartnershipIds.has(p.id)}
              canAfford={balance >= p.cost}
              onPurchase={onPurchasePartnership}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PartnershipModal;
