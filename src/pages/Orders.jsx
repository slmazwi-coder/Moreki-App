import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Store,
  Loader2,
  ShoppingBag,
  ChevronRight
} from "lucide-react";
import { format } from 'date-fns';
import { motion } from "framer-motion";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const statusConfig = {
  pending_payment: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending Payment' },
  paid: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle2, label: 'Payment Confirmed' },
  processing: { color: 'bg-purple-100 text-purple-800', icon: Package, label: 'Being Prepared' },
  ready_for_pickup: { color: 'bg-green-100 text-green-800', icon: MapPin, label: 'Ready for Pickup' },
  out_for_delivery: { color: 'bg-amber-100 text-amber-800', icon: Truck, label: 'Out for Delivery' },
  delivered: { color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2, label: 'Delivered' },
  completed: { color: 'bg-stone-100 text-stone-800', icon: CheckCircle2, label: 'Completed' },
  cancelled: { color: 'bg-red-100 text-red-800', icon: Clock, label: 'Cancelled' }
};

export default function Orders() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => base44.entities.Order.list('-created_date', 20),
  });

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-stone-900">My Orders</h1>
            <p className="text-stone-600 mt-1">Track and manage your orders</p>
          </div>
          <Link to={createPageUrl("ShoppingList")}>
            <Button className="bg-gradient-to-r from-amber-500 to-orange-600">
              <ShoppingBag className="w-4 h-4 mr-2" />
              New Order
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-stone-800 mb-2">No orders yet</h2>
            <p className="text-stone-500 mb-6">Start shopping to see your orders here</p>
            <Link to={createPageUrl("ShoppingList")}>
              <Button className="bg-gradient-to-r from-amber-500 to-orange-600">
                Create Shopping List
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => {
              const status = statusConfig[order.status] || statusConfig.processing;
              const StatusIcon = status.icon;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-stone-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className={`${status.color} flex items-center gap-1`}>
                              <StatusIcon className="w-3.5 h-3.5" />
                              {status.label}
                            </Badge>
                            <span className="text-sm text-stone-500">
                              #{order.payment_reference?.slice(-8) || order.id.slice(-8)}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-stone-600">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {order.created_date && format(new Date(order.created_date), 'MMM d, yyyy h:mm a')}
                            </span>
                            <span className="flex items-center gap-1">
                              {order.delivery_method === 'pickup' ? (
                                <>
                                  <MapPin className="w-4 h-4" />
                                  Pickup at {order.mall_name}
                                </>
                              ) : (
                                <>
                                  <Truck className="w-4 h-4" />
                                  Shehsha Delivery
                                </>
                              )}
                            </span>
                          </div>

                          {order.stores_breakdown && order.stores_breakdown.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {order.stores_breakdown.map((store, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded-full"
                                >
                                  <Store className="w-3 h-3" />
                                  {store.store} ({store.items_count})
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-stone-900">
                              R{order.total?.toFixed(2)}
                            </p>
                            <p className="text-sm text-stone-500">
                              {order.stores_breakdown?.reduce((sum, s) => sum + s.items_count, 0) || 0} items
                            </p>
                          </div>
                          <Button variant="ghost" size="icon">
                            <ChevronRight className="w-5 h-5 text-stone-400" />
                          </Button>
                        </div>
                      </div>

                      {/* Progress Indicator */}
                      {order.status !== 'completed' && order.status !== 'cancelled' && (
                        <div className="mt-4 pt-4 border-t border-stone-100">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full transition-all"
                                style={{ 
                                  width: order.status === 'paid' ? '25%' : 
                                         order.status === 'processing' ? '50%' : 
                                         order.status === 'ready_for_pickup' || order.status === 'out_for_delivery' ? '75%' : 
                                         order.status === 'delivered' ? '100%' : '10%'
                                }}
                              />
                            </div>
                          </div>
                          <div className="flex justify-between text-xs text-stone-500 mt-2">
                            <span>Paid</span>
                            <span>Preparing</span>
                            <span>Ready</span>
                            <span>Complete</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
