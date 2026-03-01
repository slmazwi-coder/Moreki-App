import React from 'react';
import { 
  CheckCircle2, 
  Store, 
  Minus, 
  Plus, 
  X, 
  ShoppingCart,
  Trash2 
} from 'lucide-react';
import { Button } from '../ui/button.jsx';
import { Card } from '../ui/card.jsx';

const SelectedItemsReview = ({ items = [], onUpdateQuantity, onRemoveItem }) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-stone-500">
        <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-20" />
        <p>Your list is empty</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle2 className="w-5 h-5 text-green-600" />
        <h2 className="font-semibold text-lg">Review Selected Items</h2>
      </div>

      {items.map((item, index) => (
        <Card key={item.id || index} className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-medium text-stone-800">{item.name}</h3>
              <div className="flex items-center gap-2 mt-1 text-sm text-stone-500">
                <Store className="w-4 h-4" />
                <span>{item.store || 'Any Store'}</span>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onRemoveItem(item.id)}
              className="text-stone-400 hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex justify-between items-center mt-4">
            <span className="text-amber-600 font-bold">
              R {(item.price || 0).toFixed(2)}
            </span>
            
            <div className="flex items-center border rounded-lg overflow-hidden">
              <button 
                onClick={() => onUpdateQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))}
                className="p-2 hover:bg-stone-100 transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="px-4 py-1 bg-stone-50 font-medium border-x">
                {item.quantity || 1}
              </span>
              <button 
                onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) + 1)}
                className="p-2 hover:bg-stone-100 transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default SelectedItemsReview;