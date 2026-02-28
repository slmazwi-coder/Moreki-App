import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { 
  ShoppingBag, 
  Home, 
  Package, 
  User, 
  Menu, 
  X, 
  LogOut,
  HelpCircle,
  Repeat,
  Gift
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { name: 'Home', icon: Home, page: 'Home' },
  { name: 'Shop', icon: ShoppingBag, page: 'ShoppingList' },
  { name: 'Orders', icon: Package, page: 'Orders' },
  { name: 'Recurring', icon: Repeat, page: 'RecurringOrders' },
  { name: 'Loyalty', icon: Gift, page: 'LoyaltyCards' },
  { name: 'How It Works', icon: HelpCircle, page: 'HowItWorks' },
  { name: 'Profile', icon: User, page: 'Profile' },
];

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Desktop Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-stone-900">Moreki</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={createPageUrl(item.page)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    currentPageName === item.page
                      ? 'bg-amber-100 text-amber-700'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              ))}
            </div>

            {/* User Menu */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-stone-600">{user.full_name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="text-stone-500 hover:text-red-500"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => base44.auth.redirectToLogin()}
                  className="bg-gradient-to-r from-amber-500 to-orange-600"
                >
                  Sign In
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-stone-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-stone-600" />
              ) : (
                <Menu className="w-6 h-6 text-stone-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-stone-200"
            >
              <div className="px-4 py-4 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.page)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      currentPageName === item.page
                        ? 'bg-amber-100 text-amber-700'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                ))}
                
                <div className="pt-4 border-t border-stone-200">
                  {user ? (
                    <div className="flex items-center justify-between px-4">
                      <span className="text-stone-600">{user.full_name}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLogout}
                        className="text-red-500 border-red-200"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => base44.auth.redirectToLogin()}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-600"
                    >
                      Sign In
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Moreki</span>
              </div>
              <p className="text-sm">
                Your AI shopping assistant for South Africa. Compare prices, find deals, and get everything delivered.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to={createPageUrl("Home")} className="hover:text-white">Home</Link></li>
                <li><Link to={createPageUrl("ShoppingList")} className="hover:text-white">Start Shopping</Link></li>
                <li><Link to={createPageUrl("HowItWorks")} className="hover:text-white">How It Works</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Partner Stores</h4>
              <ul className="space-y-2 text-sm">
                <li>Spar</li>
                <li>Woolworths</li>
                <li>Pick n Pay</li>
                <li>Checkers</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Delivery</h4>
              <p className="text-sm">Fast & reliable delivery across South Africa</p>
              <p className="text-xs text-stone-500 mt-1">Multiple payment options available</p>
            </div>
          </div>
          <div className="border-t border-stone-800 mt-8 pt-8 text-center text-sm">
            <p>© 2026 Moreki. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
