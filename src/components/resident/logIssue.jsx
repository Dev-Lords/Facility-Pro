import React, { useState } from "react";
import { logIssueToFirebase } from "../../../backend/services/logIssue.js";
import { FaTools, FaWrench } from "react-icons/fa";
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

  const handleChange = (e) => {
    if (e.target.name === "images") {
      setFormData({ ...formData, images: Array.from(e.target.files) });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await logIssueToFirebase(formData, "thembu");
    alert("Issue submitted!");
  };

  return (
    <div className="issue-form-container">
      <div className="issue-form">
        <div className="form-image">
          <div className="form-message-bounce">
            <p>Your comfort is our priority — we’re working swiftly to resolve all issues.</p>
          </div>
          <div className="form-icon-stack">
            <FaTools className="form-icon" />
            <FaWrench className="form-icon" />
          </div>
        </div>

        <form className="form-fields" onSubmit={handleSubmit}>
          <h2>Log an Issue</h2>

          <label>Issue Title</label>
          <input
            name="issueTitle"
            placeholder="e.g. Broken Shower Head"
            onChange={handleChange}
            required
          />

          <label>Description</label>
          <textarea
            name="issueDescription"
            placeholder="Describe the issue in detail..."
            onChange={handleChange}
            required
          />

          <label>Location</label>
          <input
            name="location"
            placeholder="e.g. Second Floor Restroom"
            onChange={handleChange}
            required
          />

          <label>Category</label>
          <select name="category" onChange={handleChange} required>
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

          <button type="submit">Submit Issue</button>
        </form>
      </div>
    </div>
  );
}


