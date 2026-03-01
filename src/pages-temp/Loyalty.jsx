import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CreditCard, 
  Plus, 
  Trophy,
  TrendingUp,
  Gift,
  Star,
  Percent,
  ShoppingBag,
  Award,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";

import AddLoyaltyCardModal from '../components/loyalty/AddLoyaltyCardModal';
import LoyaltyCardItem from '../components/loyalty/LoyaltyCardItem';
import MorekiRewardsCard from '../components/loyalty/MorekiRewardsCard';
import PointsHistory from '../components/loyalty/PointsHistory';

export default function Loyalty() {
  const [showAddCard, setShowAddCard] = useState(false);

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  // Fetch user's loyalty cards
  const { data: loyaltyCards = [], isLoading: cardsLoading } = useQuery({
    queryKey: ['loyalty-cards', user?.id],
    queryFn: () => base44.entities.LoyaltyCard.filter({ created_by: user?.email }),
    enabled: !!user?.email,
  });

  // Fetch Moreki loyalty points
  const { data: morekiPoints = [] } = useQuery({
    queryKey: ['moreki-points', user?.id],
    queryFn: () => base44.entities.MorekiLoyaltyPoints.filter({ user_id: user?.id }),
    enabled: !!user?.id,
  });

  const userPoints = morekiPoints[0] || {
    total_points: 0,
    current_tier: 'bronze',
    service_fee_percentage: 5.0,
    total_orders: 0,
    total_spent: 0
  };

  // Tier configuration
  const tierConfig = {
    bronze: { min: 0, max: 499, color: 'text-orange-700', bg: 'bg-orange-100', icon: Award },
    silver: { min: 500, max: 1499, color: 'text-gray-600', bg: 'bg-gray-100', icon: Star },
    gold: { min: 1500, max: 3999, color: 'text-yellow-600', bg: 'bg-yellow-100', icon: Trophy },
    platinum: { min: 4000, max: Infinity, color: 'text-purple-600', bg: 'bg-purple-100', icon: Sparkles }
  };

  const currentTier = tierConfig[userPoints.current_tier] || tierConfig.bronze;
  const TierIcon = currentTier.icon;
  const nextTier = userPoints.current_tier === 'platinum' ? null : 
    Object.entries(tierConfig).find(([key, val]) => val.min > userPoints.total_points);
  const pointsToNextTier = nextTier ? nextTier[1].min - userPoints.total_points : 0;

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <TabsTrigger value="cards" className="data-[state=active]:bg-amber-100">
              <CreditCard className="w-4 h-4 mr-2" />
              Store Cards ({loyaltyCards.length})
            </TabsTrigger>
          </TabsList>

          {/* Moreki Rewards Tab */}
          <TabsContent value="moreki" className="space-y-6">
            {/* Current Tier Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-stone-200 bg-gradient-to-br from-amber-50 to-orange-50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <TierIcon className={`w-6 h-6 ${currentTier.color}`} />
                        {userPoints.current_tier.charAt(0).toUpperCase() + userPoints.current_tier.slice(1)} Member
                      </CardTitle>
                      <CardDescription>
                        {userPoints.total_points} points earned
                      </CardDescription>
                    </div>
                    <Badge className={`${currentTier.bg} ${currentTier.color} text-lg px-4 py-2`}>
                      {userPoints.service_fee_percentage}% Fee
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress to next tier */}
                  {nextTier && (
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-stone-600">Progress to {nextTier[0]}</span>
                        <span className="font-medium text-amber-600">
                          {pointsToNextTier} points to go
                        </span>
                      </div>
                      <div className="w-full bg-stone-200 rounded-full h-3">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ 
                            width: `${((userPoints.total_points - currentTier.min) / (nextTier[1].min - currentTier.min)) * 100}%` 
                          }}
                          className="bg-gradient-to-r from-amber-500 to-orange-600 h-3 rounded-full"
                        />
                      </div>
                    </div>
                  )}

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-stone-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-stone-900">{userPoints.total_orders}</div>
                      <div className="text-xs text-stone-500">Orders</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-stone-900">R{userPoints.total_spent?.toFixed(0) || 0}</div>
                      <div className="text-xs text-stone-500">Total Spent</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-600">
                        {((5 - userPoints.service_fee_percentage) / 1.5 * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-stone-500">Fee Saved</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MorekiRewardsCard
                icon={Percent}
                title="Service Fee Discount"
                description="Currently paying"
                value={`${userPoints.service_fee_percentage}%`}
                detail="Down from 5%"
                color="text-green-600"
                bg="bg-green-50"
              />
              <MorekiRewardsCard
                icon={TrendingUp}
                title="Points Multiplier"
                description={`${userPoints.current_tier} tier bonus`}
                value={`${userPoints.current_tier === 'platinum' ? '2x' : userPoints.current_tier === 'gold' ? '1.5x' : '1x'}`}
                detail="Earn more points per order"
                color="text-purple-600"
                bg="bg-purple-50"
              />
            </div>

            {/* How to Earn Points */}
            <Card className="border-stone-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-amber-600" />
                  How to Earn Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { action: 'Complete an order', points: '10 points + R1 = 1 point' },
                    { action: 'Order 5+ times in a month', points: '50 bonus points' },
                    { action: 'Refer a friend', points: '100 points' },
                    { action: 'First order of the month', points: '20 points' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                      <span className="text-stone-700">{item.action}</span>
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                        {item.points}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Points History */}
            <PointsHistory history={userPoints.points_history || []} />
          </TabsContent>

          {/* Store Cards Tab */}
          <TabsContent value="cards" className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-stone-600">
                Add your store loyalty cards to automatically apply rewards and get better prices
              </p>
              <Button
                onClick={() => setShowAddCard(true)}
                className="bg-gradient-to-r from-amber-500 to-orange-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Card
              </Button>
            </div>

            {cardsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto" />
              </div>
            ) : loyaltyCards.length === 0 ? (
              <Card className="border-stone-200">
                <CardContent className="py-12 text-center">
                  <CreditCard className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-stone-900 mb-2">No loyalty cards yet</h3>
                  <p className="text-stone-600 mb-6">
                    Add your store loyalty cards to get automatic rewards and better prices
                  </p>
                  <Button
                    onClick={() => setShowAddCard(true)}
                    className="bg-gradient-to-r from-amber-500 to-orange-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Card
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loyaltyCards.map((card) => (
                  <LoyaltyCardItem key={card.id} card={card} />
                ))}
              </div>
            )}

            {/* Info Section */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Automatic Rewards</h4>
                    <p className="text-sm text-blue-700">
                      When you add your loyalty cards, Moreki automatically applies them when searching for products. 
                      You'll see both regular and reward prices, helping you maximize savings!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Card Modal */}
      <AddLoyaltyCardModal
        open={showAddCard}
        onClose={() => setShowAddCard(false)}
      />
    </div>
  );
}
