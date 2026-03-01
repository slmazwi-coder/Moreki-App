import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar,
  MapPin,
  Package,
  Bell,
  Pause,
  Play,
  Trash2,
  TruckIcon,
  Store
} from "lucide-react";
import { motion } from "framer-motion";
import { format, parseISO, differenceInDays } from "date-fns";

export default function RecurringOrderCard({ order, onToggleStatus, onDelete }) {
  const isPaused = order.status === 'paused';
  const daysUntilNext = order.next_run_date ? 
    differenceInDays(parseISO(order.next_run_date), new Date()) : null;

  const notificationText = order.notification_preference === 'auto_approve_notify_after' 
    ? 'Auto-approve (SMS after)'
    : 'Review before order';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card className={`border-2 ${isPaused ? 'border-stone-300 bg-stone-50' : 'border-green-200 bg-white'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2">{order.name}</CardTitle>
              {order.description && (
                <p className="text-sm text-stone-500">{order.description}</p>
              )}
            </div>
            <Badge 
              className={isPaused ? 'bg-stone-200 text-stone-700' : 'bg-green-100 text-green-700'}
            >
              {order.status}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Schedule Info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-stone-600">
              <Calendar className="w-4 h-4 text-amber-500" />
              <div>
                <p className="text-xs text-stone-400">Next Order</p>
                <p className="font-medium text-stone-800">
                  {order.next_run_date ? format(parseISO(order.next_run_date), 'MMM d, yyyy') : 'Not scheduled'}
                </p>
                {daysUntilNext !== null && daysUntilNext >= 0 && (
                  <p className="text-xs text-amber-600">
                    {daysUntilNext === 0 ? 'Today!' : `in ${daysUntilNext} days`}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-stone-600">
              <Package className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-xs text-stone-400">Items</p>
                <p className="font-medium text-stone-800">{order.items_template?.length || 0} items</p>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="space-y-2">
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-stone-600">{order.delivery_address}</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {order.delivery_method === 'delivery' ? (
                <TruckIcon className="w-4 h-4 text-green-500" />
              ) : (
                <Store className="w-4 h-4 text-purple-500" />
              )}
              <p className="text-stone-600">
                {order.delivery_method === 'delivery' ? 'Delivery' : 'Pickup'} • {order.preferred_mall}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Bell className="w-4 h-4 text-amber-500" />
              <p className="text-stone-600">
                {notificationText} • {order.notification_days_before} days before
              </p>
            </div>
          </div>

          {/* Stats */}
          {order.total_orders_created > 0 && (
            <div className="pt-3 border-t border-stone-200">
              <p className="text-xs text-stone-500">
                Total orders created: <strong>{order.total_orders_created}</strong>
                {order.last_triggered_date && (
                  <> • Last: {format(parseISO(order.last_triggered_date), 'MMM d, yyyy')}</>
                )}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleStatus(order.id, isPaused ? 'active' : 'paused')}
              className="flex-1"
            >
              {isPaused ? (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm(`Delete "${order.name}"? This cannot be undone.`)) {
                  onDelete(order.id);
                }
              }}
              className="text-red-500 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
