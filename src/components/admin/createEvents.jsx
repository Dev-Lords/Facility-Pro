import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './CreateEvents.css';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { app } from "../../../backend/firebase/firebase.config.js";

const CreateEvents = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    maxParticipants: '',
    eventType: '',
    isRecurring: false
  });

  const userRole = localStorage.getItem('role');
  const dashboardPath = {
    admin: '/admin-home',
    staff: '/staff-home',
    resident: '/resident-home'
  }[userRole] || '/';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEventData({
      ...eventData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Helper function to convert time string to minutes for comparison
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    return parseInt(hours) * 60 + parseInt(minutes);
  };

  // Function to check if events overlap
  const checkForOverlap = async (newEvent) => {
    const db = getFirestore(app);
    
    // Query for events on the same date and location
    const eventsRef = collection(db, 'events');
    const q = query(
      eventsRef, 
      where('date', '==', newEvent.date),
      where('location', '==', newEvent.location),
      where('status', '==', 'active')
    );

    const querySnapshot = await getDocs(q);
    
    // Convert new event times to minutes for comparison
    const newStartTime = timeToMinutes(newEvent.startTime);
    const newEndTime = timeToMinutes(newEvent.endTime);
    
    // Check each existing event for overlap
    for (const doc of querySnapshot.docs) {
      const existingEvent = doc.data();
      
      // Convert existing event times to minutes
      const existingStartTime = timeToMinutes(existingEvent.startTime);
      const existingEndTime = timeToMinutes(existingEvent.endTime);
      
      // Check for any overlap
      if (
        (newStartTime >= existingStartTime && newStartTime < existingEndTime) || // New event starts during existing event
        (newEndTime > existingStartTime && newEndTime <= existingEndTime) || // New event ends during existing event
        (newStartTime <= existingStartTime && newEndTime >= existingEndTime) // New event encompasses existing event
      ) {
        return {
          hasOverlap: true,
          conflictingEvent: existingEvent
        };
      }
    }
    
    return {
      hasOverlap: false
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Validate end time is after start time
      if (timeToMinutes(eventData.endTime) <= timeToMinutes(eventData.startTime)) {
        setErrorMessage('End time must be after start time');
        setIsSubmitting(false);
        return;
      }
      
      // Check for overlapping events
      const overlapCheck = await checkForOverlap(eventData);
      
      if (overlapCheck.hasOverlap) {
        setErrorMessage(`This time slot overlaps with an existing "${overlapCheck.conflictingEvent.title}" event scheduled at ${overlapCheck.conflictingEvent.startTime} to ${overlapCheck.conflictingEvent.endTime}`);
        setIsSubmitting(false);
        return;
      }
      
      // Initialize Firestore
      const db = getFirestore(app);
      console.log('Firestore initialized:', !!db);
      
      // Debug: log event data before submission
      console.log('Attempting to create event with data:', eventData);
      
      // Add event to Firestore
      const eventRef = await addDoc(collection(db, 'events'), {
        ...eventData,
        maxParticipants: Number(eventData.maxParticipants),
        createdAt: serverTimestamp(),
        createdBy: localStorage.getItem('userId') || 'unknown',
        participants: [],
        status: 'active'
      });

      console.log('Event created with ID:', eventRef.id);
      alert(`🎉 Event "${eventData.title}" created successfully!`);
      navigate('/admin-home');
    } catch (error) {
      console.error('Error creating event:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', JSON.stringify(error));
      
      // Provide more specific error messages based on error type
      if (error.code === 'permission-denied') {
        setErrorMessage('Permission denied. You may not have access to create events.');
      } else if (error.code === 'unavailable') {
        setErrorMessage('Firebase service is currently unavailable. Please try again later.');
      } else if (error.code === 'not-found') {
        setErrorMessage('Firestore database not found. Please check your Firebase configuration.');
      } else {
        setErrorMessage(`Failed to create event: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="create-events-container fade-in">
      {/* Your existing JSX code remains unchanged */}
      <section className="animated-banner">
        <hr className="blue-block blue-block-large" />
        <hr className="blue-block blue-block-medium" />
        <hr className="blue-block blue-block-small" />
      </section>

      <header className="page-header glass-card">
        <Link to={'/admin-home'} className="back-link">← Back to Dashboard</Link>
        <p className="header-description">Schedule tournaments, workshops, or community fun with ease!</p>
      </header>

      {errorMessage && <section className="error-message pulse">{errorMessage}</section>}

      <form className="event-form glass-card" onSubmit={handleSubmit}>
        <section className="form-section">
          <h2 className="section-title">🎯 Event Details</h2>

          <fieldset className="form-group">
            <label htmlFor="title">Event Title</label>
            <input type="text" id="title" name="title" value={eventData.title} onChange={handleChange} required placeholder="Enter a descriptive title" />
          </fieldset>

          <section className="form-row">
            <fieldset className="form-group">
              <label htmlFor="eventType">Event Type</label>
              <select id="eventType" name="eventType" value={eventData.eventType} onChange={handleChange} required>
                <option value="">Select type</option>
                <option value="tournament">Tournament</option>
                <option value="class">Class/Workshop</option>
                <option value="competition">Competition</option>
                <option value="community">Community Gathering</option>
                <option value="other">Other</option>
              </select>
            </fieldset>

            <fieldset className="form-group">
              <label htmlFor="description">Description</label>
              <textarea id="description" name="description" value={eventData.description} onChange={handleChange} rows="4" placeholder="What to expect? What to bring?" required></textarea>
            </fieldset>
          </section>
        </section>

        <section className="form-section">
          <h2 className="section-title">📅 Schedule & Location</h2>

          <section className="form-row three-columns">
            <fieldset className="form-group">
              <label htmlFor="date">Date</label>
              <input type="date" id="date" name="date" value={eventData.date} onChange={handleChange} required />
            </fieldset>
            <fieldset className="form-group">
              <label htmlFor="startTime">Start Time</label>
              <input type="time" id="startTime" name="startTime" value={eventData.startTime} onChange={handleChange} required />
            </fieldset>
            <fieldset className="form-group">
              <label htmlFor="endTime">End Time</label>
              <input type="time" id="endTime" name="endTime" value={eventData.endTime} onChange={handleChange} required />
            </fieldset>
          </section>

          <section className="form-row">
            <fieldset className="form-group">
              <label htmlFor="location">Facility</label>
              <select id="location" name="location" value={eventData.location} onChange={handleChange} required className="location-select">
                <option value="">Select a facility</option>
                <option value="soccer-field">Soccer Field</option>
                <option value="basketball-court">Basketball Court</option>
                <option value="swimming-pool">Swimming Pool</option>
                <option value="tennis-court">Tennis Court</option>
                <option value="community-hall">Community Hall</option>
              </select>
            </fieldset>

            <fieldset className="form-group">
              <label htmlFor="maxParticipants">Maximum Participants</label>
              <input type="number" id="maxParticipants" name="maxParticipants" value={eventData.maxParticipants} onChange={handleChange} min="1" placeholder="Max capacity" />
            </fieldset>
          </section>
        </section>

        <footer className="form-actions">
          <Link to={'/admin-home'} className="btn secondary-btn">Cancel</Link>
          <button type="submit" className="btn primary-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Event'}
          </button>
        </footer>
      </form>
    </main>
  );
};

export default CreateEvents;