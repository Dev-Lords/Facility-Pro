import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { FaCalendarAlt, FaClock ,FaBars} from 'react-icons/fa';
import './CreateEvents.css';

const CreateEvents = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);

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
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
   const handleSignOut = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userType');
    navigate('/');
  };

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
    
    // Clear error message when user starts typing/changing values
    if (errorMessage) {
      setErrorMessage('');
      setShowErrorPopup(false);
    }
  };

  // Helper function to convert time string to minutes for comparison
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    return parseInt(hours) * 60 + parseInt(minutes);
  };

  // Function to check if the event date/time is in the past
  const isEventInPast = (date, time) => {
    const now = new Date();
    const eventDateTime = new Date(`${date}T${time}`);
    return eventDateTime < now;
  };

  // Function to check if the event date is today and time validation
  const validateEventDateTime = (date, startTime, endTime) => {
    const errors = [];
    
    // Check if date is in the past
    const today = new Date();
    const eventDate = new Date(date);
    const todayDateString = today.toISOString().split('T')[0];
    
    if (date < todayDateString) {
      errors.push('Event date cannot be in the past');
    }
    
    // If event is today, check if start time is in the past
    if (date === todayDateString && startTime) {
      const now = new Date();
      const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                         now.getMinutes().toString().padStart(2, '0');
      
      if (startTime <= currentTime) {
        errors.push('Event start time cannot be in the past');
      }
    }
    
    // Check if end time is after start time
    if (startTime && endTime) {
      if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
        errors.push('End time must be after start time');
      }
      
      // Check for minimum event duration (optional - you can adjust or remove this)
      const durationMinutes = timeToMinutes(endTime) - timeToMinutes(startTime);
      if (durationMinutes < 30) {
        errors.push('Event must be at least 30 minutes long');
      }
    }
    
    return errors;
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
      // Validate date and time
      const dateTimeErrors = validateEventDateTime(eventData.date, eventData.startTime, eventData.endTime);
      if (dateTimeErrors.length > 0) {
        setErrorMessage(dateTimeErrors.join('. '));
        setShowErrorPopup(true);
        setIsSubmitting(false);
        return;
      }
      
      // Validate max participants
      if (parseInt(eventData.maxParticipants) <= 0) {
        setErrorMessage('Maximum participants must be greater than 0');
        setShowErrorPopup(true);
        setIsSubmitting(false);
        return;
      }

      // Validate max participants is reasonable (optional limit)
      if (parseInt(eventData.maxParticipants) > 1000) {
        setErrorMessage('Maximum participants cannot exceed 1000');
        setShowErrorPopup(true);
        setIsSubmitting(false);
        return;
      }
      
      // Check for overlapping events
      const overlapCheck = await checkForOverlap(eventData);
      
      if (overlapCheck.hasOverlap) {
        setErrorMessage(`This time slot overlaps with an existing "${overlapCheck.conflictingEvent.title}" event scheduled from ${overlapCheck.conflictingEvent.startTime} to ${overlapCheck.conflictingEvent.endTime}`);
        setShowErrorPopup(true);
        setIsSubmitting(false);
        return;
      }
      
      // Initialize Firestore
      const db = getFirestore(app);
      
      // Add event to Firestore
      const eventRef = await addDoc(collection(db, 'events'), {
        ...eventData,
        maxParticipants: Number(eventData.maxParticipants),
        createdAt: serverTimestamp(),
        createdBy: localStorage.getItem('userId') || 'unknown',
        participants: [],
        status: 'active'
      });

      // Reset the form data
      setEventData({
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

      setShowSuccessMessage(true);
    } catch (error) {
      console.error('Error creating event:', error);
      
      // Provide more specific error messages based on error type
      if (error.code === 'permission-denied') {
        setErrorMessage('Permission denied. You may not have access to create events.');
      } else if (error.code === 'unavailable') {
        setErrorMessage('Firebase service is currently unavailable. Please try again later.');
      } else if (error.code === 'not-found') {
        setErrorMessage('Firestore database not found. Please check your Firebase configuration.');
      } else if (error.code === 'deadline-exceeded') {
        setErrorMessage('Request timed out. Please check your internet connection and try again.');
      } else if (error.code === 'resource-exhausted') {
        setErrorMessage('Service temporarily unavailable due to high demand. Please try again later.');
      } else if (error.code === 'unauthenticated') {
        setErrorMessage('Authentication required. Please log in again.');
      } else {
        setErrorMessage(`Failed to create event: ${error.message}`);
      }
      setShowErrorPopup(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get today's date for min attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <section className="issue-form-container">
      
      <article className="issue-form">
        <aside className="form-image">
          <p className="form-message-bounce">
            Create memorable events for our community members to enjoy!
          </p>
          <figure className="form-icon-stack">
            <FaCalendarAlt className="form-icon" />
            <FaClock className="form-icon" />
          </figure>
        </aside>

        <form className="form-fields" onSubmit={handleSubmit}>
          <h2>Create New Event</h2>

          {/* Inline error message for immediate feedback */}
          {errorMessage && !showErrorPopup && <p className="error-message">{errorMessage}</p>}

          <label htmlFor="title">Event Title</label>
          <input
            id="title"
            name="title"
            placeholder="e.g. Summer Pool Party"
            onChange={handleChange}
            value={eventData.title}
            required
            maxLength={100}
          />

          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            placeholder="Describe the event in detail..."
            onChange={handleChange}
            value={eventData.description}
            required
            maxLength={500}
            rows={4}
          />

          <fieldset className="form-row">
            <legend>Event Schedule</legend>
            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              name="date"
              onChange={handleChange}
              value={eventData.date}
              min={today}
              required
            />
            
            <label htmlFor="startTime">Start Time</label>
            <input
              id="startTime"
              type="time"
              name="startTime"
              onChange={handleChange}
              value={eventData.startTime}
              required
            />
            
            <label htmlFor="endTime">End Time</label>
            <input
              id="endTime"
              type="time"
              name="endTime"
              onChange={handleChange}
              value={eventData.endTime}
              required
            />
          </fieldset>

          <label htmlFor="location">Location</label>
          <select 
            id="location"
            name="location" 
            onChange={handleChange} 
            value={eventData.location} 
            required
          >
            <option value="">Select a facility</option>
            <option value="soccer-field">Soccer Field</option>
            <option value="basketball-court">Basketball Court</option>
            <option value="swimming-pool">Swimming Pool</option>
            <option value="tennis-court">Tennis Court</option>
            <option value="community-hall">Community Hall</option>
          </select>

          <label htmlFor="eventType">Event Type</label>
          <select 
            id="eventType"
            name="eventType" 
            onChange={handleChange} 
            value={eventData.eventType} 
            required
          >
            <option value="">Select type</option>
            <option value="tournament">Tournament</option>
            <option value="class">Class/Workshop</option>
            <option value="competition">Competition</option>
            <option value="community">Community Gathering</option>
            <option value="other">Other</option>
          </select>

          <label htmlFor="maxParticipants">Maximum Participants</label>
          <input
            id="maxParticipants"
            type="number"
            name="maxParticipants"
            placeholder="e.g. 20"
            onChange={handleChange}
            value={eventData.maxParticipants}
            min="1"
            max="1000"
            required
          />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Event'}
          </button>
        </form>
      </article>

      {/* Error Pop-up Modal */}
      {showErrorPopup && (
        <dialog className="error-popup" open>
          <article className="popup-content error-content">
            <h3>⚠️ Unable to Create Event</h3>
            <p>{errorMessage}</p>
            <div className="popup-actions">
              <button 
                className="popup-button primary"
                onClick={() => {
                  setShowErrorPopup(false);
                  setErrorMessage('');
                }}
              >
                OK, I'll Fix It
              </button>
            </div>
          </article>
        </dialog>
      )}

      {/* Success Pop-up Modal */}

      {showSuccessMessage && (
        <dialog className="success-popup" open>
          <article className="popup-content success-content">
            <h3>✅ Event Created Successfully!</h3>
            <p>The event has been added to the calendar and is now visible to community members.</p>
            <div className="popup-actions">
              <button 
                className="popup-button primary"
                onClick={() => {
                  setShowSuccessMessage(false);
                  navigate(dashboardPath);
                }}
              >
                Return to Dashboard
              </button>
              <button 
                className="popup-button secondary"
                onClick={() => {
                  setShowSuccessMessage(false);
                }}
              >
                Create Another Event
              </button>
            </div>
          </article>
        </dialog>
      )}
    </section>
  );
};

export default CreateEvents;