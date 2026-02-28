import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { 
  ListPlus, 
  Search, 
  CreditCard, 
  Package, 
  Truck, 
  MapPin,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    icon: ListPlus,
    title: "Create Your Shopping List",
    description: "Add items to your list with details like brand preference, size, quantity, and your preferred store. The more details you provide, the better we can find exactly what you need.",
    color: "bg-blue-500"
  },
  {
    icon: Sparkles,
    title: "AI Searches Your Mall",
    description: "Moreki's AI instantly searches all stores inside your selected mall (Spar, Woolworths, Pick n Pay, Checkers, etc.) to find your items and compare prices.",
    color: "bg-purple-500"
  },
  {
    icon: Search,
    title: "Review Options & Deals",
    description: "We present you with at least 3 options for each item, highlighting sales, discounts, and the best value choices. You pick what suits you best.",
    color: "bg-amber-500"
  },
  {
    icon: CreditCard,
    title: "One Simple Payment",
    description: "Pay once for everything, regardless of how many stores your items come from. Moreki handles paying each store on your behalf.",
    color: "bg-green-500"
  },
  {
    icon: Package,
    title: "We Gather Your Items",
    description: "Our team at the mall hub collects all your items from the different stores and consolidates them into one package.",
    color: "bg-orange-500"
  },
  {
    icon: Truck,
    title: "Pickup or Delivery",
    description: "Choose to collect from the mall hub at your convenience, or have our team deliver straight to your door.",
    color: "bg-rose-500"
  }
];

const benefits = [
  "Save time - no more walking between stores",
  "Save money - we find the best deals for you",
  "No car needed - delivery to your door",
  "Compare prices across 7+ major retailers",
  "One payment, multiple stores",
  "Track your order in real-time"
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-stone-50">
      {/* Hero */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-stone-900">
              How Moreki Works
            </h1>
            <p className="mt-6 text-xl text-stone-600 max-w-2xl mx-auto">
              Your AI shopping assistant that compares prices, finds deals, and delivers everything in one simple order
            </p>
          </motion.div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="space-y-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`flex flex-col md:flex-row items-center gap-8 ${
                  index % 2 === 1 ? 'md:flex-row-reverse' : ''
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 ${step.color} rounded-xl flex items-center justify-center text-white`}>
                      <step.icon className="w-6 h-6" />
                    </div>
                    <span className="text-6xl font-bold text-stone-200">{index + 1}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-stone-900 mb-3">{step.title}</h2>
                  <p className="text-stone-600 text-lg leading-relaxed">{step.description}</p>
                </div>
                <div className="flex-shrink-0 w-full md:w-80 h-48 bg-gradient-to-br from-stone-100 to-stone-200 rounded-2xl flex items-center justify-center">
                  <step.icon className={`w-20 h-20 ${step.color.replace('bg-', 'text-')} opacity-20`} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery Section */}
      <section className="py-20 bg-gradient-to-r from-amber-500 to-orange-600">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-white">
              <h2 className="text-3xl font-bold mb-4">Convenient Delivery</h2>
              <p className="text-xl text-amber-100 mb-6">
                Get your items delivered right to your doorstep or pick them up at the mall hub. 
                Fast, reliable, and convenient delivery across South Africa.
              </p>
              <ul className="space-y-3">
                {[
                  "Same-day delivery available",
                  "Real-time tracking",
                  "Affordable rates based on distance",
                  "Multiple payment options"
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-amber-100">
                    <CheckCircle2 className="w-5 h-5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full md:w-80 h-60 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center">
              <Truck className="w-24 h-24 text-white/30" />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-stone-900 text-center mb-12">
            Why Choose Moreki?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-stone-200"
              >
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-stone-700 font-medium">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-stone-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to shop smarter?
          </h2>
          <p className="text-xl text-stone-400 mb-8">
            Join thousands of South Africans saving time and money with Moreki
          </p>
          <Link to={createPageUrl("ShoppingList")}>
            <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-8 py-6 text-lg rounded-xl">
              <ShoppingBag className="w-5 h-5 mr-2" />
              Start Shopping Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
