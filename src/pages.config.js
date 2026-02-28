/**
 * pages.config.js - Page routing configuration
 * * This file has been updated for standard React/Vite deployment.
 * Every import now includes the explicit .jsx extension to ensure 
 * Vercel can resolve the paths correctly.
 */

import Checkout from './pages/Checkout.jsx';
import Home from './pages/Home.jsx';
import HowItWorks from './pages/HowItWorks.jsx';
import Loyalty from './pages/Loyalty.jsx';
import LoyaltyCards from './pages/LoyaltyCards.jsx';
import Orders from './pages/Orders.jsx';
import Profile from './pages/Profile.jsx';
import RecurringOrders from './pages/RecurringOrders.jsx';
import ShoppingList from './pages/ShoppingList.jsx';
import InitializeMalls from './pages/InitializeMalls.jsx';
import __Layout from './Layout.jsx';

export const PAGES = {
    "Checkout": Checkout,
    "Home": Home,
    "HowItWorks": HowItWorks,
    "Loyalty": Loyalty,
    "LoyaltyCards": LoyaltyCards,
    "Orders": Orders,
    "Profile": Profile,
    "RecurringOrders": RecurringOrders,
    "ShoppingList": ShoppingList,
    "InitializeMalls": InitializeMalls,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
