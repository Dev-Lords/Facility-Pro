import React from 'react';  
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';  // Import necessary routing components
import LandingPage from './components/LandingPage';
import ResidentHomePage from './components/ResidentHomePage';  // Import the ResidentHomePage
import AdminHomePage from './components/AdminHomePage';

function App() {
  return (
    <Router>
      <Routes>
        
        <Route path="/" element={<LandingPage />} />  
        <Route path="/resident-home" element={<ResidentHomePage />} />
        <Route path ="/admin-home" element={<AdminHomePage />} />
        <Route path ="/staff-home" element={<staffHomePage />} />

      </Routes>
    </Router>
  );
}

export default App;
