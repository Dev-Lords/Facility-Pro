import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Import necessary routing components
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage.jsx";
import SignupPage from "./components/SignupPage.jsx";
import ResidentDashboard from "./components/resident/ResidentDashboard.jsx"; //
import AdminDashboard from "./components/admin/AdminDashboard.jsx";
import FacilityStaffDashboard from "./components/staff/FacilityStaffDashboard.jsx";
import IssuesPage from "./components/staff/IssuesPage.jsx";
import FacilitySelection from "./components/resident/FacilitySelection.jsx"

function App() {
  return (
    <Router>
      <ToastContainer />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/LoginPage" element={<LoginPage />} />
        <Route path="/SignupPage" element={<SignupPage />} />
        <Route path="/resident-home" element={<ResidentDashboard />} />
        <Route path="/admin-home" element={<AdminDashboard />} />
        <Route path="/staff-home" element={<FacilityStaffDashboard />} />
        <Route path="/staff-issues" element={<IssuesPage />} />
        <Route path ="/Facility-selection" element={<FacilitySelection/>}/>
      </Routes>
    </Router>
  );
}

export default App;
