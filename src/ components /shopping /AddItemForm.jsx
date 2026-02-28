import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  "Groceries",
  "Fresh Produce", 
  "Meat & Seafood",
  "Bakery",
  "Dairy & Eggs",
  "Beverages",
  "Alcohol & Liquor",
  "Snacks & Confectionery",
  "Fast Food & Restaurants",
  "Clothing & Fashion",
  "Electronics",
  "Home & Furniture",
  "Beauty & Personal Care",
  "Health & Pharmacy",
  "Sports & Outdoor",
  "Toys & Games",
  "Books & Stationery",
  "Tobacco & Vapes",
  "Pet Supplies",
  "Other"
];

export default function AddItemForm({ onAddItem, isLoading }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [item, setItem] = useState({
    name: '',
    preferred_brand: '',
    preferred_store: '',
    size: '',
    quantity: 1,
    flavor_or_color: '',
    category: 'Other',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!item.name.trim()) return;
    onAddItem(item);
    setItem({
      name: '',
      preferred_brand: '',
      preferred_store: '',
      size: '',
      quantity: 1,
      flavor_or_color: '',
      category: 'Other',
      notes: ''
    });
    setIsExpanded(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(true)}
            className="w-full p-4 flex items-center justify-center gap-3 text-amber-700 hover:bg-amber-50 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add Item to List</span>
          </motion.button>
        ) : (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="p-5 space-y-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-stone-800">Add New Item</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label className="text-stone-600 text-sm">What do you need? *</Label>
                <Input
                  value={item.name}
                  onChange={(e) => setItem({ ...item, name: e.target.value })}
                  placeholder="e.g., Nando's Chicken, iPhone, Jeans, Beer"
                  className="mt-1.5 border-stone-200 focus:border-amber-500 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <Label className="text-stone-600 text-sm">Preferred Brand / Store</Label>
                <Input
                  value={item.preferred_brand}
                  onChange={(e) => setItem({ ...item, preferred_brand: e.target.value })}
                  placeholder="e.g., Samsung, Nando's, Edgars"
                  className="mt-1.5 border-stone-200"
                />
              </div>

              <div>
                <Label className="text-stone-600 text-sm">Preferred Store / Restaurant</Label>
                <Input
                  value={item.preferred_store}
                  onChange={(e) => setItem({ ...item, preferred_store: e.target.value })}
                  placeholder="e.g., KFC, Woolworths, Game"
                  className="mt-1.5 border-stone-200"
                />
              </div>

              <div>
                <Label className="text-stone-600 text-sm">Size / Portion</Label>
                <Input
                  value={item.size}
                  onChange={(e) => setItem({ ...item, size: e.target.value })}
                  placeholder="e.g., Large, 1L, 32GB, Medium"
                  className="mt-1.5 border-stone-200"
                />
              </div>

              <div>
                <Label className="text-stone-600 text-sm">Quantity *</Label>
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => setItem({ ...item, quantity: parseInt(e.target.value) || 1 })}
                  className="mt-1.5 border-stone-200"
                />
              </div>

              <div>
                <Label className="text-stone-600 text-sm">Flavor / Color / Variant</Label>
                <Input
                  value={item.flavor_or_color}
                  onChange={(e) => setItem({ ...item, flavor_or_color: e.target.value })}
                  placeholder="e.g., Vanilla, Red, Low Fat"
                  className="mt-1.5 border-stone-200"
                />
              </div>

              <div>
                <Label className="text-stone-600 text-sm">Category</Label>
                <Select
                  value={item.category}
                  onValueChange={(value) => setItem({ ...item, category: value })}
                >
                  <SelectTrigger className="mt-1.5 border-stone-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label className="text-stone-600 text-sm">Additional Notes</Label>
                <Textarea
                  value={item.notes}
                  onChange={(e) => setItem({ ...item, notes: e.target.value })}
                  placeholder="Any specific requirements..."
                  className="mt-1.5 border-stone-200 h-20"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsExpanded(false)}
                className="flex-1 border-stone-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !item.name.trim()}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
