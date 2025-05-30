import React, { useEffect, useState } from "react";
import { fetchIssues } from "../../../backend/services/issuesService.js";
import { UpdateIssue } from "../../../backend/services/issuesService.js"; 
import "./IssuesPage.css";
import { fetchUser} from "../../../backend/services/userServices.js";
import { FaBars } from 'react-icons/fa';
import { toast } from "react-toastify";
import { useNavigate ,Navigate} from "react-router-dom";

const IssuesPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [editedIssue, setEditedIssue] = useState(null);
  const [reporter, setReporter] = useState(null); // State to hold reporter data
  const navigate = useNavigate();
  
    
    const handleNavigate = (path) => {
      navigate(path);
    };
    const toggleMenu = () => {
      setMenuOpen(!menuOpen);
    };
     const handleSignOut = () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userType');
      navigate('/');
    };

  useEffect(() => {
    const loadIssues = async () => {
      setIsLoading(true);
      try {
        const data = await fetchIssues();
        setIssues(data);
      } catch (error) {
        console.error("Failed to load issues:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadIssues();
  }, []);

  // Set up editedIssue whenever selectedIssue changes
  useEffect(() => {
    const selectIssue = async () => {
      if (selectedIssue) {
        setEditedIssue({ ...selectedIssue });
        const reporter = await fetchUser(selectedIssue.reporter);
        console.log("Reporter data:", reporter.displayName); // Log the reporter data
        setReporter(reporter.displayName); // Set the reporter state
      } else {
        setEditedIssue(null);
      }
    };

    selectIssue();
  }, [selectedIssue]);

  // Filter issues based on status
  const filteredIssues =
    statusFilter === "all"
      ? issues
      : issues.filter((issue) => issue.issueStatus === statusFilter);

  // Calculate pagination
  const totalPages = Math.ceil(filteredIssues.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedIssues = filteredIssues.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const handleIssueClick = (issue) => {
    setSelectedIssue(issue);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Handle changes to the edited issue
  const handleEditChange = (field, value) => {
    setEditedIssue((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Submit the updated issue
  const handleUpdateIssue = async () => {
    if (!editedIssue) return;

    setIsLoading(true);
    try {
      await UpdateIssue(editedIssue.issueID, editedIssue);

      // Update the issues array with the edited issue
      setIssues(
        issues.map((issue) =>
          issue.issueID === editedIssue.issueID ? editedIssue : issue
        )
      );

      // Update selected issue as well
      setSelectedIssue(null);

      // Show success message or notification here if needed
      toast.success("Updated Successfully!", {
        position: "top-right",
        autoClose: 3000, // 3 seconds
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error("Failed to update issue:", error);
      // Show error message if needed
      alert("Failed to update issue. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="issues-page">

      <header className="facility-header">
        <section className="hamburger-menu">
          <FaBars className="hamburger-icon" onClick={toggleMenu} />
          {menuOpen && (
            <nav className="dropdown-menu">
              <button onClick={() => handleNavigate('/')}>Home</button>
              <button onClick={handleSignOut}>Sign Out</button>
            </nav>
          )}
        </section>
        <h1 className="facility-title">Issue Reports</h1>
        <p className="facility-subtitle">
          View and manage maintenance issues reported by facility users
        </p>
      </header>

      <section className="filter-controls">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
          data-testid="status-filter"
          className="status-filter"
        >
          <option value="all">All Status</option>
          <option value="pending">pending</option>
          <option value="in-review">In Review</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">resolved</option>
          <option value="closed">Closed</option>
        </select>
      </section>

      <section className="issues-container">
        <table className="issues-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Location</th>
              <th>Reported</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="6" className="loading-cell">
                  <figure className="table-spinner"></figure>
                  <p>Loading issues...</p>
                </td>
              </tr>
            ) : (
              paginatedIssues.map((issue) => (
                <tr
                  key={issue.issueID}
                  onClick={() => handleIssueClick(issue)}
                  className={
                    selectedIssue?.issueID === issue.issueID
                      ? "selected-row"
                      : ""
                  }
                >
                  <td>{issue.issueTitle}</td>
                  <td>
                    <mark
                      className={`status-badge status-${issue.issueStatus}`}
                    >
                      {issue.issueStatus}
                    </mark>
                  </td>
                  <td>
                    <mark
                      className={`priority-badge priority-${issue.priority}`}
                    >
                      {issue.priority}
                    </mark>
                  </td>
                  <td>{issue.location}</td>
                  <td>
                    <time dateTime={issue.reportedAt}>
                      {new Date(issue.reportedAt).toLocaleDateString()}
                    </time>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <footer className="pagination-controls">
        <label>Rows per page: </label>
        <select
          value={rowsPerPage}
          onChange={(e) => setRowsPerPage(Number(e.target.value))}
          className="rows-select"
        >
          <option value={50}>50</option>
          <option value={100}>100</option>
          <option value={200}>200</option>
        </select>

        <output className="page-info" data-testid="page-info">
          {startIndex + 1}–
          {Math.min(startIndex + rowsPerPage, filteredIssues.length)} of{" "}
          {filteredIssues.length}
        </output>

        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className="pagination-btn"
          aria-label="Previous page"
        >
          &lt;
        </button>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="pagination-btn"
          aria-label="Next page"
        >
          &gt;
        </button>
      </footer>

      {selectedIssue && editedIssue && (
        <aside className="issue-details-modal" role="dialog">
          <article className="modal-content">
            <header className="modal-header">
              <h2>{selectedIssue.issueTitle}</h2>
              <button
                onClick={() => setSelectedIssue(null)}
                className="close-btn"
              >
                ×
              </button>
            </header>
            <section className="modal-body">
              <section className="details-grid">
                <article className="detail-item status-progress-container">
                  <h4>Status</h4>
                  <nav
                    className="status-progress-bar"
                    data-status={editedIssue.issueStatus}
                    data-testid="status-progress-bar"
                  >
                    {[
                      "pending",
                      "in-review",
                      "in-progress",
                      "resolved",
                      "closed",
                    ].map((status, index) => {
                      const currentIndex = [
                        "pending",
                        "in-review",
                        "in-progress",
                        "resolved",
                        "closed",
                      ].indexOf(editedIssue.issueStatus);
                      const isCompleted = index < currentIndex;
                      const isActive = index === currentIndex;

                      return (
                        <button
                          key={status}
                          type="button"
                          className={`status-step ${
                            isCompleted ? "completed" : ""
                          } ${isActive ? "active" : ""}`}
                          onClick={() =>
                            handleEditChange("issueStatus", status)
                          }
                          data-status={status}
                        >
                          <i className="step-circle"></i>
                          <small className="step-label">
                            {status
                              .replace("-", " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </small>
                        </button>
                      );
                    })}
                  </nav>
                </article>

                <article className="detail-item">
                  <h4>Priority</h4>
                  <select
                    value={editedIssue.priority}
                    onChange={(e) =>
                      handleEditChange("priority", e.target.value)
                    }
                    className="priority-select"
                    aria-label="Priority"
                    data-testid="priority-select"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </article>
                <article className="detail-item">
                  <h4>Location</h4>
                  <p>{editedIssue.location}</p>
                </article>
                <article className="detail-item">
                  <h4>Reported By</h4>
                  <p>{reporter || "Anonymous"}</p>
                </article>
                <article className="detail-item">
                  <h4>Reported At</h4>
                  <p>
                    <time dateTime={editedIssue.reportedAt}>
                      {new Date(editedIssue.reportedAt).toLocaleString()}
                    </time>
                  </p>
                </article>
                
              </section>

              <section className="description-section">
                <h4>Description</h4>
                <p>{editedIssue.issueDescription}</p>
              </section>

              {editedIssue.images && editedIssue.images.length > 0 && (
                <section className="images-section">
                  <h4>Images</h4>
                  <figure className="image-gallery">
                    {editedIssue.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Issue ${editedIssue.issueID} - Image ${
                          index + 1
                        }`}
                        className="issue-image"
                      />
                    ))}
                  </figure>
                </section>
              )}

              <section className="feedback-section">
                <h4>Staff Feedback</h4>
                <textarea
                  value={editedIssue.feedback || ""}
                  onChange={(e) => handleEditChange("feedback", e.target.value)}
                  placeholder="Enter feedback or resolution notes here..."
                  className="feedback-textarea"
                />
              </section>
            </section>
            <footer className="modal-footer">
              <button
                className={`facility-btn update-btn ${
                  isLoading ? "loading" : ""
                }`}
                onClick={handleUpdateIssue}
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Update Issue"}
              </button>
            </footer>
          </article>
        </aside>
      )}
    </main>
  );
};

export default IssuesPage;