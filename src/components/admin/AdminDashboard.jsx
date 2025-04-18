import React from 'react';
import './AdminDashboard.css';
import { useNavigate, Navigate } from 'react-router-dom';
import { FaCheckCircle,FaUser, FaUsers, FaFileAlt, FaRegCalendarPlus,FaStamp,FaClipboardCheck } from 'react-icons/fa';

export default function AdminDashboard() {
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
          <section className="admin-icon"><FaUser /></section>
          <section>
            <h1>Welcome, Admin!</h1>
            <p>Manage your system with ease and efficiency. View all your data at a glance.</p>
          </section>
        </section>
      </header>

      <section className="card-grid">
        <article className="dashboard-card users-card">
          <section className="card-icon"><FaUsers /></section>
          <h2>Manage Users</h2>
          <p>Add, edit, or remove users and manage their access permissions.</p>
          <button className="btn manage-btn" onClick={() => handleNavigate("/users")}>Manage Users</button>
        </article>

        <article className="dashboard-card reports-card">
          <section className="card-icon"><FaFileAlt /></section>
          <h2>Generate Reports</h2>
          <p>Create custom reports and export your data for analysis.</p>
          <button className="btn reports-btn" onClick={() => handleNavigate("/reports")}>Generate Reports</button>
        </article>

        <article className="dashboard-card events-card">
          <section className="card-icon"><FaRegCalendarPlus /></section>
          <h2>Events</h2>
          <p>Schedule and manage events to keep facilities organized and up to date.</p>
          <button className="btn events-btn" onClick={() => handleNavigate("/events")}>Create events</button>
        </article>

        <article className="dashboard-card bookings-card">
          <section className="card-icon"><FaClipboardCheck/></section>
          <h2>Bookings</h2>
          <p>Review and approve pending bookings to ensure smooth scheduling and facility use.</p>
          <button className="btn bookings-btn" onClick={() => handleNavigate("/bookings")}>Review bookings</button>
        </article>
      </section>

      <footer className="dashboard-footer">
        <p>Facility Management System • Admin Dashboard • Version 1.0.0</p>
      </footer>
    </main>
  );
}
