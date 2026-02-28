import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { 
  ShoppingBag, 
  Search, 
  CreditCard, 
  Truck, 
  MapPin, 
  Sparkles,
  ChevronRight,
  Store,
  Clock,
  Shield
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Search,
    title: "AI Price Comparison",
    description: "Our AI shops all stores inside your selected mall to find you the best deals on every item"
  },
  {
    icon: CreditCard,
    title: "One Payment",
    description: "Pay once for all your items across multiple stores - we handle the rest"
  },
  {
    icon: MapPin,
    title: "Mall Hub Pickup",
    description: "Collect everything from one convenient location at your chosen mall"
  },
  {
    icon: Truck,
    title: "Shehsha Delivery",
    description: "Get your groceries delivered to your door by Santaco's trusted Shehsha service"
  }
];

const stores = ["Spar", "Woolworths", "Pick n Pay", "Checkers", "Shoprite", "Game", "Makro"];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-stone-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600')] bg-cover bg-center opacity-5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-400 rounded-full blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Shopping Assistant
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-stone-900 tracking-tight">
              Your AI Shopper
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">
                for Everything
              </span>
            </h1>
            
            <p className="mt-6 text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed">
              From groceries to gadgets, restaurant meals to fashion - Moreki shops every store 
              in your mall to find the best prices on everything you need.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl("ShoppingList")}>
                <Button className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-amber-200">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Start Shopping
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl("HowItWorks")}>
                <Button variant="outline" className="w-full sm:w-auto border-stone-300 px-8 py-6 text-lg rounded-xl">
                  How It Works
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Store Examples */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-16"
          >
            <p className="text-center text-sm text-stone-500 mb-4">Everything from every store in your mall</p>
            <div className="flex flex-wrap justify-center gap-4">
              {["Woolworths", "Pick n Pay", "Nando's", "KFC", "Game", "Edgars", "Clicks", "Spar"].map((store) => (
                <div
                  key={store}
                  className="bg-white px-6 py-3 rounded-xl shadow-sm border border-stone-200 text-stone-700 font-medium"
                >
                  {store}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900">
              Everything You Need, One Order
            </h2>
            <p className="mt-4 text-lg text-stone-600 max-w-2xl mx-auto">
              Groceries, meals, gadgets, fashion, alcohol - shop the entire mall in minutes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-stone-50 rounded-2xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-stone-900">{feature.title}</h3>
                <p className="mt-2 text-stone-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Preview */}
      <section className="py-24 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900">
              How Moreki Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: 1, title: "Create Your List", desc: "Add items with your preferences - brand, size, store" },
              { step: 2, title: "AI Finds Deals", desc: "We search all stores for best prices and offers" },
              { step: 3, title: "Pay & Receive", desc: "One payment, pickup at mall hub or get delivered" }
            ].map((item) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative bg-white rounded-2xl p-8 shadow-sm"
              >
                <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-stone-900 mt-2">{item.title}</h3>
                <p className="mt-2 text-stone-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-white border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-8 text-stone-600">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              Secure Payments
            </div>
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-amber-600" />
              7+ Partner Stores
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Same Day Delivery
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-purple-600" />
              Shehsha by Santaco
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-amber-500 to-orange-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Ready to shop smarter?
          </h2>
          <p className="mt-4 text-xl text-amber-100">
            Let Moreki do the hard work while you relax
          </p>
          <Link to={createPageUrl("ShoppingList")}>
            <Button className="mt-8 bg-white text-amber-600 hover:bg-stone-100 px-8 py-6 text-lg rounded-xl">
              <ShoppingBag className="w-5 h-5 mr-2" />
              Create Your Shopping List
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
