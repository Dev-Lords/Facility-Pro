import React from 'react';  
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';  // Import necessary routing components
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage.jsx'; 
import SignupPage from './components/SignupPage.jsx'; 
import ResidentDashboard from './components/ResidentDashboard.jsx';  // 
import AdminDashboard from './components/AdminDashboard.jsx';

function App() {
  return (
    <Router>
      <Routes>
        
        <Route path="/" element={<LandingPage />} />  
        <Route path="/LoginPage" element={<LoginPage />} /> 
        <Route path="/SignupPage" element={<SignupPage />} /> 
        <Route path="/resident-home" element={<ResidentDashboard />} />
        <Route path ="/admin-home" element={<AdminDashboard />} />
        <Route path ="/staff-home" element={<FacilityStaffDashboard />} />

      </Routes>
    </Router>
  );
}

export default App;