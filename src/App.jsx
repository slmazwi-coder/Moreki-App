import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// We are defining the Home page RIGHT HERE. 
// No more "Could not resolve ./pages/Home.jsx" because we aren't asking for it!
const Home = () => (
  <div style={{ 
    padding: '40px', 
    textAlign: 'center', 
    fontFamily: 'sans-serif',
    backgroundColor: '#f8f9fa',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  }}>
    <h1 style={{ color: '#E91E63', fontSize: '3rem' }}>Moreki 🇿🇦</h1>
    <p style={{ fontSize: '1.2rem' }}>The plumbing is fixed! We are now successfully live on Vercel.</p>
    <div style={{ marginTop: '20px', color: '#666' }}>
      Next step: Reconnecting your original pages via Project IDX.
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  )
}

export default App;
