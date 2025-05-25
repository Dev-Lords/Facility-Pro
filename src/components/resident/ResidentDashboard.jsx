
import './ResidentDashboard.css';
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { FaBars,FaHome, FaCalendar, FaExclamationTriangle, FaCalendarCheck } from 'react-icons/fa';

export default function ResidentPortal() {
  const [menuOpen, setMenuOpen] = useState(false);
    const token = localStorage.getItem('authToken');
    const userType = localStorage.getItem('userType');
    const isAuthenticated = token && userType === 'resident';
    const navigate = useNavigate();
    
    const handleNavigate = (path) => {
      navigate(path);
    };
    const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
   const handleSignOut = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userType');
    navigate('/');
  };

  	if (!isAuthenticated) {
    	return <Navigate to="/" replace />;
  	}

  return (
    <main className="container">
      <header className="header">
        <section className="hamburger-menu">
                  <FaBars className="hamburger-icon" onClick={toggleMenu} />
                  {menuOpen && (
                    <nav className="dropdown-menu">
                      <button onClick={() => handleNavigate('/')}>Home</button>
                      <button onClick={handleSignOut}>Sign Out</button>
                    </nav>
                  )}
                </section>
        <section className="header-content">
          <section className="resident-icon"><FaHome/></section>
          <section>
            <h1>Welcome Resident</h1>
            <p>Access community services with ease</p>
          </section>
        </section>
      </header>


      

      <section className="card-grid">
        <article className="card card-facilities">
          <section className="card-icon"><FaCalendarCheck /></section>
          <h2>Book Facilities</h2>
          <p>Reserve community spaces like the gym, pool, or meeting rooms.</p>
          <button className="btn btn-facilities" onClick={() => handleNavigate("/Facility-selection")}>Book Now</button>
        </article>
        <article className="card card-issues">
          <section className="card-icon"><FaExclamationTriangle/></section>
          <h2>My Bookings</h2>
          <p>Check the status of the bookings you've made</p>
          <button onClick={() => navigate("/view-bookings")} className="btn btn-issues">View Bookings</button>

        </article>
        <article className="card card-issues">
          <section className="card-icon"><FaExclamationTriangle/></section>
          <h2>Report Issues</h2>
          <p>Submit maintenance requests or report problems in common areas.</p>
          <button onClick={() => navigate("/issue-menu")} className="btn btn-issues">Report Problem</button>

        </article>
        
      </section>

      <footer className="footer">
        <p>Resident Portal • Your Community • Copyright © 2025</p>
      </footer>
    </main>
  );
}
