import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Store, Truck, MapPin, CreditCard, Loader2 } from "lucide-react";

export default function OrderSummary({ 
  selectedOptions, 
  deliveryMethod, 
  deliveryFee,
  selectedMall,
  onCheckout,
  isProcessing,
  loyaltyDiscount = 0,
  serviceFeePercentage = 5.0
}) {
  // Group by store
  const storeGroups = selectedOptions.reduce((acc, opt) => {
    if (!acc[opt.store]) acc[opt.store] = [];
    acc[opt.store].push(opt);
    return acc;
  }, {});

  const subtotal = selectedOptions.reduce((sum, opt) => sum + (opt.totalPrice || opt.price), 0);
  const serviceFee = subtotal * (serviceFeePercentage / 100);
  const totalBeforeDiscount = subtotal + serviceFee + (deliveryMethod === 'delivery' ? deliveryFee : 0);
  const total = totalBeforeDiscount - loyaltyDiscount;

  const storeBreakdown = Object.entries(storeGroups).map(([store, items]) => ({
    store,
    amount: items.reduce((sum, item) => sum + (item.totalPrice || item.price), 0),
    items_count: items.reduce((sum, item) => sum + (item.quantity || 1), 0)
  }));

  return (
    <Card className="border-stone-200 sticky top-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShoppingCart className="w-5 h-5 text-amber-600" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedOptions.length === 0 ? (
          <p className="text-stone-500 text-center py-8">
            Select products to see your order summary
          </p>
        ) : (
          <>
            {/* Store Breakdown */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-stone-600">Store Breakdown</p>
              {storeBreakdown.map(({ store, amount, items_count }) => (
                <div key={store} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-stone-400" />
                    {store}
                    <Badge variant="secondary" className="text-xs">
                      {items_count} items
                    </Badge>
                  </span>
                  <span className="font-medium">R{amount.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <Separator />

            {/* Delivery Info */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-stone-600">
                  {deliveryMethod === 'pickup' ? (
                    <MapPin className="w-4 h-4" />
                  ) : (
                    <Truck className="w-4 h-4" />
                  )}
                  {deliveryMethod === 'pickup' ? 'Pickup at' : 'Deliver to'}
                </span>
              </div>
              <p className="text-sm font-medium text-stone-800 pl-6">
                {selectedMall || 'Select a mall'}
              </p>
            </div>

            <Separator />

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-stone-600">Subtotal</span>
                <span>R{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-600">Service Fee ({serviceFeePercentage}%)</span>
                <span>R{serviceFee.toFixed(2)}</span>
              </div>
              {loyaltyDiscount > 0 && (
                <div className="flex justify-between text-sm text-purple-600">
                  <span className="flex items-center gap-1">
                    <Badge className="bg-purple-100 text-purple-800 text-xs">Loyalty</Badge>
                    Discount
                  </span>
                  <span>-R{loyaltyDiscount.toFixed(2)}</span>
                </div>
              )}
              {deliveryMethod === 'delivery' && (
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" />
                    Delivery
                  </span>
                  <span>R{deliveryFee.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-amber-600">R{total.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
      {selectedOptions.length > 0 && (
        <CardFooter>
          <Button
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white py-6 text-lg"
            onClick={onCheckout}
            disabled={isProcessing || !selectedMall}
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <CreditCard className="w-5 h-5 mr-2" />
            )}
            Proceed to Payment
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
