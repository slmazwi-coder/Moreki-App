import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './views/Home.jsx';
import HowItWorks from './views/HowItWorks.jsx';
import InitializeMall from './views/InitializeMall.jsx';
// Loyalty imports removed
import Orders from './views/Orders.jsx';
import Profile from './views/Profile.jsx';
import RecurringOrders from './views/RecurringOrders.jsx';
import ShoppingList from './views/ShoppingList.jsx';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/initialize-mall" element={<InitializeMall />} />
          {/* Loyalty routes removed */}
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/recurring-orders" element={<RecurringOrders />} />
          <Route path="/shopping-list" element={<ShoppingList />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;