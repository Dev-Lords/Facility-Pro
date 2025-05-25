import React, { useState, useEffect } from 'react';
import './issueMenu.css'; 
import { useNavigate, Navigate } from 'react-router-dom';
import { FaBars,FaHome, FaWrench, FaExclamationTriangle, FaHistory } from 'react-icons/fa';


export default function IssueMenu(){
  const [menuOpen, setMenuOpen] = useState(false);
  const token = localStorage.getItem('authToken');
  const userType = localStorage.getItem('userType');
  const isAuthenticated = token && userType === 'resident';
  const navigate = useNavigate();   

  const handleNavigate = (path) => {
    console.log(`Navigating to ${path}`);
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
          <section className="issues-icon"><FaWrench/></section>
          <section>
          <h1 className="header-title">Report Issues</h1>
          <p className="header-subtitle">Manage maintenance requests and track issues</p>
          </section>
        </section>
      </header>

      
          {/* Breadcrumb */}
      <nav className="breadcrumb-nav">
        <button 
          onClick={() => handleNavigate('/resident-home')} 
          className="breadcrumb-link"
        >
          <span className="home-icon"><FaHome/></span> Dashboard
        </button>
        <span className="separator">/</span>
        <span className="current-page">Report Issues</span>
      </nav>
      <section className = "card-grid">

        <article className ="card card-log-issues">
          <section className="card-icon"><FaExclamationTriangle/></section>
          <h2>Log New Issue</h2>
          <p> Report a maintenance problem or facility issue that needs attention.</p>
          <button className="btn btn-issues" onClick={() => handleNavigate('/log-issue')}>
            Log Issue
          </button>
        </article>

        <article className='card card-log-history'>
          <section className="card-icon"><FaHistory/></section>
          <h2 className="card-title">Track Issue History</h2>
          <p className="card-description">View status and history of your previously reported issues.</p>
          <button className="btn btn-issues" onClick={() => handleNavigate('/issue-history')}>
            View History
          </button>
        </article>


      </section>
      <footer className="footer">
        <p>Resident Booking System • Your Community • Copyright © {new Date().getFullYear()}</p>
      </footer>
    </main>

  );
}

