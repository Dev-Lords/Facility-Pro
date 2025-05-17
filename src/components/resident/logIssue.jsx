import React, { useState, useEffect } from "react";
import { createIssue } from "../../../backend/services/issuesService";
import { FaTools, FaWrench } from "react-icons/fa";
import { getAuth } from "firebase/auth";
import "./logIssue.css";
import { logFacilityEvent } from "../../../backend/services/logService";
import SearchableLocationDropdown from "./SearchableLocationDropdown";


export default function LogIssueForm() {
  const [formData, setFormData] = useState({
    issueTitle: "",
    issueDescription: "",
    location: "",
    priority: "medium",
    category: "",
    relatedFacility: "",
    images: [],
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [submittedIssueId, setSubmittedIssueId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
    });
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
      const issueData = {
        issueTitle: formData.issueTitle,
        issueDescription: formData.issueDescription,
        location: formData.location,
        priority: formData.priority,
        category: formData.category,
        relatedFacility: formData.relatedFacility,
        images: formData.images,
        reporter: currentUser.uid,
        reportedAt: new Date().toISOString()
      };
      
      const issueId = await createIssue(issueData);
      
      setSubmittedIssueId(issueId);
      setFormData({
        issueTitle: "",
        issueDescription: "",
        location: "",
        priority: "medium",
        category: "",
        relatedFacility: "",
        images: [],
      });

      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.value = "";
      }

      const details = {
        issueTitle: formData.issueTitle,
        issueDescription: formData.issueDescription,
        location: formData.location,
        priority: formData.priority,
        category: formData.category,
        relatedFacility: formData.relatedFacility,
      };

      logFacilityEvent("issue", formData.location, issueId, currentUser.uid, details);
      setShowSuccessMessage(true);

    } catch (error) {
      console.error("Error submitting issue:", error);
      setError(error.message || "Error submitting issue");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="issue-form-container">
      <section className="issue-form">
        <figure className="form-image">
          <blockquote className="form-message-bounce">
            <p>Your comfort is our priority — we're working swiftly to resolve all issues.</p>
          </blockquote>
          <figure className="form-icon-stack">
            <FaTools className="form-icon" />
            <FaWrench className="form-icon" />
          </figure>
        </figure>

        <form className="form-fields" onSubmit={handleSubmit}>
          <h2>Log an Issue</h2>
          
          {currentUser && (
            <aside className="user-info">
              <p>Submitting as: {currentUser.displayName || currentUser.email || currentUser.uid}</p>
            </aside>
          )}
          
          {error && (
            <article className="error-message">
              <p>{error}</p>
            </article>
          )}

          <label htmlFor="issueTitle">Issue Title</label>
          <input
            id="issueTitle"
            name="issueTitle"
            placeholder="e.g. Broken Shower Head"
            onChange={handleChange}
            value={formData.issueTitle}
            required
          />

          <label htmlFor="issueDescription">Description</label>
          <textarea
            id="issueDescription"
            name="issueDescription"
            placeholder="Describe the issue in detail..."
            onChange={handleChange}
            value={formData.issueDescription}
            required
          />

         <SearchableLocationDropdown
             value={formData.location}
             onChange={(selectedLocation) =>
            setFormData((prev) => ({ ...prev, location: selectedLocation }))
          }
        />

          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            onChange={handleChange}
            value={formData.category}
            required
          >
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
          
          <label htmlFor="relatedFacility">Related Facility</label>
          <select
            id="relatedFacility"
            name="relatedFacility"
            value={formData.relatedFacility}
            onChange={handleChange}
            required
          >
            <option value="">Select Related Facility</option>
            <option value="Soccer Field">Soccer Field</option>
            <option value="Gym">Gym</option>
            <option value="Pool">Pool</option>
            <option value="Basketball Court">Basketball Court</option>
            <option value="Not Applicable">Not Applicable</option>
            </select>

          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            required
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <label htmlFor="images">Upload Images</label>
          <input
            id="images"
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
            <footer className="login-warning">You must be logged in to submit an issue</footer>
          )}
        </form>
      </section>

      {showSuccessMessage && (
        <dialog open className="success-popup">
          <article className="popup-content">
            <h3>Your issue was submitted successfully!</h3>
            <p>Thank you for your feedback. We'll address your issue as soon as possible.</p>
            {submittedIssueId && <p>Issue ID: {submittedIssueId}</p>}
            <button onClick={() => setShowSuccessMessage(false)}>Close</button>
          </article>
        </dialog>
      )}
    </main>
  );
}
