import React from "react";
import "./FacilityStaffDashboard.css";
import { useNavigate } from "react-router-dom";
import { Navigate } from 'react-router-dom';

export default function FacilityStaffDashboard() {
  const navigate = useNavigate();

  
  const handleNavigate = (path) => {
    navigate(path);
  };
  const token = localStorage.getItem('authToken');
    const userType = localStorage.getItem('userType');
    const isAuthenticated = token && userType === 'staff';

  	if (!isAuthenticated) {
    	return <Navigate to="/" replace />;
  	}

  return (
    
    <>
      <header className="facility-header">
        <h1 className="facility-title">🏢 Welcome, Facility Staff!</h1>
        <p className="facility-subtitle">
          Manage maintenance and bookings with ease
        </p>
      </header>

      <section className="card-grid">
        <article className="facility-card card-maintenance">
          <h2 className="card-title">🔧 Maintenance Reports</h2>
          <p className="card-description">
            View and manage all facility maintenance requests and reports.
          </p>
          <button
            className="facility-btn"
            onClick={() => handleNavigate("/staff-issues")}
          >
            View Reports
          </button>
        </article>

      </section>

      <footer className="facility-footer">
        <p>Facility Management System • Staff Portal • Version 1.0.0</p>
      </footer>
    </>
  );
}
