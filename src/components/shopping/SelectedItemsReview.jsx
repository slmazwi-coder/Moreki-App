import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, X, Store, Plus, Minus, Edit2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SelectedItemsReview({ items, selectedOptions, onRemoveItem, onUpdateQuantity }) {
  const selectedItems = items.filter(item => selectedOptions[item.id]);
  const [editingQty, setEditingQty] = useState({});

  if (selectedItems.length === 0) return null;

  const handleQuantityChange = (itemId, newQty) => {
    const qty = Math.max(1, parseInt(newQty) || 1);
    onUpdateQuantity(itemId, qty);
  };

  return (
    <Card className="border-green-200 bg-green-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          Your Selected Items ({selectedItems.length})
        </CardTitle>
        <p className="text-sm text-stone-600 mt-1">
          Review your selections before proceeding to checkout
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <AnimatePresence>
            {selectedItems.map((item) => {
              const selection = selectedOptions[item.id];
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-xl p-4 border border-stone-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-stone-800">{item.name}</h4>
                        <Badge className="bg-green-100 text-green-700 text-xs">
                          ✓ Selected
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-stone-600">
                          <Store className="w-4 h-4" />
                          <span className="font-medium">{selection.store}</span>
                          <span className="text-stone-400">•</span>
                          <span>{selection.product_name}</span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 bg-stone-100 rounded-lg px-2 py-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleQuantityChange(item.id, selection.quantity - 1)}
                              className="h-6 w-6 hover:bg-stone-200"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <Input
                              type="number"
                              value={selection.quantity}
                              onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                              className="w-16 h-7 text-center border-0 bg-transparent"
                              min="1"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleQuantityChange(item.id, selection.quantity + 1)}
                              className="h-6 w-6 hover:bg-stone-200"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <span className="text-stone-400">×</span>
                          <span className="text-stone-600">R{selection.price.toFixed(2)} each</span>
                        </div>
                        
                        {selection.size && (
                          <p className="text-stone-400 text-xs">Size: {selection.size}</p>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end gap-2">
                      <div>
                        <p className="text-2xl font-bold text-green-600">
                          R{selection.totalPrice.toFixed(2)}
                        </p>
                        {selection.quantity > 1 && (
                          <p className="text-xs text-stone-500">
                            {selection.quantity} × R{selection.price.toFixed(2)}
                          </p>
                        )}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
 
