import React from 'react';
import Button from './Button';
import { PartnershipData } from '../types';

interface PartnershipItemProps {
  partnership: PartnershipData;
  isOwned: boolean;
  canAfford: boolean;
  onPurchase: (partnershipId: string) => void;
}

const PartnershipItem: React.FC<PartnershipItemProps> = ({ partnership, isOwned, canAfford, onPurchase }) => {
  const getButtonState = () => {
    if (isOwned) {
      return { text: 'Приобретено', disabled: true, variant: 'secondary' as const };
    }
    if (!canAfford) {
      return { text: 'Недостаточно плавок', disabled: true, variant: 'secondary' as const };
    }
    return { text: 'Купить', disabled: false, variant: 'primary' as const };
  }

  const { text: buttonText, disabled: isButtonDisabled, variant } = getButtonState();

  return (
    <div className={`bg-gray-900/50 p-4 rounded-lg border border-gray-700 flex items-center gap-4 transition-all duration-300 ${isOwned ? 'opacity-60' : ''}`}>
      <div className="text-4xl p-3 bg-gray-800 rounded-lg">{partnership.icon}</div>
      <div className="flex-grow">
        <h3 className="text-lg font-bold text-white">{partnership.name}</h3>
        <p className="text-purple-400 font-semibold text-sm">+{partnership.dailyIncome.toLocaleString()} плавок/день</p>
        <p className="text-yellow-400 font-bold text-sm">{partnership.cost.toLocaleString()} плавок</p>
      </div>
      <Button
        onClick={() => onPurchase(partnership.id)}
        disabled={isButtonDisabled}
        variant={variant}
        className="py-2 text-base px-4 flex-shrink-0"
      >
        {buttonText}
      </Button>
    </div>
  );
};

export default PartnershipItem;
