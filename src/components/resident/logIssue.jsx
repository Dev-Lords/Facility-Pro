import React, { useState, useEffect } from "react";
import { createIssue } from "../../../backend/services/issuesService";
import { FaTools, FaWrench } from "react-icons/fa";
import { getAuth } from "firebase/auth";
import "./logIssue.css";

export default function LogIssueForm() {
  const [formData, setFormData] = useState({
    issueTitle: "",
    issueDescription: "",
    location: "",
    priority: "medium",
    category: "",
    images: [],
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [submittedIssueId, setSubmittedIssueId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Get the current user when component mounts
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
    });
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    if (e.target.name === "images") {
      setFormData({ ...formData, images: Array.from(e.target.files) });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert("You must be logged in to submit an issue");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Create a copy of formData without modifying the state directly
      const issueData = {
        issueTitle: formData.issueTitle,
        issueDescription: formData.issueDescription,
        location: formData.location,
        priority: formData.priority,
        category: formData.category,
        images: formData.images,
        reporter: currentUser.uid,
        reportedAt: new Date().toISOString()
      };
      
      // Call the createIssue function with the issueData
      const issueId = await createIssue(issueData);
      
      setSubmittedIssueId(issueId);
      
      // Reset the form data
      setFormData({
        issueTitle: "",
        issueDescription: "",
        location: "",
        priority: "medium",
        category: "",
        images: [],
      });

      // Reset the image input field
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.value = "";
      }

      setShowSuccessMessage(true);
    } catch (error) {
      console.error("Error submitting issue:", error);
      setError(error.message || "Error submitting issue");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="issue-form-container">
      <div className="issue-form">
        <div className="form-image">
          <div className="form-message-bounce">
            <p>Your comfort is our priority — we're working swiftly to resolve all issues.</p>
          </div>
          <div className="form-icon-stack">
            <FaTools className="form-icon" />
            <FaWrench className="form-icon" />
          </div>
        </div>

        <form className="form-fields" onSubmit={handleSubmit}>
          <h2>Log an Issue</h2>
          
          {currentUser && (
            <div className="user-info">
              <p>Submitting as: {currentUser.displayName || currentUser.email || currentUser.uid}</p>
            </div>
          )}
          
          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          <label>Issue Title</label>
          <input
            name="issueTitle"
            placeholder="e.g. Broken Shower Head"
            onChange={handleChange}
            value={formData.issueTitle}
            required
          />

          <label>Description</label>
          <textarea
            name="issueDescription"
            placeholder="Describe the issue in detail..."
            onChange={handleChange}
            value={formData.issueDescription}
            required
          />

          <label>Location</label>
          <input
            name="location"
            placeholder="e.g. Second Floor Restroom"
            onChange={handleChange}
            value={formData.location}
            required
          />

          <label>Category</label>
          <select name="category" onChange={handleChange} value={formData.category} required>
            <option value="">Select Category</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Electrical">Electrical</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Security">Security</option>
            <option value="Gym Equipment">Gym Equipment</option>
            <option value="Pool & Sauna">Pool & Sauna</option>
            <option value="Garden & outdoor areas">Garden & outdoor areas</option>
            <option value="General">General</option>
          </select>

          <label>Priority</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            required
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <label>Upload Images</label>
          <input
            type="file"
            name="images"
            accept="image/*"
            multiple
            onChange={handleChange}
          />

          <button type="submit" disabled={isSubmitting || !currentUser}>
            {isSubmitting ? "Submitting..." : "Submit Issue"}
          </button>
          
          {!currentUser && (
            <p className="login-warning">You must be logged in to submit an issue</p>
          )}
        </form>
      </div>

      {showSuccessMessage && (
        <div className="success-popup">
          <div className="popup-content">
            <h3>Your issue was submitted successfully!</h3>
            <p>Thank you for your feedback. We'll address your issue as soon as possible.</p>
            {submittedIssueId && <p>Issue ID: {submittedIssueId}</p>}
            <button onClick={() => setShowSuccessMessage(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}