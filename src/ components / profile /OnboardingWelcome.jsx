import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Building2, User, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    icon: User,
    title: "Create Your Profile",
    description: "Tell us about yourself"
  },
  {
    icon: MapPin,
    title: "Set Your Location",
    description: "Help us find malls near you"
  },
  {
    icon: Building2,
    title: "Choose Your Mall",
    description: "Select your preferred mall hub"
  },
  {
    icon: CheckCircle2,
    title: "Start Shopping",
    description: "We'll shop from all stores in your mall"
  }
];

export default function OnboardingWelcome() {
  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
      <CardHeader>
        <CardTitle className="text-center text-2xl">
          Welcome to Moreki! 🛍️
        </CardTitle>
        <p className="text-center text-stone-600 mt-2">
          Let's get you set up in 3 quick steps
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <step.icon className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-stone-800 text-sm">{step.title}</h4>
              <p className="text-xs text-stone-500 mt-1">{step.description}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-6 p-4 bg-white rounded-lg border border-amber-200">
          <p className="text-sm text-stone-700">
            <strong>How it works:</strong> Moreki is mall-based. You choose ONE mall, 
            and we shop from ALL the stores inside that mall (Spar, Woolworths, Pick n Pay, etc.) 
            to get you the best deals - all in one trip!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
