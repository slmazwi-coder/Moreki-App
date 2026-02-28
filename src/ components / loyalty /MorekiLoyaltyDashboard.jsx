import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Star, 
  TrendingUp, 
  ShoppingBag,
  Percent,
  Award
} from "lucide-react";

const tierInfo = {
  Bronze: { color: 'bg-orange-700', next: 'Silver', pointsNeeded: 500, minOrders: 0 },
  Silver: { color: 'bg-gray-400', next: 'Gold', pointsNeeded: 1500, minOrders: 5 },
  Gold: { color: 'bg-yellow-500', next: 'Platinum', pointsNeeded: 3000, minOrders: 15 },
  Platinum: { color: 'bg-purple-600', next: null, pointsNeeded: 0, minOrders: 30 }
};

const calculateServiceFee = (points, orders) => {
  // Start at 5%, reduce to 3.5% based on points and orders
  let fee = 5.0;
  
  if (points >= 3000 && orders >= 30) {
    fee = 3.5; // Platinum
  } else if (points >= 1500 && orders >= 15) {
    fee = 4.0; // Gold
  } else if (points >= 500 && orders >= 5) {
    fee = 4.5; // Silver
  }
  
  return fee;
};

export default function MorekiLoyaltyDashboard({ loyalty }) {
  const tier = tierInfo[loyalty.tier];
  const serviceFee = calculateServiceFee(loyalty.points, loyalty.total_orders);
  const savings = ((5.0 - serviceFee) / 5.0) * 100;
  
  const progressToNext = tier.next 
    ? (loyalty.points / tier.pointsNeeded) * 100 
    : 100;

  return (
    <div className="space-y-6">
      {/* Current Tier Card */}
      <Card className={`border-2 bg-gradient-to-br from-white to-stone-50`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${tier.color} rounded-full flex items-center justify-center`}>
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">{loyalty.tier} Member</CardTitle>
                <p className="text-sm text-stone-600">
                  Service Fee: <strong>{serviceFee}%</strong> {savings > 0 && `(${savings.toFixed(0)}% savings!)`}
                </p>
              </div>
            </div>
            <Badge className={`${tier.color} text-white text-lg px-4 py-2`}>
              {loyalty.points} pts
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {tier.next && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-stone-600">Progress to {tier.next}</span>
                <span className="font-medium">{loyalty.points} / {tier.pointsNeeded} pts</span>
              </div>
              <Progress value={progressToNext} className="h-2" />
              <p className="text-xs text-stone-500 mt-2">
                {tier.pointsNeeded - loyalty.points} more points to reach {tier.next} tier
              </p>
            </div>
          )}
          
          {loyalty.tier === 'Platinum' && (
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 text-center">
              <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-purple-900">
                🎉 You've reached the highest tier! Enjoy 3.5% service fee.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

 
