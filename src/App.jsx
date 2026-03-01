import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Pages - Matching your Capitalized filenames exactly
import Home from './pages/Home.jsx';
import HowItWorks from './pages/HowItWorks.jsx';
import InitializeMall from './pages/InitializeMall.jsx';
import Loyalty from './pages/Loyalty.jsx';
import LoyaltyCard from './pages/LoyaltyCard.jsx';
import Orders from './pages/Orders.jsx';
import Profile from './pages/Profile.jsx';
import RecurringOrders from './pages/RecurringOrders.jsx';
import ShoppingList from './pages/ShoppingList.jsx';

// Layout wrapper
import Layout from './Layout.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/initialize" element={<InitializeMall />} />
          <Route path="/loyalty" element={<Loyalty />} />
          <Route path="/loyalty-card" element={<LoyaltyCard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/recurring-orders" element={<RecurringOrders />} />
          <Route path="/shopping-list" element={<ShoppingList />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
