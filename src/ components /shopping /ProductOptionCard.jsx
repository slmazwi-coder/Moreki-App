import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Percent, Star, Package, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

const storeColors = {
  'Spar': 'bg-red-500',
  'Woolworths': 'bg-stone-800',
  'Pick n Pay': 'bg-blue-600',
  'Checkers': 'bg-red-600',
  'Shoprite': 'bg-red-500',
  'Game': 'bg-blue-500',
  'Makro': 'bg-orange-600'
};

export default function ProductOptionCard({ option, onSelect, isSelected, quantity = 1 }) {
  const unitPrice = option.price;
  const totalPrice = unitPrice * quantity;
  const savings = option.original_price ? ((option.original_price - option.price) * quantity) : 0;
  const storeColor = storeColors[option.store] || 'bg-stone-500';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`relative bg-white rounded-xl border-2 transition-all cursor-pointer overflow-hidden ${
        isSelected 
          ? 'border-green-500 shadow-lg shadow-green-100' 
          : 'border-stone-200 hover:border-amber-300 hover:shadow-md'
      }`}
      onClick={() => onSelect(option)}
    >
      {option.is_on_sale && (
        <div className="absolute top-0 right-0">
          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
            <Percent className="w-3 h-3" />
            {option.discount_percentage}% OFF
          </div>
        </div>
      )}

      {option.is_recommended && (
        <div className="absolute top-0 left-0">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-br-lg flex items-center gap-1">
            <Star className="w-3 h-3" />
            Best Value
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-12 h-12 ${storeColor} rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0`}>
            {option.store.charAt(0)}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-stone-500">{option.store}</p>
            <h4 className="font-semibold text-stone-800 line-clamp-2">{option.product_name}</h4>
            {option.brand && (
              <p className="text-sm text-stone-500">{option.brand}</p>
            )}
            {option.size && (
              <p className="text-xs text-stone-400 flex items-center gap-1 mt-0.5">
                <Package className="w-3 h-3" />
                {option.size}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div>
            {quantity > 1 && (
              <p className="text-xs text-stone-500 mb-1">
                R{unitPrice.toFixed(2)} × {quantity}
              </p>
            )}
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-stone-800">
                R{totalPrice.toFixed(2)}
              </span>
              {option.original_price && option.original_price > option.price && (
                <span className="text-sm text-stone-400 line-through">
                  R{(option.original_price * quantity).toFixed(2)}
                </span>
              )}
            </div>
            {savings > 0 && (
              <p className="text-sm text-green-600 font-medium">
                Save R{savings.toFixed(2)}
              </p>
            )}
            {option.has_loyalty_discount && (
              <p className="text-xs text-purple-600 font-medium flex items-center gap-1 mt-1">
                <CreditCard className="w-3 h-3" />
                Loyalty price
              </p>
            )}
          </div>

          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            isSelected 
              ? 'bg-green-500 text-white' 
              : 'bg-stone-100 text-stone-400'
          }`}>
            <Check className="w-5 h-5" />
          </div>
        </div>

        {option.recommendation_reason && (
          <p className="mt-3 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
            💡 {option.recommendation_reason}
          </p>
        )}

        {!option.in_stock && (
          <Badge className="mt-2 bg-red-100 text-red-700">Out of Stock</Badge>
        )}
      </div>
    </motion.div>
  );
}
