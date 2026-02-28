import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Store, MapPin, Clock } from 'lucide-react';

export default function MallDirectoryModal({ isOpen, onClose, mall }) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!mall) return null;

  const categories = {
    'Groceries': mall.stores?.filter(s => s.category === 'Groceries') || [],
    'Pharmacy': mall.stores?.filter(s => s.category === 'Pharmacy') || [],
    'Restaurants': mall.stores?.filter(s => s.category === 'Restaurants') || [],
    'Fashion': mall.stores?.filter(s => s.category === 'Fashion') || [],
    'Electronics': mall.stores?.filter(s => s.category === 'Electronics') || [],
    'Other': mall.stores?.filter(s => s.category === 'Other') || [],
  };

  const filteredStores = mall.stores?.filter(store =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {mall.name} - Store Directory
          </DialogTitle>
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <MapPin className="w-4 h-4" />
            <span>{mall.address}</span>
          </div>
          {mall.operating_hours && (
            <div className="flex items-center gap-2 text-sm text-stone-600">
              <Clock className="w-4 h-4" />
              <span>{mall.operating_hours}</span>
            </div>
          )}
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
          <Input
            placeholder="Search stores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {searchTerm ? (
          <div className="space-y-2">
            <p className="text-sm text-stone-600">
              Found {filteredStores.length} stores
            </p>
            {filteredStores.map((store, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Store className="w-5 h-5 text-amber-600" />
                  <div>
                    <p className="font-medium">{store.name}</p>
                    {store.floor && (
                      <p className="text-xs text-stone-500">{store.floor}</p>
                    )}
                  </div>
                </div>
                <Badge variant="outline">{store.category}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <Tabs defaultValue="Groceries" className="w-full">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="Groceries">Groceries</TabsTrigger>
              <TabsTrigger value="Pharmacy">Pharmacy</TabsTrigger>
              <TabsTrigger value="Restaurants">Food</TabsTrigger>
            </TabsList>
            
            {Object.entries(categories).slice(0, 3).map(([category, stores]) => (
              <TabsContent key={category} value={category} className="space-y-2">
                {stores.length > 0 ? (
                  stores.map((store, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Store className="w-5 h-5 text-amber-600" />
                        <div>
                          <p className="font-medium">{store.name}</p>
                          {store.floor && (
                            <p className="text-xs text-stone-500">{store.floor}</p>
                          )}
                        </div>
                      </div>
                      {store.has_loyalty_program && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          Loyalty Available
                        </Badge>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-stone-500 py-8">
                    No {category.toLowerCase()} stores in this mall
                  </p>
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}

        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-900">
            💡 <strong>Note:</strong> When shopping, we'll only search for products in these stores. If you request items from stores not listed here, we'll notify you.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
