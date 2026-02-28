import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CreditCard, 
  Plus, 
  Trophy,
  Star,
  TrendingUp,
  Gift,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";

import AddLoyaltyCardModal from '../components/loyalty/AddLoyaltyCardModal';
import LoyaltyCardItem from '../components/loyalty/LoyaltyCardItem';
import MorekiLoyaltyDashboard from '../components/loyalty/MorekiLoyaltyDashboard';

export default function LoyaltyCards() {
  const [showAddModal, setShowAddModal] = useState(false);

  const queryClient = useQueryClient();

  // Fetch current user
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  // Fetch user's loyalty cards
  const { data: cards = [], isLoading: cardsLoading } = useQuery({
    queryKey: ['loyalty-cards', user?.id],
    queryFn: () => base44.entities.LoyaltyCard.filter({ user_id: user?.id }),
    enabled: !!user?.id,
  });

  // Fetch Moreki loyalty data
  const { data: morekiLoyalty = [], isLoading: loyaltyLoading } = useQuery({
    queryKey: ['moreki-loyalty', user?.id],
    queryFn: () => base44.entities.MorekiLoyalty.filter({ user_id: user?.id }),
    enabled: !!user?.id,
  });

  const loyalty = morekiLoyalty[0];

  // Create Moreki loyalty if doesn't exist
  const createLoyaltyMutation = useMutation({
    mutationFn: () => base44.entities.MorekiLoyalty.create({
      user_id: user.id,
      points: 0,
      tier: 'Bronze',
      service_fee_percentage: 5.0,
      total_orders: 0,
      total_spent: 0
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moreki-loyalty', user?.id] });
    }
  });

  // Initialize loyalty if needed
  React.useEffect(() => {
    if (user?.id && !loyaltyLoading && morekiLoyalty.length === 0) {
      createLoyaltyMutation.mutate();
    }
  }, [user?.id, loyaltyLoading, morekiLoyalty.length]);

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-900">Loyalty & Rewards</h1>
          <p className="text-stone-600 mt-1">
            Manage your store loyalty cards and track your Moreki rewards
          </p>
        </div>

        <Tabs defaultValue="moreki" className="space-y-6">
          <TabsList className="bg-white border border-stone-200">
            <TabsTrigger value="moreki" className="data-[state=active]:bg-amber-100">
              <Trophy className="w-4 h-4 mr-2" />
              Moreki Rewards
            </TabsTrigger>
            <TabsTrigger value="store-cards" className="data-[state=active]:bg-amber-100">
              <CreditCard className="w-4 h-4 mr-2" />
              Store Loyalty Cards ({cards.length})
            </TabsTrigger>
          </TabsList>

          {/* Moreki Loyalty */}
          <TabsContent value="moreki">
            {loyaltyLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              </div>
            ) : loyalty ? (
              <MorekiLoyaltyDashboard loyalty={loyalty} />
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Trophy className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                  <p className="text-stone-600">Setting up your Moreki loyalty account...</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Store Cards */}
          <TabsContent value="store-cards">
            <div className="space-y-6">
              <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Gift className="w-5 h-5 text-amber-600" />
                    Why Add Your Store Cards?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-stone-700">
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Get Member Prices:</strong> Automatically see Spar, Clicks, and other member-only discounts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Earn Store Points:</strong> Your loyalty cards are applied to purchases so you earn points</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Price Comparison:</strong> See both regular and member prices when shopping</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-stone-800">Your Store Cards</h3>
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="bg-gradient-to-r from-amber-500 to-orange-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Card
                </Button>
              </div>

              {cardsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                </div>
              ) : cards.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CreditCard className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                    <p className="text-stone-600 mb-4">No loyalty cards added yet</p>
                    <Button
                      onClick={() => setShowAddModal(true)}
                      variant="outline"
                      className="border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Card
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cards.map((card) => (
                    <LoyaltyCardItem key={card.id} card={card} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Card Modal */}
        {showAddModal && (
          <AddLoyaltyCardModal
            userId={user?.id}
            onClose={() => setShowAddModal(false)}
            onSuccess={() => {
              setShowAddModal(false);
              queryClient.invalidateQueries({ queryKey: ['loyalty-cards', user?.id] });
            }}
          />
        )}
      </div>
    </div>
  );
}
