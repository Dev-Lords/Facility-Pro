import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIssueByUserId } from '../../../backend/services/issuesService';
import { Issue } from '../../../backend/models/issue';
import './issueHistory.css'; 
import { FaHome,FaBars,FaWrench, } from 'react-icons/fa';


const IssueHistory = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const userID = localStorage.getItem("userID");
        const response = await getIssueByUserId(userID);
        setIssues(response.map(issue => new Issue(issue)));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching issues:", error);
        setError("Error fetching issues");  // Set the error message
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
   const handleSignOut = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userType');
    navigate('/');
  };
  const getStatusClass = (status) => {
    switch(status) {
      case 'open':
        return 'status-open';
      case 'in-progress':
        return 'status-in-progress';
      case 'resolved':
        return 'status-resolved';
      default:
        return 'status-open';
    }
  };

  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return 'priority-medium';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  const filteredIssues = filter === 'all' 
    ? issues 
    : issues.filter(issue => issue.issueStatus === filter);

  return (
    <main className="issue-history-page">
      {/* Header Banner */}

      {error && <output role="alert" className="error-message">{error}</output>}

      <header className="dashboard-header">
        
          <section className="hamburger-menu">
                    <FaBars className="hamburger-icon" onClick={toggleMenu} />
                    {menuOpen && (
                      <nav className="dropdown-menu">
                        <button onClick={() => handleNavigate('/')}>Home</button>
                        <button onClick={handleSignOut}>Sign Out</button>
                      </nav>
                    )}
                  </section>
        <section className="banner-content">
          <figure className="icon-container">
            <i className="home-icon"><FaWrench/></i>
          </figure>
          <hgroup className="banner-text">
            <h1>Issue History</h1>
            <p>View and manage your maintenance requests</p>
          </hgroup>
        </section>
      </header>

   {/* Breadcrumb */}
      <nav className="breadcrumb-nav">
        <button 
          onClick={() => handleNavigate('/resident-home')} 
          className="breadcrumb-link"
        >
          <i className="home-icon"><FaHome/></i> Dashboard
        </button>
        <strong className="separator">/</strong>
        <button
        className='breadcrumb-link'
          onClick={() => handleNavigate('/issue-menu')}>
        <i className="current-page"></i> Report Issue
        </button>
      </nav>
   

      {/* Main Content */}
      <section className="main-content">
        {/* Filter Controls */}
        <section className="filter-section">
          <header className="filter-container">
            <h2 className="section-title">Your Issues</h2>
            <fieldset className="filter-controls">
              <label htmlFor="status-filter">Filter by status:</label>
              <select 
                id="status-filter" 
                className="status-filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Issues</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </fieldset>
          </header>
        </section>

        {/* Issues List */}
        <section className="issues-section">
          {loading ? (
            <aside className="loading-container">
              <figure className="loading-spinner"></figure>
              <p className="loading-text">Loading issues...</p>
            </aside>
          ) : filteredIssues.length === 0 ? (
            <aside className="no-issues-container">
              <i className="info-icon">ℹ️</i>
              <p className="no-issues-text">No issues found with the selected status.</p>
            </aside>
          ) : (
            <ul className="issues-list">
              {filteredIssues.map((issue) => (
                <li key={issue.issueID} className={`issue-card ${getPriorityClass(issue.priority)}`}>
                  <article className="issue-content">
                    <header className="issue-header">
                      <h3 className="issue-title">{issue.issueTitle}</h3>
                      <mark className={`issue-status ${getStatusClass(issue.issueStatus)}`}>
                        {issue.issueStatus.replace('-', ' ')}
                      </mark>
                    </header>
                    
                    <section className="issue-meta">
                      <small className="issue-category">{issue.category}</small>
                      <time className="issue-date" dateTime={issue.reportedAt}>
                        {formatDate(issue.reportedAt)}
                      </time>
                    </section>
                    
                    <p className="issue-description">{issue.issueDescription}</p>
                    
                    <dl className="issue-details">
                      <dt className="issue-location">
                        <strong>Location:</strong>
                      </dt>
                      <dd>{issue.location}</dd>
                      
                      {issue.assignedTo && (
                        <>
                          <dt className="issue-assigned">
                            <strong>Assigned to:</strong>
                          </dt>
                          <dd>{issue.assignedTo}</dd>
                        </>
                      )}
                      
                      {issue.feedback && (
                        <>
                          <dt className="issue-feedback">
                            <strong>Feedback:</strong>
                          </dt>
                          <dd>{issue.feedback}</dd>
                        </>
                      )}
                    </dl>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Action Button */}
        <footer className="action-container">
          <button 
            type="button"
            className="btn btn-issues"
            onClick={() => handleNavigate('/log-issue')}
          >
            Log New Issue
          </button>
        </footer>
      </section>
    </main>
  );
};

export default IssueHistory;