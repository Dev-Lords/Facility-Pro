import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { 
  FaChartBar, 
  FaFileAlt, 
  FaChartPie,
  FaArrowLeft
} from 'react-icons/fa';
import './AdminDashboard.css'; // Reusing the existing CSS

export default function ReportsDashboard() {
  const token = localStorage.getItem('authToken');
  const userType = localStorage.getItem('userType');
  const isAuthenticated = token && userType === 'admin';
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="dashboard-container">
      <header className="dashboard-header">
        <section className="header-content">
          <section className="admin-icon"><FaFileAlt /></section>
          <section>
            <h1>Generate Reports</h1>
            <p>View facility usage trends, maintenance reports, and create custom reports.</p>
          </section>
        </section>
      </header>

      <section className="card-grid">
        <article className="dashboard-card reports-card">
          <section className="card-icon"><FaChartBar /></section>
          <h2>Usage Trends by Facility</h2>
          <p>Track facility utilization patterns and identify peak usage times.</p>
          <button className="btn reports-btn" onClick={() => handleNavigate("/usage-trends")}>Generate Report</button>
        </article>
        
        <article className="dashboard-card reports-card">
          <section className="card-icon"><FaFileAlt /></section>
          <h2>Maintenance Reports</h2>
          <p>View open vs. closed maintenance tickets and track resolution status.</p>
          <button className="btn reports-btn" onClick={() => handleNavigate("/maintenance-reports")}>Generate Report</button>
        </article>
        
        <article className="dashboard-card reports-card">
          <section className="card-icon"><FaChartPie /></section>
          <h2>Custom View</h2>
          <p>Create personalized reports with specific parameters and data points.</p>
          <button className="btn reports-btn" onClick={() => handleNavigate("/custom-reports")}>Create Custom Report</button>
        </article>
      </section>

      <section className="back-button-container">
        <button className="btn back-btn" onClick={() => handleNavigate('/admin-home')}>
          <FaArrowLeft /> Back to Dashboard
        </button>
      </section>

      <footer className="dashboard-footer">
        <p>Facility Management System • Reports Dashboard • Version 1.0.0</p>
      </footer>
    </main>
  );
}