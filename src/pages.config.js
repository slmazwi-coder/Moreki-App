/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Checkout from './pages/Checkout';
import Home from './pages/Home';
import HowItWorks from './pages/HowItWorks';
import Loyalty from './pages/Loyalty';
import LoyaltyCards from './pages/LoyaltyCards';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import RecurringOrders from './pages/RecurringOrders';
import ShoppingList from './pages/ShoppingList';
import InitializeMalls from './pages/InitializeMalls';
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
