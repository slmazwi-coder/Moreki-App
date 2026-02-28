import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  Lock, 
  Check, 
  Loader2, 
  Store, 
  MapPin,
  Truck,
  ShoppingBag,
  ArrowLeft,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Checkout() {
  const urlParams = new URLSearchParams(window.location.search);
  const listId = urlParams.get('list');
  const selectedMall = urlParams.get('mall');
  const deliveryMethod = urlParams.get('delivery') || 'pickup';
  const paymentMethod = urlParams.get('payment') || 'card_online';
  const urlDeliveryFee = parseFloat(urlParams.get('deliveryFee')) || 45;

  const [paymentStep, setPaymentStep] = useState('review'); // review, payment, processing, success
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  // Fetch shopping list
  const { data: list } = useQuery({
    queryKey: ['checkout-list', listId],
    queryFn: () => base44.entities.ShoppingList.filter({ id: listId }),
    enabled: !!listId,
    select: (data) => data[0]
  });

  // Fetch items
  const { data: items = [] } = useQuery({
    queryKey: ['checkout-items', listId],
    queryFn: () => base44.entities.ShoppingItem.filter({ shopping_list_id: listId }),
    enabled: !!listId,
  });

  // Fetch selected product options
  const { data: selectedOptions = [] } = useQuery({
    queryKey: ['checkout-options', listId],
    queryFn: async () => {
      const itemIds = items.map(i => i.id);
      const allOptions = await base44.entities.ProductOption.filter({ is_selected: true });
      return allOptions.filter(o => itemIds.includes(o.shopping_item_id));
    },
    enabled: items.length > 0,
  });

  // For demo, use all options with is_recommended as selected
  const { data: demoOptions = [] } = useQuery({
    queryKey: ['demo-options', listId],
    queryFn: async () => {
      const itemIds = items.map(i => i.id);
      const allOptions = await base44.entities.ProductOption.list();
      return allOptions.filter(o => itemIds.includes(o.shopping_item_id) && o.is_recommended);
    },
    enabled: items.length > 0 && selectedOptions.length === 0,
  });

  const optionsToUse = selectedOptions.length > 0 ? selectedOptions : demoOptions;

  // Calculate totals
  const subtotal = optionsToUse.reduce((sum, opt) => sum + (opt.price || 0), 0);
  const serviceFee = subtotal * 0.05;
  const deliveryFee = deliveryMethod === 'delivery' ? urlDeliveryFee : 0;
  const total = subtotal + serviceFee + deliveryFee;

  // Store breakdown
  const storeBreakdown = optionsToUse.reduce((acc, opt) => {
    if (!acc[opt.store]) acc[opt.store] = { amount: 0, items: [] };
    acc[opt.store].amount += opt.price;
    acc[opt.store].items.push(opt);
    return acc;
  }, {});

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const order = await base44.entities.Order.create({
        shopping_list_id: listId,
        status: paymentMethod === 'card_online' ? 'paid' : 'pending_payment',
        subtotal,
        delivery_fee: deliveryFee,
        service_fee: serviceFee,
        total,
        delivery_method: deliveryMethod,
        payment_method: paymentMethod,
        mall_name: selectedMall,
        payment_reference: paymentMethod === 'card_online' ? `PAY-${Date.now()}` : null,
        stores_breakdown: Object.entries(storeBreakdown).map(([store, data]) => ({
          store,
          amount: data.amount,
          items_count: data.items.length
        }))
      });

      // Update shopping list status
      await base44.entities.ShoppingList.update(listId, { status: 'ordered' });

      return order;
    },
    onSuccess: () => {
      setPaymentStep('success');
    }
  });

  const handlePayment = async (e) => {
    e.preventDefault();
    setPaymentStep('processing');
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    createOrderMutation.mutate();
  };

  if (paymentStep === 'success') {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </motion.div>
          
          <h1 className="text-2xl font-bold text-stone-900 mb-2">
            {paymentMethod === 'card_online' ? 'Payment Successful!' : 'Order Confirmed!'}
          </h1>
          <p className="text-stone-600 mb-6">
            {paymentMethod === 'card_online' 
              ? "Your order has been placed. We're now coordinating with stores to prepare your items."
              : `Your order is confirmed. Pay ${paymentMethod === 'cash_on_delivery' ? 'cash' : 'with card'} when delivered.`}
          </p>

          <div className="bg-amber-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm font-medium text-amber-800 mb-2">What happens next?</p>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Moreki is purchasing from each store on your behalf</li>
              <li>• Items will be collected at the {selectedMall} hub</li>
              {deliveryMethod === 'pickup' ? (
               <li>• You'll receive a notification when ready for pickup</li>
              ) : (
               <li>• Your order will be delivered to your address</li>
              )}
              {paymentMethod !== 'card_online' && (
               <li>• Prepare {paymentMethod === 'cash_on_delivery' ? 'cash' : 'your card'} for payment on delivery</li>
              )}
            </ul>
          </div>

          <div className="space-y-3">
            <Link to={createPageUrl("Orders")} className="block">
              <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-600">
                Track My Order
              </Button>
            </Link>
            <Link to={createPageUrl("ShoppingList")} className="block">
              <Button variant="outline" className="w-full">
                Create New List
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("ShoppingList")}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Checkout</h1>
            <p className="text-stone-600">Complete your purchase</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-600" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items by Store */}
              {Object.entries(storeBreakdown).map(([store, data]) => (
                <div key={store} className="bg-stone-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-stone-500" />
                      <span className="font-medium text-stone-800">{store}</span>
                    </div>
                    <span className="font-semibold">R{data.amount.toFixed(2)}</span>
                  </div>
                  <div className="space-y-2">
                    {data.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm text-stone-600">
                        <span className="line-clamp-1">{item.product_name}</span>
                        <span>R{item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <Separator />

              {/* Delivery Info */}
              <div className="flex items-center gap-3 text-sm">
                {deliveryMethod === 'pickup' ? (
                  <>
                    <MapPin className="w-4 h-4 text-amber-600" />
                    <span>Pickup at <strong>{selectedMall}</strong></span>
                  </>
                ) : (
                  <>
                    <Truck className="w-4 h-4 text-amber-600" />
                    <span>Delivery from <strong>{selectedMall}</strong></span>
                  </>
                )}
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Subtotal</span>
                  <span>R{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Service Fee (5%)</span>
                  <span>R{serviceFee.toFixed(2)}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-600">Delivery Fee</span>
                    <span>R{deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-amber-600">R{total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-600" />
                {paymentMethod === 'card_online' ? 'Payment Details' : 'Confirm Order'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {paymentMethod === 'card_online' ? (
              <form onSubmit={handlePayment} className="space-y-4">
                <div>
                  <Label className="text-stone-600">Card Number</Label>
                  <Input
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                    placeholder="1234 5678 9012 3456"
                    className="mt-1.5 border-stone-200"
                    required
                  />
                </div>

                <div>
                  <Label className="text-stone-600">Cardholder Name</Label>
                  <Input
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                    placeholder="John Doe"
                    className="mt-1.5 border-stone-200"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-stone-600">Expiry Date</Label>
                    <Input
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                      placeholder="MM/YY"
                      className="mt-1.5 border-stone-200"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-stone-600">CVV</Label>
                    <Input
                      type="password"
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                      placeholder="123"
                      className="mt-1.5 border-stone-200"
                      maxLength={4}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-stone-500 bg-stone-50 p-3 rounded-lg">
                  <Lock className="w-4 h-4" />
                  Your payment is secured with 256-bit encryption
                </div>

                <Button
                  type="submit"
                  disabled={paymentStep === 'processing'}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 py-6 text-lg"
                >
                  {paymentStep === 'processing' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 mr-2" />
                      Pay R{total.toFixed(2)}
                    </>
                  )}
                </Button>
              </form>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-sm font-medium text-amber-900 mb-2">
                      Payment on Delivery
                    </p>
                    <p className="text-sm text-amber-700">
                      You've selected {paymentMethod === 'cash_on_delivery' ? 'cash' : 'card'} payment on delivery. 
                      Please have {paymentMethod === 'cash_on_delivery' ? 'cash ready' : 'your card available'} when your order arrives.
                    </p>
                  </div>
                  
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      setPaymentStep('processing');
                      setTimeout(() => createOrderMutation.mutate(), 1000);
                    }}
                    disabled={paymentStep === 'processing'}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 py-6 text-lg"
                  >
                    {paymentStep === 'processing' ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Confirming Order...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Confirm Order - Pay R{total.toFixed(2)} on Delivery
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
