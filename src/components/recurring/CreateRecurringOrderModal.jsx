import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Bell, MapPin, Package, Plus, X, Mic, Keyboard } from "lucide-react";
import VoiceShoppingInput from '../shopping/VoiceShoppingInput';
import { addMonths, format } from "date-fns";

export default function CreateRecurringOrderModal({ open, onClose }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    schedule_day: 1,
    delivery_address: '',
    delivery_method: 'delivery',
    preferred_mall: '',
    notification_preference: 'review_before_order',
    notification_days_before: 3,
    items_template: []
  });

  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 1,
    preferred_brand: '',
    size: '',
    category: 'Groceries'
  });

  const [inputMode, setInputMode] = useState('text'); // 'text' or 'voice'
  const [searchingItems, setSearchingItems] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({}); // { itemIndex: optionIndex }

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  // Fetch user's loyalty cards for pricing
  const { data: loyaltyCards = [] } = useQuery({
    queryKey: ['loyalty-cards', user?.id],
    queryFn: () => base44.entities.LoyaltyCard.filter({ user_id: user?.id, status: 'active' }),
    enabled: !!user?.id,
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: user?.id }),
    enabled: !!user?.id,
  });

  const profile = profiles[0];

  // Pre-fill from profile
  React.useEffect(() => {
    if (profile && !formData.delivery_address) {
      setFormData(prev => ({
        ...prev,
        delivery_address: profile.default_address || '',
        preferred_mall: profile.preferred_mall || ''
      }));
    }
  }, [profile]);

  const createMutation = useMutation({
    mutationFn: (data) => {
      const nextRunDate = new Date();
      nextRunDate.setDate(data.schedule_day);
      if (nextRunDate <= new Date()) {
        nextRunDate.setMonth(nextRunDate.getMonth() + 1);
      }

      return base44.entities.RecurringOrder.create({
        ...data,
        next_run_date: format(nextRunDate, 'yyyy-MM-dd'),
        status: 'active'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-orders'] });
      onClose();
      resetForm();
    },
  });

  const resetForm = () => {
    setStep(1);
    setFormData({
      name: '',
      description: '',
      schedule_day: 1,
      delivery_address: profile?.default_address || '',
      delivery_method: 'delivery',
      preferred_mall: profile?.preferred_mall || '',
      notification_preference: 'review_before_order',
      notification_days_before: 3,
      items_template: []
    });
  };

  const addItem = async () => {
    if (!newItem.name.trim()) return;
    
    const itemToAdd = { ...newItem, product_options: [] };
    setFormData(prev => ({
      ...prev,
      items_template: [...prev.items_template, itemToAdd]
    }));
    setNewItem({ name: '', quantity: 1, preferred_brand: '', size: '', category: 'Groceries' });

    // Search for product options
    await searchProductOptionsForItems([itemToAdd]);
  };

  const handleAddMultipleItems = async (items) => {
    // Add items to template first
    const updatedItems = items.map(item => ({
      ...item,
      product_options: []
    }));
    
    setFormData(prev => ({
      ...prev,
      items_template: [...prev.items_template, ...updatedItems]
    }));

    // Search for product options for each item
    await searchProductOptionsForItems(updatedItems);
  };

  // Search for product options for items
  const searchProductOptionsForItems = async (items) => {
    if (!formData.preferred_mall) return;
    
    setSearchingItems(true);

    for (const item of items) {
      const loyaltyCardsContext = loyaltyCards.length > 0 
        ? `User has active loyalty cards for: ${loyaltyCards.map(c => `${c.store_name} (Card: ${c.card_number})`).join(', ')}. 
           CRITICAL: Fetch REAL-TIME loyalty pricing. Show both original_price and discounted price.`
        : '';

      const prompt = `REAL-TIME PRICING for ${formData.preferred_mall}, South Africa:

Product: ${item.name}
Category: ${item.category || 'Groceries'}
${item.preferred_brand ? `Brand: ${item.preferred_brand}` : ''}
${item.size ? `Size: ${item.size}` : ''}

${loyaltyCardsContext}

Search stores in ${formData.preferred_mall}: Spar, Woolworths, Pick n Pay, Checkers, Game, etc.
Return 3 options with real-time pricing, loyalty discounts, and current promotions.`;

      try {
        const response = await base44.integrations.Core.InvokeLLM({
          prompt,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              options: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    store: { type: "string" },
                    product_name: { type: "string" },
                    brand: { type: "string" },
                    price: { type: "number" },
                    original_price: { type: "number" },
                    is_on_sale: { type: "boolean" },
                    size: { type: "string" },
                    in_stock: { type: "boolean" },
                    has_loyalty_discount: { type: "boolean" }
                  }
                }
              }
            }
          }
        });

        // Update item with product options
        setFormData(prev => ({
          ...prev,
          items_template: prev.items_template.map(i => 
            i.name === item.name && i.quantity === item.quantity
              ? { ...i, product_options: response.options }
              : i
          )
        }));
      } catch (error) {
        console.error('Error searching for product:', error);
      }
    }

    setSearchingItems(false);
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items_template: prev.items_template.filter((_, i) => i !== index)
    }));
    // Remove selection
    const newSelections = { ...selectedOptions };
    delete newSelections[index];
    setSelectedOptions(newSelections);
  };

  const selectOption = (itemIndex, optionIndex) => {
    setSelectedOptions(prev => ({
      ...prev,
      [itemIndex]: optionIndex
    }));
  };

  const updateItemQuantity = (itemIndex, newQuantity) => {
    if (newQuantity < 1) return;
    setFormData(prev => ({
      ...prev,
      items_template: prev.items_template.map((item, idx) =>
        idx === itemIndex ? { ...item, quantity: newQuantity } : item
      )
    }));
  };

  const handleSubmit = () => {
    if (formData.items_template.length === 0) {
      alert('Please add at least one item to your recurring order');
      return;
    }
    
    // Check if all items have selected options
    const itemsWithOptions = formData.items_template.filter(item => item.product_options?.length > 0);
    if (itemsWithOptions.length > 0 && Object.keys(selectedOptions).length < itemsWithOptions.length) {
      alert('Please select a product option for each item before creating the recurring order');
      return;
    }
    
    // Update items with selected product details
    const finalItems = formData.items_template.map((item, idx) => {
      const selectedOptionIdx = selectedOptions[idx];
      if (selectedOptionIdx !== undefined && item.product_options?.[selectedOptionIdx]) {
        const selectedProduct = item.product_options[selectedOptionIdx];
        return {
          ...item,
          preferred_store: selectedProduct.store,
          last_price: selectedProduct.price,
          size: selectedProduct.size || item.size
        };
      }
      return item;
    });
    
    createMutation.mutate({
      ...formData,
      items_template: finalItems
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Recurring Order</DialogTitle>
          <DialogDescription>
            Set up automatic monthly deliveries for your family
          </DialogDescription>
        </DialogHeader>

        <Tabs value={`step${step}`} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="step1" onClick={() => setStep(1)}>Details</TabsTrigger>
            <TabsTrigger value="step2" onClick={() => setStep(2)} disabled={!formData.name}>Items</TabsTrigger>
            <TabsTrigger value="step3" onClick={() => setStep(3)} disabled={formData.items_template.length === 0}>Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="step1" className="space-y-4 mt-4">
            <div>
              <Label>Order Name *</Label>
              <Input
                placeholder="e.g., Mom's Monthly Groceries"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div>
              <Label>Description (Optional)</Label>
              <Textarea
                placeholder="Monthly groceries for my mom in Durban"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div>
              <Label>Delivery Address *</Label>
              <Input
                placeholder="Full delivery address"
                value={formData.delivery_address}
                onChange={(e) => setFormData({...formData, delivery_address: e.target.value})}
              />
            </div>

            <div>
              <Label>Preferred Mall *</Label>
              <Input
                placeholder="e.g., Gateway Theatre of Shopping"
                value={formData.preferred_mall}
                onChange={(e) => setFormData({...formData, preferred_mall: e.target.value})}
              />
            </div>

            <div>
              <Label>Delivery Method</Label>
              <Select
                value={formData.delivery_method}
                onValueChange={(value) => setFormData({...formData, delivery_method: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delivery">Delivery</SelectItem>
                  <SelectItem value="pickup">Pickup at Hub</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={() => setStep(2)} className="w-full" disabled={!formData.name || !formData.delivery_address}>
              Next: Add Items
            </Button>
          </TabsContent>

          <TabsContent value="step2" className="space-y-4 mt-4">
            {/* Input Mode Toggle */}
            <div className="flex gap-2 justify-center">
              <Button
                variant={inputMode === 'text' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setInputMode('text')}
                className={inputMode === 'text' ? 'bg-amber-500 hover:bg-amber-600' : ''}
              >
                <Keyboard className="w-4 h-4 mr-2" />
                Type Items
              </Button>
              <Button
                variant={inputMode === 'voice' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setInputMode('voice')}
                className={inputMode === 'voice' ? 'bg-purple-500 hover:bg-purple-600' : ''}
              >
                <Mic className="w-4 h-4 mr-2" />
                Voice Input
              </Button>
            </div>

            {inputMode === 'text' ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-medium text-amber-900 mb-3">Add Items to Template</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Item name *"
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  />
                  <Input
                    type="number"
                    placeholder="Quantity"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 1})}
                  />
                  <Input
                    placeholder="Brand (optional)"
                    value={newItem.preferred_brand}
                    onChange={(e) => setNewItem({...newItem, preferred_brand: e.target.value})}
                  />
                  <Input
                    placeholder="Size (optional)"
                    value={newItem.size}
                    onChange={(e) => setNewItem({...newItem, size: e.target.value})}
                  />
                </div>
                <Button onClick={addItem} size="sm" className="mt-3 w-full" disabled={!newItem.name.trim()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
            ) : (
              <VoiceShoppingInput
                onAddItems={handleAddMultipleItems}
                isLoading={false}
              />
            )}

            {searchingItems && (
              <div className="flex items-center justify-center gap-2 py-4 text-amber-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Searching for products in {formData.preferred_mall}...</span>
              </div>
            )}

            <div className="space-y-2">
              <Label>Items in Template ({formData.items_template.length})</Label>
              {formData.items_template.length === 0 ? (
                <p className="text-sm text-stone-500 py-4 text-center">No items yet. Add items above.</p>
              ) : (
                <div className="space-y-3">
                  {formData.items_template.map((item, idx) => {
                    const selectedOptionIdx = selectedOptions[idx];
                    const selectedOption = selectedOptionIdx !== undefined ? item.product_options?.[selectedOptionIdx] : null;
                    const totalPrice = selectedOption ? (selectedOption.price * item.quantity) : 0;
                    
                    return (
                      <div key={idx} className="bg-white border-2 rounded-lg overflow-hidden" style={{
                        borderColor: selectedOption ? '#10b981' : '#e5e7eb'
                      }}>
                        <div className="p-3 border-b bg-stone-50">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold text-stone-900">{item.name}</p>
                            <Button variant="ghost" size="icon" onClick={() => removeItem(idx)}>
                              <X className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                          
                          {/* Quantity Adjuster */}
                          <div className="flex items-center gap-3">
                            <Label className="text-xs text-stone-600">Quantity:</Label>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-7 w-7 p-0"
                                onClick={() => updateItemQuantity(idx, item.quantity - 1)}
                              >
                                -
                              </Button>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateItemQuantity(idx, parseInt(e.target.value) || 1)}
                                className="h-7 w-16 text-center"
                              />
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => updateItemQuantity(idx, item.quantity + 1)}
                              >
                                +
                              </Button>
                            </div>
                            {selectedOption && (
                              <p className="text-xs font-semibold text-amber-600 ml-auto">
                                Total: R{totalPrice.toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Product options */}
                        {item.product_options && item.product_options.length > 0 ? (
                          <div className="p-3 space-y-2">
                            <p className="text-xs font-medium text-stone-700 mb-2">
                              {selectedOption ? '✓ Selected Option:' : 'Choose an option:'}
                            </p>
                            <div className="space-y-2">
                              {item.product_options.map((option, optIdx) => {
                                const isSelected = selectedOptionIdx === optIdx;
                                return (
                                  <button
                                    key={optIdx}
                                    onClick={() => selectOption(idx, optIdx)}
                                    className={`w-full text-left rounded-lg p-3 border-2 transition-all ${
                                      isSelected 
                                        ? 'border-green-500 bg-green-50' 
                                        : 'border-stone-200 bg-white hover:border-amber-300 hover:bg-amber-50'
                                    }`}
                                  >
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <p className="font-semibold text-stone-900 text-sm">{option.store}</p>
                                        <p className="text-stone-600 text-xs">{option.product_name}</p>
                                        <p className="text-stone-500 text-xs">{option.size}</p>
                                      </div>
                                      <div className="text-right">
                                        {option.has_loyalty_discount && option.original_price ? (
                                          <>
                                            <p className="text-stone-400 line-through text-xs">R{option.original_price.toFixed(2)}</p>
                                            <p className="text-green-600 font-bold text-sm">R{option.price.toFixed(2)}</p>
                                            <Badge className="text-xs mt-1 bg-green-100 text-green-800">Loyalty</Badge>
                                          </>
                                        ) : (
                                          <p className="font-bold text-stone-900 text-sm">R{option.price.toFixed(2)}</p>
                                        )}
                                      </div>
                                    </div>
                                    {isSelected && (
                                      <div className="mt-2 pt-2 border-t border-green-200">
                                        <p className="text-xs text-green-700 font-medium">✓ This option will be used</p>
                                      </div>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                            <p className="text-xs text-amber-600 italic mt-2">
                              💡 Prices refresh before each delivery
                            </p>
                          </div>
                        ) : (
                          <div className="p-3 text-center">
                            <Loader2 className="w-4 h-4 animate-spin mx-auto text-stone-400" />
                            <p className="text-xs text-stone-500 mt-1">Finding products...</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <Button onClick={() => setStep(3)} className="w-full" disabled={formData.items_template.length === 0}>
              Next: Schedule & Settings
            </Button>
          </TabsContent>

          <TabsContent value="step3" className="space-y-4 mt-4">
            <div>
              <Label>Run on Day of Month (1-28) *</Label>
              <Input
                type="number"
                min="1"
                max="28"
                value={formData.schedule_day}
                onChange={(e) => setFormData({...formData, schedule_day: parseInt(e.target.value) || 1})}
              />
              <p className="text-xs text-stone-500 mt-1">
                Order will be scheduled for day {formData.schedule_day} of each month
              </p>
            </div>

            <div>
              <Label>Notification Preference</Label>
              <Select
                value={formData.notification_preference}
                onValueChange={(value) => setFormData({...formData, notification_preference: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="review_before_order">
                    Review before order (Recommended) - You'll approve payment
                  </SelectItem>
                  <SelectItem value="auto_approve_notify_after">
                    Auto-approve & notify after - Payment auto-processes
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-stone-500 mt-1">
                {formData.notification_preference === 'review_before_order' 
                  ? 'You\'ll review items and approve payment before each order'
                  : 'Order processes automatically, you get SMS confirmation after'}
              </p>
            </div>

            <div>
              <Label>Notify Me (Days Before)</Label>
              <Input
                type="number"
                min="1"
                max="7"
                value={formData.notification_days_before}
                onChange={(e) => setFormData({...formData, notification_days_before: parseInt(e.target.value) || 3})}
              />
            </div>

            <Button 
              onClick={handleSubmit} 
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Calendar className="w-4 h-4 mr-2" />
              )}
              Create Recurring Order
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
