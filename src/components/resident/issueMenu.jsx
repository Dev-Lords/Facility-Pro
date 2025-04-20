import React from 'react';
import './issueMenu.css'; // Import your CSS file for styling
import { useNavigate } from 'react-router-dom';

const IssueMenu = () => {
  const navigate = useNavigate();   

  const handleNavigate = (path) => {
    console.log(`Navigating to ${path}`);
    navigate(path);
  };

  return (
    <div className="page-container">
      {/* Header Section */}
      <header className="welcome-header">
        <div className="header-content">
          <div className="header-icon">
            <span className="icon">🏠</span>
          </div>
          <div className="header-text">
            <h1 className="header-title">Report Issues</h1>
            <p className="header-subtitle">Manage maintenance requests and track issues</p>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <nav className="breadcrumb-nav">
        <button 
          onClick={() => handleNavigate('/LoginPage')} 
          className="breadcrumb-link"
        >
          <span className="home-icon">🏠</span> Dashboard
        </button>
        <span className="separator">/</span>
        <span className="current-page">Report Issues</span>
      </nav>

      {/* Card Grid */}
      <section className="card-grid">
        {/* Log New Issue Card */}
        <article className="menu-card">
          <div className="card-icon">
            <span className="icon-circle">⚠️</span>
          </div>
          <h2 className="card-title">Log New Issue</h2>
          <p className="card-description">
            Report a maintenance problem or facility issue that needs attention.
          </p>
          <button 
            className="card-button"
            onClick={() => handleNavigate('/log-issue')}
            type="button"
          >
            Log Issue
          </button>
        </article>

        {/* View Issue History Card */}
        <article className="menu-card">
          <div className="card-icon">
            <span className="icon-circle">🕒</span>
          </div>
          <h2 className="card-title">Track Issue History</h2>
          <p className="card-description">
            View status and history of your previously reported issues.
          </p>
          <button 
            className="card-button"
            onClick={() => handleNavigate('/issue-history')}
            type="button"
          >
            View History
          </button>
        </article>
      </section>
    </div>
  );
};

export default IssueMenu;