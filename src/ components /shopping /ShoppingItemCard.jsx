import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Search, Package, Store, Tag, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const statusConfig = {
  pending: { color: 'bg-stone-100 text-stone-600', label: 'Pending' },
  searching: { color: 'bg-amber-100 text-amber-700', label: 'Searching...' },
  options_found: { color: 'bg-green-100 text-green-700', label: 'Options Found' },
  selected: { color: 'bg-blue-100 text-blue-700', label: 'Selected' },
  purchased: { color: 'bg-emerald-100 text-emerald-700', label: 'Purchased' }
};

export default function ShoppingItemCard({ item, onDelete, onSearch, isSearching }) {
  const status = statusConfig[item.status] || statusConfig.pending;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl border border-stone-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-stone-800 text-lg">{item.name}</h4>
            <Badge className={`${status.color} text-xs font-medium`}>
              {item.status === 'searching' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
              {status.label}
            </Badge>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-2 text-sm text-stone-500">
            {item.preferred_brand && (
              <span className="flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                {item.preferred_brand}
              </span>
            )}
            {item.preferred_store && item.preferred_store !== 'Any' && (
              <span className="flex items-center gap-1">
                <Store className="w-3.5 h-3.5" />
                {item.preferred_store}
              </span>
            )}
            {item.size && (
              <span className="flex items-center gap-1">
                <Package className="w-3.5 h-3.5" />
                {item.size}
              </span>
            )}
            <span className="font-medium text-stone-700">
              Qty: {item.quantity}
            </span>
          </div>
          
          {(item.flavor_or_color || item.notes) && (
            <p className="text-sm text-stone-400 mt-1.5 line-clamp-1">
              {[item.flavor_or_color, item.notes].filter(Boolean).join(' • ')}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {item.status === 'pending' && (
            <Button
              size="sm"
              onClick={() => onSearch(item)}
              disabled={isSearching}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4 mr-1" />
                  Find Options
                </>
              )}
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDelete(item.id)}
            className="text-stone-400 hover:text-red-500 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
