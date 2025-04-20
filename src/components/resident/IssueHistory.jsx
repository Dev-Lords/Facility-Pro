import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIssueByUserId } from '../../../backend/services/issuesService';
import { Issue } from '../../../backend/models/issue';
import './issueHistory.css'; // We'll add the CSS styles in a separate file

const IssueHistory = () => {
  const navigate = useNavigate();
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

      {error && <div role="alert" className="error-message">{error}</div>}

      <header className="page-banner">
        <div className="banner-content">
          <div className="icon-container">
            <div className="home-icon">🏠</div>
          </div>
          <div className="banner-text">
            <h1>Issue History</h1>
            <p>View and manage your maintenance requests</p>
          </div>
        </div>
      </header>

   

      {/* Main Content */}
      <div className="main-content">
        {/* Filter Controls */}
        <section className="filter-section">
          <div className="filter-container">
            <h2 className="section-title">Your Issues</h2>
            <div className="filter-controls">
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
            </div>
          </div>
        </section>

        {/* Issues List */}
        <section className="issues-section">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Loading issues...</p>
            </div>
          ) : filteredIssues.length === 0 ? (
            <div className="no-issues-container">
              <div className="info-icon">ℹ️</div>
              <p className="no-issues-text">No issues found with the selected status.</p>
            </div>
          ) : (
            <ul className="issues-list">
              {filteredIssues.map((issue) => (
                <li key={issue.issueID} className={`issue-card ${getPriorityClass(issue.priority)}`}>
                  <article className="issue-content">
                    <header className="issue-header">
                      <h3 className="issue-title">{issue.issueTitle}</h3>
                      <span className={`issue-status ${getStatusClass(issue.issueStatus)}`}>
                        {issue.issueStatus.replace('-', ' ')}
                      </span>
                    </header>
                    
                    <div className="issue-meta">
                      <span className="issue-category">{issue.category}</span>
                      <span className="issue-date">{formatDate(issue.reportedAt)}</span>
                    </div>
                    
                    <p className="issue-description">{issue.issueDescription}</p>
                    
                    <div className="issue-details">
                      <div className="issue-location">
                        <strong>Location:</strong> {issue.location}
                      </div>
                      
                      {issue.assignedTo && (
                        <div className="issue-assigned">
                          <strong>Assigned to:</strong> {issue.assignedTo}
                        </div>
                      )}
                      
                      {issue.feedback && (
                        <div className="issue-feedback">
                          <strong>Feedback:</strong> {issue.feedback}
                        </div>
                      )}
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Action Button */}
        <div className="action-container">
          <button 
            type="button"
            className="action-button"
            onClick={() => handleNavigate('/log-issue')}
          >
            Log New Issue
          </button>
        </div>
      </div>
    </main>
  );
};

export default IssueHistory;