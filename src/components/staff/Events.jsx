import React, { useEffect, useState } from "react";
import { fetchEvents } from "../../../backend/services/ReportDataService";
import "./Events.css";
import { useNavigate } from "react-router-dom";

const outlineColors = ["#4CAF50", "#2196F3", "#FF9800", "#E91E63", "#9C27B0"];

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState("all");

  const navigate = useNavigate();
  const handleNavigate = (path) => {
      navigate(path);
  };


  useEffect(() => {
    const loadEvents = async () => {
      const data = await fetchEvents();
      setEvents(data || []);
      setFiltered(data || []);
    };
    loadEvents();
  }, []);

  const handleFilterChange = (e) => {
    const facility = e.target.value;
    setSelectedFacility(facility);
    if (facility === "all") {
      setFiltered(events);
    } else {
      setFiltered(events.filter(event => event.location === facility));
    }
  };

  const facilities = [...new Set(events.map(event => event.location))];


  return (

      <main className="upcoming-events-page">
      <header className="upcoming-events-header">
        <h1 className="upcoming-events-title">Upcoming Events</h1>
        <p className="upcoming-events-subtitle">View upcoming events, Stay prepared!</p>
      </header>

       {/* Breadcrumb */}
      <nav className="breadcrumb-nav">
        <button 
          onClick={() => handleNavigate('/staff-home')} 
          className="breadcrumb-link"
        >
          <i className="home-icon">🏠</i> Dashboard
        </button>
      </nav>

    <section className="facility-filter-section">  
        <label htmlFor="facilityFilter">Filter by facility:</label>
        <select id="facilityFilter" onChange={handleFilterChange} value={selectedFacility}>
            <option value="all">All</option>
            {facilities.map(fac => (
            <option key={fac} value={fac}>{fac}</option>
            ))}
        </select>
    </section>


      <section className="events-grid">
        {filtered.map((event, index) => (
          <article
            key={event.title + index}
            className="event-card"
            style={{ borderColor: outlineColors[index % outlineColors.length] }}
          >
            <h2>{event.title}</h2>
            <p><strong>Type:</strong> {event.eventType}</p>
            <p><strong>Date:</strong> {event.date}</p>
            <p><strong>Time:</strong> {event.startTime} - {event.endTime}</p>
            <p><strong>Location:</strong> {event.location}</p>
            <p><strong>Description:</strong> {event.description}</p>
            <p><strong>Max Participants:</strong> {event.maxParticipants}</p>
          </article>
        ))}
      </section>
    </main>
  );
};

export default EventsPage;
