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
import { FaCalendarAlt, FaClock } from 'react-icons/fa';
import './CreateEvents.css';

const CreateEvents = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

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
      } else {
        setErrorMessage(`Failed to create event: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="issue-form-container">
      <div className="issue-form">
        <div className="form-image">
          <div className="form-message-bounce">
            <p>Create memorable events for our community members to enjoy!</p>
          </div>
          <div className="form-icon-stack">
            <FaCalendarAlt className="form-icon" />
            <FaClock className="form-icon" />
          </div>
        </div>

        <form className="form-fields" onSubmit={handleSubmit}>
          <h2>Create New Event</h2>

          {errorMessage && <div className="error-message">{errorMessage}</div>}

          <label htmlFor="title">Event Title</label>
          <input
            id="title"
            name="title"
            placeholder="e.g. Summer Pool Party"
            onChange={handleChange}
            value={eventData.title}
            required
          />

          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            placeholder="Describe the event in detail..."
            onChange={handleChange}
            value={eventData.description}
            required
          />

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                name="date"
                onChange={handleChange}
                value={eventData.date}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="startTime">Start Time</label>
              <input
                id="startTime"
                type="time"
                name="startTime"
                onChange={handleChange}
                value={eventData.startTime}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="endTime">End Time</label>
              <input
                id="endTime"
                type="time"
                name="endTime"
                onChange={handleChange}
                value={eventData.endTime}
                required
              />
            </div>
          </div>

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
            required
          />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Event'}
          </button>
        </form>
      </div>

      {showSuccessMessage && (
        <div className="success-popup">
          <div className="popup-content">
            <h3>Your event was created successfully!</h3>
            <p>The event has been added to the calendar and is now visible to community members.</p>
            <button onClick={() => {
              setShowSuccessMessage(false);
              navigate('/admin-home');
            }}>Return to Dashboard</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateEvents;