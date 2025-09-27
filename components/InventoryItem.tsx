import React from 'react';
import Button from './Button';
import { InventoryItemData } from '../types';

interface InventoryItemProps {
  item: InventoryItemData;
  isOwned: boolean;
  canAfford: boolean;
  onPurchase: (itemId: string) => void;
}

const InventoryItem: React.FC<InventoryItemProps> = ({ item, isOwned, canAfford, onPurchase }) => {
  
  const getButtonState = () => {
    if (isOwned) {
      return { text: 'Куплено', disabled: true, variant: 'secondary' as const };
    }
    if (!canAfford) {
      return { text: 'Недостаточно плавок', disabled: true, variant: 'secondary' as const };
    }
    return { text: 'Купить', disabled: false, variant: 'primary' as const };
  }

  const { text: buttonText, disabled: isButtonDisabled, variant } = getButtonState();

  return (
    <div className={`bg-gray-900/50 p-4 rounded-lg border border-gray-700 flex flex-col text-center transition-all duration-300 ${isOwned ? 'opacity-60' : ''}`}>
      <div className="text-5xl mb-2">{item.icon}</div>
      <h3 className="text-lg font-bold text-white flex-grow">{item.name}</h3>
      <p className="text-green-400 font-semibold text-sm mb-2">{item.description}</p>
      
      <div className="bg-gray-800 text-yellow-400 font-bold py-1 px-3 rounded-md mb-4 w-fit mx-auto">
        {item.cost} плавок
      </div>

      <Button
        onClick={() => onPurchase(item.id)}
        disabled={isButtonDisabled}
        variant={variant}
        className="w-full mt-auto py-2 text-base"
      >
        {buttonText}
      </Button>
    </div>
  );
};

export default InventoryItem;
