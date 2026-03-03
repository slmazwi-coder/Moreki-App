cat << 'EOF' > src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Layout.jsx';
import Home from './views/Home.jsx';
import HowItWorks from './views/HowItWorks.jsx';
import InitializeMall from './views/InitializeMall.jsx';
import Orders from './views/Orders.jsx';
import Profile from './views/Profile.jsx';
import RecurringOrders from './views/RecurringOrders.jsx';
import ShoppingList from './views/ShoppingList.jsx';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Layout currentPageName="Home"><Home /></Layout>} />
          <Route path="/how-it-works" element={<Layout currentPageName="HowItWorks"><HowItWorks /></Layout>} />
          <Route path="/initialize-mall" element={<Layout currentPageName="InitializeMall"><InitializeMall /></Layout>} />
          <Route path="/orders" element={<Layout currentPageName="Orders"><Orders /></Layout>} />
          <Route path="/profile" element={<Layout currentPageName="Profile"><Profile /></Layout>} />
          <Route path="/recurring-orders" element={<Layout currentPageName="RecurringOrders"><RecurringOrders /></Layout>} />
          <Route path="/shopping-list" element={<Layout currentPageName="ShoppingList"><ShoppingList /></Layout>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
EOF