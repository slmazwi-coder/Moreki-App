import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function MorekiRewardsCard({ icon: Icon, title, description, value, detail, color, bg }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Card className="border-stone-200">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center`}>
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-stone-500 mt-1">{detail}</div>
            </div>
          </div>
          <h3 className="font-semibold text-stone-900 mt-4">{title}</h3>
          <p className="text-sm text-stone-600 mt-1">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
