import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, TrendingUp, ShoppingBag, Gift, UserPlus } from "lucide-react";
import { format } from 'date-fns';

const reasonIcons = {
  'order': ShoppingBag,
  'bonus': Gift,
  'referral': UserPlus,
  'milestone': TrendingUp
};

export default function PointsHistory({ history }) {
  if (!history || history.length === 0) {
    return (
      <Card className="border-stone-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-stone-600" />
            Points History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <History className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500">No points history yet</p>
            <p className="text-sm text-stone-400 mt-1">
              Start shopping to earn your first points!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-stone-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5 text-stone-600" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {history.slice(0, 10).map((entry, idx) => {
            const IconComponent = reasonIcons[entry.reason] || ShoppingBag;
            return (
              <div key={idx} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <IconComponent className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-900 capitalize">
                      {entry.reason.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-stone-500">
                      {format(new Date(entry.date), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <Badge className={`${entry.points > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {entry.points > 0 ? '+' : ''}{entry.points} pts
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
