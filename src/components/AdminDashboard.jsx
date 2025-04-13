import React from 'react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  return (
    <section className="dashboard-container">
      {/* Decorative blue blocks at the top */}
      <section className="blue-blocks">
        <span className="blue-block"></span>
        <span className="blue-block"></span>
        <span className="blue-block"></span>
      </section>

      <header className="dashboard-header">
        <section className="header-content">
          <aside className="avatar-container">
            <span className="avatar">👤</span>
          </aside>
          <section className="welcome-text">
            <h1>Welcome, Admin!</h1>
            <p>Manage your system with ease and efficiency. View all your data at a glance.</p>
          </section>
        </section>
      </header>

      <section className="card-grid">
        <article className="dashboard-card users-card">
          <header className="card-header">
            <span className="card-icon">👥</span>
            <h2>Manage Users</h2>
          </header>
          <p>Add, edit, or remove users and manage their access permissions across the platform.</p>
          <nav className="card-actions">
            <a href="/users" className="btn primary-btn">Manage Users</a>
          </nav>
        </article>

        <article className="dashboard-card reports-card">
          <header className="card-header">
            <span className="card-icon">📊</span>
            <h2>Generate Reports</h2>
          </header>
          <p>Create custom reports and export your data in various formats for analysis.</p>
          <nav className="card-actions">
            <a href="/reports" className="btn primary-btn">Generate Reports</a>
          </nav>
        </article>

        <article className="dashboard-card settings-card">
          <header className="card-header">
            <span className="card-icon">⚙️</span>
            <h2>System Settings</h2>
          </header>
          <p>Configure application preferences and system parameters for optimal performance.</p>
          <nav className="card-actions">
            <a href="/settings" className="btn primary-btn">System Settings</a>
          </nav>
        </article>

        <article className="dashboard-card analytics-card">
          <header className="card-header">
            <span className="card-icon">📈</span>
            <h2>Analytics</h2>
          </header>
          <p>Monitor real-time system performance and user activity metrics in detailed graphs.</p>
          <nav className="card-actions">
            <a href="/analytics" className="btn primary-btn">View Analytics</a>
          </nav>
        </article>
      </section>

      <footer className="dashboard-footer">
        <p>Admin Dashboard • Version 2.4.1 • Last Updated: April 11, 2025</p>
        <nav className="footer-links">
          <a href="/help">Help</a>
          <a href="/support">Support</a>
          <a href="/privacy">Privacy Policy</a>
        </nav>
      </footer>
    </section>
  );
};

export default AdminDashboard;
