import React from "react";
import "./FacilityStaffDashboard.css";
import { useNavigate } from "react-router-dom";
import { Navigate } from 'react-router-dom';
import {  FaUserTie } from 'react-icons/fa6';
import {  FaFileAlt } from 'react-icons/fa';


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
    <main className="container">
      <header className="header">
        <section className="header-content">
          <section className="staff-icon">< FaUserTie/></section>
          <section>
            <h1>Welcome, Facility Staff!</h1>
            <p>Manage maintenance and bookings with ease</p>
          </section>
        </section>
      </header>

      <section className="card-grid">
        <article className="card card-facilities">
           <section className="card-icon"><FaFileAlt /></section>
          <h2>Maintenance Reports</h2>
          <p> Manage all facility maintenance requests and reports.</p>
          <button
            className="btn btn-facilities"
            onClick={() => handleNavigate("/staff-issues")}
            role="button"
            aria-label="View maintenance reports"
          >
            View Reports
          </button>
        </article>

         <article className="card card-facilities">
           <section className="card-icon"><FaFileAlt /></section>
          <h2>Events</h2>
          <p> View upcoming facility events to prepare in advance.</p>
          <button
            className="btn btn-facilities"
            onClick={() => handleNavigate("/upcoming-events")}
            role="button"
            aria-label="View upcoming events"
          >
            View Events
          </button>
        </article>

      </section>

      <footer className="footer">
        <p>Facility Management System • Staff Portal • Version 1.0.0</p>
      </footer>
      </main>
  );
}
