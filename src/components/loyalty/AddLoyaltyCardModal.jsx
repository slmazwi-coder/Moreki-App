import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CreditCard } from "lucide-react";

const stores = [
  { name: 'Woolworths', program: 'WRewards' },
  { name: 'Pick n Pay', program: 'Smart Shopper' },
  { name: 'Spar', program: 'Spar Rewards' },
  { name: 'Checkers', program: 'Xtra Savings' },
  { name: 'Clicks', program: 'ClubCard' },
  { name: 'Dis-Chem', program: 'Benefit Programme' },
  { name: 'Game', program: 'Rhino Rewards' },
  { name: 'Makro', program: 'Makro More' },
  { name: "Nando's", program: "Nando's Card" },
  { name: 'KFC', program: "Colonel's Club" },
  { name: "McDonald's", program: "MyMacca's" },
  { name: 'Steers', program: 'King Card' },
  { name: 'Other', program: '' }
];

export default function AddLoyaltyCardModal({ userId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    store_name: '',
    card_number: '',
    card_holder_name: '',
    program_name: ''
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.LoyaltyCard.create({
      ...data,
      user_id: userId,
      status: 'active'
    }),
    onSuccess: () => {
      onSuccess?.();
    }
  });

  const handleStoreChange = (storeName) => {
    const store = stores.find(s => s.name === storeName);
    setFormData({
      ...formData,
      store_name: storeName,
      program_name: store?.program || ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-600" />
            Add Loyalty Card
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Store</Label>
            <Select
              value={formData.store_name}
              onValueChange={handleStoreChange}
              required
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select store" />
              </SelectTrigger>
              <SelectContent>
                {stores.map((store) => (
                  <SelectItem key={store.name} value={store.name}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.program_name && (
            <div>
              <Label>Program Name</Label>
              <Input
                value={formData.program_name}
                onChange={(e) => setFormData({ ...formData, program_name: e.target.value })}
                className="mt-1.5"
              />
            </div>
          )}

          <div>
            <Label>Card Number *</Label>
            <Input
              value={formData.card_number}
              onChange={(e) => setFormData({ ...formData, card_number: e.target.value })}
              placeholder="Enter card number"
              className="mt-1.5"
              required
            />
          </div>

          <div>
            <Label>Card Holder Name</Label>
            <Input
              value={formData.card_holder_name}
              onChange={(e) => setFormData({ ...formData, card_holder_name: e.target.value })}
              placeholder="Name on card (optional)"
              className="mt-1.5"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || !formData.store_name || !formData.card_number}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600"
            >
              {createMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Add Card
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
