import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Reconnecting the real files now that we know the paths are correct!
import Home from './pages/Home.jsx';
import Checkout from './pages/Checkout.jsx'; 
import Loyalty from './pages/Loyalty.jsx';
import Profile from './pages/Profile.jsx';
import __Layout from './Layout.jsx';

function App() {
  return (
    <Router>
      <Routes>
        {/* We wrap everything in the Layout so your navigation works */}
        <Route element={<__Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/loyalty" element={<Loyalty />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App;