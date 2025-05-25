import React, { useEffect, useState } from "react";
import { fetchIssues } from "../../../backend/services/issuesService.js";
import { fetchUserBookings } from "../../../backend/services/bookingService.js";
import "../staff/IssuesPage.css";
import { FaBars } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";

const MyBookingsPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
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
    const loadBookings = async () => {
      setIsLoading(true);
      try {
        const data = await fetchUserBookings(localStorage.getItem('userID')); 
        setBookings(data);
      } catch (error) {
        console.error("Failed to load bookings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadBookings();
  }, []);

  const filteredBookings =
    statusFilter === "all"
      ? bookings
      : bookings.filter((booking) => booking.status === statusFilter);

  const totalPages = Math.ceil(filteredBookings.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedBookings = filteredBookings.slice(
    startIndex,
    startIndex + rowsPerPage
  );

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
const formatTimeslots = (slots) => {
    return slots.map((slot, i) => {
      const startHour = slot;
      const endHour = slot + 1;
      const startTime = startHour > 12 ? `${startHour - 12}pm` : `${startHour}am`;
      const endTime = endHour > 12 ? `${endHour - 12}pm` : `${endHour}am`;
      return `• ${startTime}-${endTime}${i < slots.length - 1 ? '  ' : ''}`;
    }).join('');
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
        <h1 className="facility-title">My Bookings</h1>
        <p className="facility-subtitle">View all your current and past facility bookings</p>
      </header>

      <section className="filter-controls">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
          className="status-filter"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="declined">Declined</option>
        </select>
      </section>

      <section className="issues-container">
  <table className="issues-table">
    <thead>
      <tr>
        <th>Facility</th>
        <th>Date</th>
        <th>Slots</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      {isLoading ? (
        <tr>
          <td colSpan="4" className="loading-cell">
            <figure className="table-spinner"></figure>
            <p>Loading bookings...</p>
          </td>
        </tr>
      ) : (
        paginatedBookings.map((booking) => (
          <tr
            key={booking.bookingID}
        
          >
            <td>{booking.facilityID}</td>
            <td>
              
                {booking.date}
            
            </td>
            
            <td className="timeslot-cell">
                    <small>{formatTimeslots(booking.bookedSlots)}</small>
                  </td>
            
            <td className="action-cell">
                   
                    {booking.status === "pending" && (
                      <button
                        className="pending-button"
                        style={{ pointerEvents: "none", cursor: "default" }}
        
                      >
                        Pending
                      </button>
                    )}

                    
                    {booking.status === "declined" && (
                      <button
                        className="decline-button"
                        style={{ pointerEvents: "none", cursor: "default" }}
                        
                    
                      >
                        {booking.status}
                      </button>
                    )}

                 
                    {booking.status === "approved" && (
                      <button
                        className="approve-button"
                        style={{ pointerEvents: "none", cursor: "default" }}

                      >
                        {booking.status}
                      </button>
                    )}
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

        <output className="page-info">
          {startIndex + 1}–{Math.min(startIndex + rowsPerPage, filteredBookings.length)} of{" "}
          {filteredBookings.length}
        </output>

        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className="pagination-btn"
        >
          &lt;
        </button>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="pagination-btn"
        >
          &gt;
        </button>
      </footer>
    </main>
  );
};

export default MyBookingsPage;
