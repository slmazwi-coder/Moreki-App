import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// DIRECT IMPORTS - No aliases, no config files
// We are going to point directly to the files.
import Home from './pages/Home.jsx'; 

const AuthenticatedApp = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="*" element={<div>Moreki is loading... Check back in 5 mins!</div>} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthenticatedApp />
    </Router>
  )
}

export default App
