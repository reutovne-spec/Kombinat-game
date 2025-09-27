import React from 'react';
import InventoryItem from './InventoryItem';
import { INVENTORY_ITEMS } from '../constants';

interface InventoryModalProps {
  onClose: () => void;
  ownedItemIds: Set<string>;
  onPurchaseItem: (itemId: string) => void;
  balance: number;
}

const InventoryModal: React.FC<InventoryModalProps> = ({ onClose, ownedItemIds, onPurchaseItem, balance }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border-2 border-green-500 rounded-xl shadow-2xl p-8 max-w-4xl w-full transform transition-all animate-fade-in-down relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors text-2xl"
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-3xl font-bold text-green-400 mb-6 text-center">Инвентарь / Магазин</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto pr-2">
          {INVENTORY_ITEMS.map(item => (
            <InventoryItem
              key={item.id}
              item={item}
              isOwned={ownedItemIds.has(item.id)}
              canAfford={balance >= item.cost}
              onPurchase={onPurchaseItem}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default InventoryModal;
