import React from 'react';
import Button from './Button';
import { ProductionData, ProductionType } from '../types';

interface ProductionItemProps {
  production: ProductionData;
  currentProduction: ProductionType | null;
  onJoin: (productionType: ProductionType) => void;
}

const ProductionItem: React.FC<ProductionItemProps> = ({ production, currentProduction, onJoin }) => {
  const hasJoined = currentProduction !== null;
  const isCurrent = currentProduction === production.id;

  const getButtonState = () => {
    if (isCurrent) {
      return { text: 'Вы здесь', disabled: true, variant: 'secondary' as const };
    }
    if (hasJoined) {
      return { text: 'Вступить', disabled: true, variant: 'secondary' as const };
    }
    return { text: 'Вступить', disabled: false, variant: 'primary' as const };
  }

  const { text: buttonText, disabled: isButtonDisabled, variant } = getButtonState();

  return (
    <div className={`bg-gray-900/50 p-6 rounded-lg border-2 text-center flex flex-col transition-all duration-300 ${isCurrent ? 'border-orange-500 scale-105 shadow-lg' : 'border-gray-700'} ${hasJoined && !isCurrent ? 'opacity-50' : ''}`}>
      <div className="text-6xl mb-4">{production.icon}</div>
      <h3 className="text-2xl font-bold text-white flex-grow mb-2">{production.name}</h3>
      <p className="text-gray-400 text-sm mb-6 h-12">{production.description}</p>

      <Button
        onClick={() => onJoin(production.id)}
        disabled={isButtonDisabled}
        variant={variant}
        className="w-full mt-auto py-2 text-lg"
      >
        {buttonText}
      </Button>
    </div>
  );
};

export default ProductionItem;
