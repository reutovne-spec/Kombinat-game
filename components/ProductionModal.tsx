import React from 'react';
import { ProductionType } from '../types';
import ProductionItem from './ProductionItem';
import { PRODUCTIONS } from '../constants';

interface ProductionModalProps {
  onClose: () => void;
  currentProduction: ProductionType | null;
  onJoinProduction: (productionType: ProductionType) => void;
}

const ProductionModal: React.FC<ProductionModalProps> = ({ onClose, currentProduction, onJoinProduction }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border-2 border-orange-500 rounded-xl shadow-2xl p-8 max-w-4xl w-full transform transition-all animate-fade-in-down relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors text-2xl"
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-3xl font-bold text-orange-400 mb-2 text-center">Производства</h2>
        <p className="text-gray-400 text-center mb-6">
          {currentProduction ? 'Вы состоите в этом производстве.' : 'Вступите в одно из производств, чтобы получить доступ к уникальным бонусам и заданиям.'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PRODUCTIONS.map(p => (
            <ProductionItem
              key={p.id}
              production={p}
              currentProduction={currentProduction}
              onJoin={onJoinProduction}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductionModal;
