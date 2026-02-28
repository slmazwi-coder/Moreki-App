import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingBag, 
  Search, 
  Sparkles, 
  ListPlus,
  Package,
  Loader2,
  ArrowRight,
  Building2,
  Mic,
  Keyboard
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import AddItemForm from '../components/shopping/AddItemForm';
import VoiceShoppingInput from '../components/shopping/VoiceShoppingInput';
import ShoppingItemCard from '../components/shopping/ShoppingItemCard';
import ProductOptionCard from '../components/shopping/ProductOptionCard';
import MallSelector from '../components/shopping/MallSelector';
import DeliverySelector from '../components/shopping/DeliverySelector';
import OrderSummary from '../components/shopping/OrderSummary';
import SelectedItemsReview from '../components/shopping/SelectedItemsReview';

export default function ShoppingList() {
  const [activeList, setActiveList] = useState(null);
  const [newListName, setNewListName] = useState('');
  const [selectedMall, setSelectedMall] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card_online');
  const [calculatedDeliveryFee, setCalculatedDeliveryFee] = useState(45);
  const [searchingItemId, setSearchingItemId] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [activeTab, setActiveTab] = useState('items');
  const [profileChecked, setProfileChecked] = useState(false);
  const [inputMode, setInputMode] = useState('text'); // 'text' or 'voice'

  const queryClient = useQueryClient();

  // Check for user profile
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: user?.id }),
    enabled: !!user?.id,
  });

  const profile = profiles[0];

  // Fetch Moreki loyalty for service fee discount
  const { data: morekiLoyalty = [] } = useQuery({
    queryKey: ['moreki-loyalty', user?.id],
    queryFn: () => base44.entities.MorekiLoyalty.filter({ user_id: user?.id }),
    enabled: !!user?.id,
  });

  const loyalty = morekiLoyalty[0];
  const loyaltyServiceFee = loyalty?.service_fee_percentage || 5.0;

  // Only redirect to profile if incomplete (first-time setup only)
  useEffect(() => {
    if (!user) return;
    
    if (!profile) {
      // New user, needs to create profile
      window.location.href = createPageUrl("Profile");
      return;
    }
    
    // Check if profile is complete
    const isProfileComplete = profile.preferred_mall && profile.default_address;
    
    if (!isProfileComplete) {
      // Profile incomplete, redirect to complete it (one-time)
      window.location.href = createPageUrl("Profile");
      return;
    }
    
    // Profile is complete, proceed with shopping
    setSelectedMall(profile.preferred_mall);
    setProfileChecked(true);
  }, [user, profile]);

  // Fetch shopping lists
  const { data: lists = [], isLoading: listsLoading } = useQuery({
    queryKey: ['shopping-lists'],
    queryFn: () => base44.entities.ShoppingList.list('-created_date', 10),
  });

  // Fetch items for active list
  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['shopping-items', activeList?.id],
    queryFn: () => base44.entities.ShoppingItem.filter({ shopping_list_id: activeList?.id }),
    enabled: !!activeList?.id,
  });

  // Fetch product options for items
  const { data: allOptions = [] } = useQuery({
    queryKey: ['product-options', activeList?.id],
    queryFn: async () => {
      if (!items.length) return [];
      const itemIds = items.map(i => i.id);
      const options = await base44.entities.ProductOption.list();
      return options.filter(o => itemIds.includes(o.shopping_item_id));
    },
    enabled: items.length > 0,
  });

  // Create list mutation
  const createListMutation = useMutation({
    mutationFn: (data) => base44.entities.ShoppingList.create(data),
    onSuccess: (newList) => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
      setActiveList(newList);
      setNewListName('');
    },
  });

  // Create item mutation
  const createItemMutation = useMutation({
    mutationFn: (data) => base44.entities.ShoppingItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-items', activeList?.id] });
    },
  });

  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: (id) => base44.entities.ShoppingItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-items', activeList?.id] });
    },
  });

  // Fetch actual malls with store directories
  const { data: malls = [] } = useQuery({
    queryKey: ['malls'],
    queryFn: () => base44.entities.Mall.list(),
  });

  // Get selected mall's store directory
  const selectedMallData = malls.find(m => m.name === selectedMall);
  const availableStores = selectedMallData?.stores || [];
  const availableStoreNames = availableStores.map(s => s.name);

  // Fetch user's loyalty cards
  const { data: loyaltyCards = [] } = useQuery({
    queryKey: ['loyalty-cards', user?.id],
    queryFn: () => base44.entities.LoyaltyCard.filter({ created_by: user?.email, is_active: true }),
    enabled: !!user?.email,
  });

  // Search for product options using AI agent with real-time pricing and loyalty integration
  const searchProductOptions = async (item) => {
    // Validate if preferred store exists in selected mall
    if (item.preferred_store && !availableStoreNames.includes(item.preferred_store)) {
      alert(`⚠️ ${item.preferred_store} is not available at ${selectedMall}. We'll search other stores in the mall.`);
    }

    setSearchingItemId(item.id);
    
    // Update item status
    await base44.entities.ShoppingItem.update(item.id, { status: 'searching' });
    queryClient.invalidateQueries({ queryKey: ['shopping-items', activeList?.id] });

    // Build loyalty cards context
    const loyaltyCardsContext = loyaltyCards.length > 0 
      ? `User has active loyalty cards for: ${loyaltyCards.map(c => `${c.store_name} (Card: ${c.card_number})`).join(', ')}. 
         CRITICAL: Use these cards to fetch REAL-TIME loyalty pricing from store APIs.
         For stores with loyalty cards, ALWAYS show both original_price and discounted price.
         Loyalty discounts: Spar 10-15%, Woolworths 5-10%, Pick n Pay 5-8%, Checkers 5-12%.`
      : '';

    // Use AI agent to fetch real-time pricing from store APIs
    const prompt = `REAL-TIME PRICING REQUEST for ${selectedMall} mall, South Africa:

Product Request:
- Name: ${item.name}
- Category: ${item.category}
${item.preferred_brand ? `- Preferred brand: ${item.preferred_brand}` : ''}
${item.preferred_store ? `- Preferred store: ${item.preferred_store}` : ''}
${item.size ? `- Size: ${item.size}` : ''}
${item.flavor_or_color ? `- Variant: ${item.flavor_or_color}` : ''}

AVAILABLE STORES IN ${selectedMall}:
${availableStoreNames.join(', ')}

CRITICAL: ONLY return products from stores listed above. If a store is not in this list, DO NOT include it.

${loyaltyCardsContext}

INSTRUCTIONS:
1. Search ONLY stores in the available list above
2. If preferred store is not available, notify user and search alternatives
3. Fetch REAL-TIME pricing from store APIs/databases
4. Apply user's loyalty card discounts automatically
5. Return exactly 3 product options from different stores that exist in this mall
6. For loyalty card stores: MUST include both original_price (regular) and price (after loyalty discount)
7. Include current promotions and sales
8. Mark items on sale with is_on_sale=true
9. Recommend best value option

Return realistic ZAR prices with real-time data.`;

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
                discount_percentage: { type: "number" },
                size: { type: "string" },
                in_stock: { type: "boolean" },
                is_recommended: { type: "boolean" },
                recommendation_reason: { type: "string" },
                has_loyalty_discount: { type: "boolean" }
              }
            }
          }
        }
      }
    });

    // Create product options in database with real-time pricing
    for (const opt of response.options) {
      await base44.entities.ProductOption.create({
        shopping_item_id: item.id,
        ...opt
      });
    }

    // Update item status
    await base44.entities.ShoppingItem.update(item.id, { status: 'options_found' });
    queryClient.invalidateQueries({ queryKey: ['shopping-items', activeList?.id] });
    queryClient.invalidateQueries({ queryKey: ['product-options', activeList?.id] });
    setSearchingItemId(null);
  };

  const handleCreateList = (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    createListMutation.mutate({ name: newListName, status: 'draft' });
  };

  const handleAddItem = (itemData) => {
    createItemMutation.mutate({
      ...itemData,
      shopping_list_id: activeList.id,
      status: 'pending'
    });
  };

  const handleAddMultipleItems = async (items) => {
    for (const itemData of items) {
      await base44.entities.ShoppingItem.create({
        ...itemData,
        shopping_list_id: activeList.id,
        status: 'pending'
      });
    }
    queryClient.invalidateQueries({ queryKey: ['shopping-items', activeList.id] });
  };

  const handleSelectOption = (itemId, option, quantity) => {
    setSelectedOptions(prev => {
      const current = prev[itemId];
      if (current?.optionId === option.id) {
        const newState = { ...prev };
        delete newState[itemId];
        return newState;
      }
      return { 
        ...prev, 
        [itemId]: { 
          ...option, 
          optionId: option.id,
          quantity,
          totalPrice: option.price * quantity
        } 
      };
    });
  };

  // Fetch Moreki loyalty points for service fee calculation
  const { data: morekiPoints = [] } = useQuery({
    queryKey: ['moreki-points', user?.id],
    queryFn: () => base44.entities.MorekiLoyaltyPoints.filter({ user_id: user?.id }),
    enabled: !!user?.id,
  });

  const userPoints = morekiPoints[0];
  const serviceFeePercentage = userPoints?.service_fee_percentage || 5.0;

  const selectedOptionsList = Object.values(selectedOptions);
  const orderSubtotal = selectedOptionsList.reduce((sum, opt) => sum + (opt.totalPrice || opt.price), 0);
  const orderTotal = orderSubtotal + (orderSubtotal * (serviceFeePercentage / 100)) + (deliveryMethod === 'delivery' ? calculatedDeliveryFee : 0);

  const handleRemoveSelection = (itemId) => {
    setSelectedOptions(prev => {
      const newState = { ...prev };
      delete newState[itemId];
      return newState;
    });
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    setSelectedOptions(prev => {
      const option = prev[itemId];
      if (!option) return prev;
      
      return {
        ...prev,
        [itemId]: {
          ...option,
          quantity: newQuantity,
          totalPrice: option.price * newQuantity
        }
      };
    });
  };

  // Group items by status
  const itemsWithOptions = items.filter(i => i.status === 'options_found' || i.status === 'selected');
  const pendingItems = items.filter(i => i.status === 'pending' || i.status === 'searching');

  if (!profileChecked) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-stone-900">Shopping List</h1>
            <p className="text-stone-600 mt-1">
              Shopping from stores in <strong>{selectedMall}</strong>
            </p>
          </div>
          <div className="flex items-center gap-3">
            {activeList && (
              <Badge className="bg-amber-100 text-amber-800 px-4 py-2 text-sm">
                <Package className="w-4 h-4 mr-2" />
                {activeList.name}
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = createPageUrl("Profile")}
              className="border-stone-200"
            >
              <Building2 className="w-4 h-4 mr-2" />
              Change Mall
            </Button>
          </div>
        </div>

        {/* No Active List */}
        {!activeList && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ListPlus className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-stone-800 mb-2">Create a Shopping List</h2>
              <p className="text-stone-500 mb-6">Start by naming your shopping list</p>
              
              <form onSubmit={handleCreateList} className="space-y-4">
                <Input
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="e.g., Weekly Groceries"
                  className="text-center border-stone-200"
                />
                <Button
                  type="submit"
                  disabled={!newListName.trim() || createListMutation.isPending}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                >
                  {createListMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Create List
                </Button>
              </form>

              {lists.length > 0 && (
                <div className="mt-8 pt-6 border-t border-stone-200">
                  <p className="text-sm text-stone-500 mb-3">Or continue with an existing list</p>
                  <div className="space-y-2">
                    {lists.slice(0, 3).map((list) => (
                      <button
                        key={list.id}
                        onClick={() => setActiveList(list)}
                        className="w-full text-left p-3 rounded-lg border border-stone-200 hover:border-amber-300 hover:bg-amber-50 transition-colors"
                      >
                        <span className="font-medium text-stone-800">{list.name}</span>
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {list.status}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Active List */}
        {activeList && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-white border border-stone-200">
                  <TabsTrigger value="items" className="data-[state=active]:bg-amber-100">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    My Items ({items.length})
                  </TabsTrigger>
                  <TabsTrigger value="options" className="data-[state=active]:bg-amber-100">
                    <Search className="w-4 h-4 mr-2" />
                    Found Options ({allOptions.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="items" className="space-y-4 mt-4">
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
                    <AddItemForm 
                      onAddItem={handleAddItem} 
                      isLoading={createItemMutation.isPending} 
                    />
                  ) : (
                    <VoiceShoppingInput
                      onAddItems={handleAddMultipleItems}
                      isLoading={createItemMutation.isPending}
                    />
                  )}
                  
                  {itemsLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                    </div>
                  ) : items.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-stone-200">
                      <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                      <p className="text-stone-500">No items yet. Add your first item above!</p>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {items.map((item) => (
                        <ShoppingItemCard
                          key={item.id}
                          item={item}
                          onDelete={(id) => deleteItemMutation.mutate(id)}
                          onSearch={searchProductOptions}
                          isSearching={searchingItemId === item.id}
                        />
                      ))}
                    </AnimatePresence>
                  )}

                  {pendingItems.length > 0 && pendingItems.every(i => i.status === 'pending') && (
                    <Button
                      onClick={() => pendingItems.forEach(searchProductOptions)}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 py-6"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Search All Items for Best Deals
                    </Button>
                  )}
                </TabsContent>

                <TabsContent value="options" className="space-y-6 mt-4">
                  {itemsWithOptions.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-stone-200">
                      <Search className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                      <p className="text-stone-500">
                        No options found yet. Search for items to see available products.
                      </p>
                    </div>
                  ) : (
                    itemsWithOptions.map((item) => {
                      const itemOptions = allOptions.filter(o => o.shopping_item_id === item.id);
                      if (itemOptions.length === 0) return null;

                      return (
                        <div key={item.id} className="space-y-3">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-stone-800 text-lg">{item.name}</h3>
                            {item.quantity > 1 && (
                              <Badge variant="secondary">x{item.quantity}</Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {itemOptions.map((option) => (
                              <ProductOptionCard
                                key={option.id}
                                option={option}
                                quantity={item.quantity}
                                isSelected={selectedOptions[item.id]?.optionId === option.id}
                                onSelect={() => handleSelectOption(item.id, option, item.quantity)}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </TabsContent>
              </Tabs>

              {/* Selected Items Review */}
              {selectedOptionsList.length > 0 && (
                <SelectedItemsReview
                  items={items}
                  selectedOptions={selectedOptions}
                  onRemoveItem={handleRemoveSelection}
                  onUpdateQuantity={handleUpdateQuantity}
                />
              )}

              {/* Delivery & Mall Selection */}
              {selectedOptionsList.length > 0 && (
                <div className="space-y-6">
                  <DeliverySelector
                    method={deliveryMethod}
                    onMethodChange={setDeliveryMethod}
                    deliveryAddress={deliveryAddress}
                    onAddressChange={setDeliveryAddress}
                    pickupTime={pickupTime}
                    onPickupTimeChange={setPickupTime}
                    estimatedDeliveryFee={calculatedDeliveryFee}
                    onDeliveryFeeCalculated={(fee, distance) => setCalculatedDeliveryFee(fee)}
                    selectedMall={selectedMall}
                    paymentMethod={paymentMethod}
                    onPaymentMethodChange={setPaymentMethod}
                    orderTotal={orderTotal}
                  />
                  <MallSelector
                    selectedMall={selectedMall}
                    onSelectMall={setSelectedMall}
                    disabled={true}
                  />
                </div>
              )}
            </div>

            {/* Sidebar - Order Summary */}
            <div className="lg:col-span-1">
              <OrderSummary
                selectedOptions={selectedOptionsList}
                deliveryMethod={deliveryMethod}
                deliveryFee={calculatedDeliveryFee}
                selectedMall={selectedMall}
                serviceFeePercentage={serviceFeePercentage}
                onCheckout={() => {
                  // Navigate to checkout
                  const params = new URLSearchParams({
                    list: activeList.id,
                    mall: selectedMall,
                    delivery: deliveryMethod,
                    payment: paymentMethod,
                    deliveryFee: calculatedDeliveryFee
                  });
                  window.location.href = createPageUrl(`Checkout?${params.toString()}`);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
