import React from "react";
import "./FacilityStaffDashboard.css";
import { useNavigate } from "react-router-dom";
console.log("FacilityStaffDashboard component is loading");

export default function FacilityStaffHome() {
  const navigate = useNavigate();

  //handle routing

  const handleNavigate = (path) => {
    navigate(path);
  };

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

        <article className="facility-card card-availability">
          <h2 className="card-title">📋 Facility Status</h2>
          <p className="card-description">
            Update the availability and status of various facility areas.
          </p>
          <a href="availability.html" className="facility-btn">
            Update Status
          </a>
        </article>

        <article className="facility-card card-bookings">
          <h2 className="card-title">📅 Booking Calendar</h2>
          <p className="card-description">
            View and manage all current and upcoming facility bookings.
          </p>
          <a href="bookings.html" className="facility-btn">
            View Bookings
          </a>
        </article>
      </section>

      <footer className="facility-footer">
        <p>Facility Management System • Staff Portal • Version 1.0.0</p>
      </footer>
    </>
  );
}
