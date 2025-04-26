import React from 'react';
import './issueMenu.css'; // Import your CSS file for styling
import { useNavigate, Navigate } from 'react-router-dom';
import { FaWrench, FaExclamationTriangle, FaHistory, FaFutbol, FaBasketballBall } from 'react-icons/fa';


export default function IssueMenu(){
  const token = localStorage.getItem('authToken');
  const userType = localStorage.getItem('userType');
  const isAuthenticated = token && userType === 'resident';
  const navigate = useNavigate();   

  const handleNavigate = (path) => {
    console.log(`Navigating to ${path}`);
    navigate(path);
  };
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="container">
      <header className="header">
        <section className="header-content">
          <section className="issues-icon"><FaWrench/></section>
          <section>
          <h1 className="header-title">Report Issues</h1>
          <p className="header-subtitle">Manage maintenance requests and track issues</p>
          </section>
        </section>
      </header>
   
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

