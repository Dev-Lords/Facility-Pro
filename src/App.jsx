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
import LogIssueForm from "./components/resident/logIssue.jsx";


import FacilitySelection from "./components/resident/FacilitySelection.jsx"
import CalenderPage from "./components/resident/CalendarPage.jsx";
import IssueMenu from "./components/resident/issueMenu.jsx";
import IssueHistory from "./components/resident/IssueHistory.jsx";
import ManageUsers from "./components/admin/ManageUsers.jsx";
import CreateEvents from "./components/admin/CreateEvent.jsx";
import UsageTrends from "./components/admin/UsageTrends.jsx";
import Bookings from "./components/admin/Bookings.jsx";
import ReportsDashboard from "./components/admin/GenerateReports.jsx";

import MaintenanceReportPage from "./components/admin/MaintenanceReportPage.jsx";

import CustomView from "./components/admin/CustomView.jsx";

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
        <Route path="/issue-menu" element={<IssueMenu />} />
        <Route path="/log-issue" element={<LogIssueForm />} />
        <Route path="/issue-history" element={<IssueHistory />} />
        <Route path ="/Facility-selection" element={<FacilitySelection/>}/>
        <Route path ="/calendar" element={<CalenderPage/>}/>
        <Route path ="/manage-users" element={<ManageUsers/>}/>
        <Route path="/events" element={<CreateEvents />} />
        <Route path="/usage-trends" element={<UsageTrends />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/reports" element={<ReportsDashboard />} />

        <Route path="/maintenance-reports" element={<MaintenanceReportPage />} />

        <Route path="/custom-reports" element={<CustomView />} />

      </Routes>
    </Router>
  );
}

export default App;