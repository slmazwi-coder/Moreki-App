import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar,
  Plus,
  Repeat,
  MapPin,
  Package,
  Bell,
  Pause,
  Play,
  Trash2,
  Edit,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, addMonths, parseISO, differenceInDays } from "date-fns";
import CreateRecurringOrderModal from '../components/recurring/CreateRecurringOrderModal';
import RecurringOrderCard from '../components/recurring/RecurringOrderCard';

export default function RecurringOrders() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: recurringOrders = [], isLoading } = useQuery({
    queryKey: ['recurring-orders'],
    queryFn: () => base44.entities.RecurringOrder.list('-created_date', 50),
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const activeOrders = recurringOrders.filter(o => o.status === 'active');
  const pausedOrders = recurringOrders.filter(o => o.status === 'paused');

  // Get upcoming orders (within next 7 days)
  const upcomingOrders = activeOrders.filter(order => {
    if (!order.next_run_date) return false;
    const daysUntil = differenceInDays(parseISO(order.next_run_date), new Date());
    return daysUntil >= 0 && daysUntil <= 7;
  }).sort((a, b) => new Date(a.next_run_date) - new Date(b.next_run_date));

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.RecurringOrder.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-orders'] });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: (id) => base44.entities.RecurringOrder.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-orders'] });
    },
  });

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-stone-900 flex items-center gap-3">
              <Repeat className="w-8 h-8 text-amber-500" />
              Recurring Orders
            </h1>
            <p className="text-stone-600 mt-1">
              Set up automatic monthly orders for your family
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Recurring Order
          </Button>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-700">{activeOrders.length}</p>
                  <p className="text-sm text-green-600">Active Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-700">{upcomingOrders.length}</p>
                  <p className="text-sm text-amber-600">Due This Week</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-stone-200 bg-stone-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center">
                  <Pause className="w-6 h-6 text-stone-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-stone-700">{pausedOrders.length}</p>
                  <p className="text-sm text-stone-600">Paused Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Orders Alert */}
        {upcomingOrders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Bell className="w-5 h-5" />
                  Upcoming Orders - Action Required
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingOrders.map((order) => {
                  const daysUntil = differenceInDays(parseISO(order.next_run_date), new Date());
                  return (
                    <div key={order.id} className="bg-white rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-stone-800">{order.name}</h4>
                        <p className="text-sm text-stone-500">
                          Scheduled for {format(parseISO(order.next_run_date), 'MMMM d, yyyy')}
                          {daysUntil === 0 ? ' (Today!)' : ` (${daysUntil} days)`}
                        </p>
                      </div>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Review & Approve
                      </Button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Orders List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : recurringOrders.length === 0 ? (
          <Card className="border-stone-200">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Repeat className="w-8 h-8 text-stone-400" />
              </div>
              <h3 className="text-xl font-semibold text-stone-800 mb-2">No Recurring Orders Yet</h3>
              <p className="text-stone-500 mb-6 max-w-md mx-auto">
                Create your first recurring order to automatically send groceries or supplies to your family every month.
              </p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Order
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Active Orders */}
            {activeOrders.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-stone-800 mb-4">Active Orders</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <AnimatePresence>
                    {activeOrders.map((order) => (
                      <RecurringOrderCard
                        key={order.id}
                        order={order}
                        onToggleStatus={(id, status) => toggleStatusMutation.mutate({ id, status })}
                        onDelete={(id) => deleteOrderMutation.mutate(id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Paused Orders */}
            {pausedOrders.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-stone-800 mb-4">Paused Orders</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <AnimatePresence>
                    {pausedOrders.map((order) => (
                      <RecurringOrderCard
                        key={order.id}
                        order={order}
                        onToggleStatus={(id, status) => toggleStatusMutation.mutate({ id, status })}
                        onDelete={(id) => deleteOrderMutation.mutate(id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CreateRecurringOrderModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
