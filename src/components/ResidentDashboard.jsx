import React from 'react';
import './ResidentDashboard.css';
console.log("ResidentDashboard component is loading");

export default function ResidentPortal() {
  return (
    <main className="container">
      <header className="header">
        <section className="header-content">
          <section className="resident-icon">🏠</section>
          <section>
            <h1>Welcome Resident</h1>
            <p>Access community services with ease</p>
          </section>
        </section>
      </header>

      <section className="card-grid">
        <article className="card card-facilities">
          <section className="card-icon">🏊</section>
          <h2>Book Facilities</h2>
          <p>Reserve community spaces like the gym, pool, or meeting rooms.</p>
          <a href="#" className="btn btn-facilities">Book Now</a>
        </article>

        <article className="card card-events">
          <section className="card-icon">📅</section>
          <h2>View Events</h2>
          <p>Stay updated on community gatherings, meetings, and activities.</p>
          <a href="#" className="btn btn-events">See Calendar</a>
        </article>

        <article className="card card-issues">
          <section className="card-icon">🔧</section>
          <h2>Report Issues</h2>
          <p>Submit maintenance requests or report problems in common areas.</p>
          <a href="#" className="btn btn-issues">Report Problem</a>
        </article>
      </section>

      <footer className="footer">
        <p>Resident Portal • Your Community • Copyright © 2025</p>
      </footer>
    </main>
  );
}