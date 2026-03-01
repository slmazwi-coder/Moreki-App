import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Truck, MapPin, Clock, Check, Calculator, Loader2, DollarSign, Banknote, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from '@/api/base44Client';

export default function DeliverySelector({ 
  method, 
  onMethodChange, 
  deliveryAddress, 
  onAddressChange,
  pickupTime,
  onPickupTimeChange,
  estimatedDeliveryFee,
  onDeliveryFeeCalculated,
  selectedMall,
  paymentMethod,
  onPaymentMethodChange,
  orderTotal
}) {
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculatedFee, setCalculatedFee] = useState(null);
  const [distance, setDistance] = useState(null);

  const calculateDeliveryFee = async () => {
    if (!deliveryAddress || !selectedMall) return;
    
    setIsCalculating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Calculate delivery distance and fee for South Africa:
        From: ${selectedMall} mall
        To: ${deliveryAddress}
        
        Provide realistic estimates based on typical South African distances and delivery costs.
        Base rate: R35 + R12 per km
        Maximum fee: R150`,
        response_json_schema: {
          type: "object",
          properties: {
            distance_km: { type: "number" },
            delivery_fee: { type: "number" },
            explanation: { type: "string" }
          }
        }
      });
      
      setDistance(response.distance_km);
      setCalculatedFee(response.delivery_fee);
      onDeliveryFeeCalculated?.(response.delivery_fee, response.distance_km);
    } catch (error) {
      console.error('Failed to calculate delivery fee:', error);
    } finally {
      setIsCalculating(false);
    }
  };
  return (
    <Card className="border-stone-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Truck className="w-5 h-5 text-amber-600" />
          How would you like to receive your order?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Pickup Option */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onMethodChange('pickup')}
            className={`relative p-4 rounded-xl border-2 text-left transition-all ${
              method === 'pickup'
                ? 'border-amber-500 bg-amber-50'
                : 'border-stone-200 hover:border-stone-300'
            }`}
          >
            {method === 'pickup' && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
            <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center mb-3">
              <MapPin className="w-5 h-5 text-stone-600" />
            </div>
            <h4 className="font-semibold text-stone-800">Pickup at Hub</h4>
            <p className="text-sm text-stone-500 mt-1">
              Collect from the mall hub
            </p>
            <p className="text-sm font-medium text-green-600 mt-2">Free</p>
          </motion.button>

          {/* Delivery Option */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onMethodChange('delivery')}
            className={`relative p-4 rounded-xl border-2 text-left transition-all ${
              method === 'delivery'
                ? 'border-amber-500 bg-amber-50'
                : 'border-stone-200 hover:border-stone-300'
            }`}
          >
            {method === 'delivery' && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center mb-3">
              <Truck className="w-5 h-5 text-amber-600" />
            </div>
            <h4 className="font-semibold text-stone-800">Delivery</h4>
            <p className="text-sm text-stone-500 mt-1">
              Delivered to your door
            </p>
            <p className="text-sm font-medium text-amber-600 mt-2">
              {calculatedFee ? `R${calculatedFee.toFixed(2)}` : 'Calculate fee'}
            </p>
          </motion.button>
        </div>

        {/* Conditional Fields */}
        {method === 'pickup' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-3 pt-2"
          >
            <Label className="text-stone-600">Preferred Pickup Time</Label>
            <Input
              type="datetime-local"
              value={pickupTime}
              onChange={(e) => onPickupTimeChange(e.target.value)}
              className="border-stone-200"
              min={new Date().toISOString().slice(0, 16)}
            />
            <p className="text-xs text-stone-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Orders are typically ready within 2 hours
            </p>
          </motion.div>
        )}

        {method === 'delivery' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-3 pt-2"
          >
            <Label className="text-stone-600">Delivery Address</Label>
            <div className="flex gap-2">
              <Input
                value={deliveryAddress}
                onChange={(e) => {
                  onAddressChange(e.target.value);
                  setCalculatedFee(null);
                  setDistance(null);
                }}
                placeholder="Enter your full delivery address"
                className="border-stone-200"
              />
              <Button
                type="button"
                variant="outline"
                onClick={calculateDeliveryFee}
                disabled={!deliveryAddress || isCalculating}
                className="flex-shrink-0"
              >
                {isCalculating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Calculator className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            <AnimatePresence>
              {calculatedFee !== null && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 bg-green-50 rounded-lg border border-green-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        Delivery Quote
                      </p>
                      <p className="text-xs text-green-600 mt-0.5">
                        Distance: ~{distance?.toFixed(1)} km
                      </p>
                    </div>
                    <p className="text-xl font-bold text-green-700">
                      R{calculatedFee.toFixed(2)}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                🚚 <span className="font-medium">Delivery Service</span>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Estimated delivery: 45-90 minutes after order is ready
              </p>
            </div>

            {/* Payment Method Selection */}
            <div className="pt-2">
              <Label className="text-stone-600 mb-3 block">Payment Method</Label>
              <div className="grid grid-cols-1 gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => onPaymentMethodChange?.('card_online')}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    paymentMethod === 'card_online'
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {paymentMethod === 'card_online' && (
                      <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                    <CreditCard className="w-5 h-5 text-stone-600" />
                    <div>
                      <p className="font-medium text-stone-800">Pay Online Now</p>
                      <p className="text-xs text-stone-500">Secure card payment</p>
                    </div>
                  </div>
                </motion.button>

                {orderTotal <= 1000 && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => onPaymentMethodChange?.('cash_on_delivery')}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        paymentMethod === 'cash_on_delivery'
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {paymentMethod === 'cash_on_delivery' && (
                          <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                        <Banknote className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium text-stone-800">Cash on Delivery</p>
                          <p className="text-xs text-stone-500">Pay with cash when delivered</p>
                        </div>
                      </div>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => onPaymentMethodChange?.('card_on_delivery')}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        paymentMethod === 'card_on_delivery'
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {paymentMethod === 'card_on_delivery' && (
                          <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-stone-800">Card on Delivery</p>
                          <p className="text-xs text-stone-500">Pay with card when delivered</p>
                        </div>
                      </div>
                    </motion.button>
                  </>
                )}
              </div>
              {orderTotal > 1000 && (
                <p className="text-xs text-amber-600 mt-2">
                  ℹ️ Cash/Card on delivery available for orders under R1,000
                </p>
              )}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
