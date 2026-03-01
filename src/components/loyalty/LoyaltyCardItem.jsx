import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

const storeColors = {
  'Woolworths': 'bg-green-600',
  'Pick n Pay': 'bg-red-600',
  'Spar': 'bg-green-700',
  'Checkers': 'bg-blue-600',
  'Clicks': 'bg-pink-600',
  'Dis-Chem': 'bg-red-500',
  'Game': 'bg-orange-600',
  'Makro': 'bg-blue-700',
  "Nando's": 'bg-red-600',
  'KFC': 'bg-red-600',
  "McDonald's": 'bg-yellow-500',
  'Steers': 'bg-orange-500',
  'Other': 'bg-stone-600'
};

export default function LoyaltyCardItem({ card }) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.LoyaltyCard.delete(card.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty-cards'] });
    }
  });

  const colorClass = storeColors[card.store_name] || 'bg-stone-600';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card className="border-stone-200 hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${colorClass} rounded-xl flex items-center justify-center`}>
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900">{card.store_name}</h3>
                {card.program_name && (
                  <p className="text-xs text-stone-500">{card.program_name}</p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteMutation.mutate()}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <div>
              <p className="text-xs text-stone-500">Card Number</p>
              <p className="font-mono text-sm font-medium text-stone-800">
                {card.card_number}
              </p>
            </div>
            {card.card_holder_name && (
              <div>
                <p className="text-xs text-stone-500">Card Holder</p>
                <p className="text-sm text-stone-700">{card.card_holder_name}</p>
              </div>
            )}
            <Badge 
              variant={card.status === 'active' ? 'default' : 'secondary'}
              className={card.status === 'active' ? 'bg-green-100 text-green-800' : ''}
            >
              {card.status}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
