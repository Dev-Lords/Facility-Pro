import React, { useEffect, useState } from "react";
import { fetchBookings, updateBooking } from "../../../backend/services/bookingService.js";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { fetchUser } from "../../../backend/services/userServices.js";
import { Filter, Search, ChevronDown, X } from "lucide-react";
import "./Bookings.css";

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState({});
  const [editBooking, setEditBooking] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 10;
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  //FETCHING ALL BOOKINGS IN ORDER TO REVIEW THEM
  useEffect(() => {
    const getBookings = async () => {
      try {
        const bookingsList = await fetchBookings();
        
        // Fetch user info for each booking
        const usersMap = {}; 
        await Promise.all(
          bookingsList.map(async (booking) => {
            if (!usersMap[booking.userID]) {
              const userData = await fetchUser(booking.userID);
              if (userData) {
                usersMap[booking.userID] = userData;
              }
            }
          })
        );

        setBookings(
          bookingsList.sort((a, b) => new Date(b.date) - new Date(a.date))
        );
        setUsers(usersMap);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getBookings();
  }, []);

  //Pagination improvements for smoother UI experience
  useEffect(() => {
    const tableTop = document.querySelector(".bookings-table-container");
    if (tableTop && typeof tableTop.scrollIntoView === "function") {
      tableTop.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

  //FILTERING AND SEARCHING THROUGH BOOKINGS
  const filteredBookings = bookings.filter((booking) => {
    const user = users[booking.userID];
    const displayName = user?.displayName || "";
    const matchesSearch =
      displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.facilityID?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.date.includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || booking.status === filterType;

    return matchesSearch && matchesFilter;
  });

  const Statuses = ["all", ...new Set(bookings.map((booking) => booking.status))];
  const toggleFilterDropdown = () => {
    setIsFilterOpen(!isFilterOpen);
  };
  
  //EDIT BOOKING POP-UP SETTINGS
  const openEditModal = (booking) => {
    setEditBooking(booking);
  };

  //HANDLE CHANGE OF BOOKING STATUS
  const handleStatusChange = async (booking, newStatus) => {
    if (!editBooking) return;

    try {
      if (booking.status === "approved" || booking.status === "declined") {
        toast.info("This booking has already been reviewed and cannot be changed.");
        return;
      }

      setBookings(prevBookings =>
        prevBookings.map(b =>
          b.bookingID === booking.bookingID ? { ...b, status: newStatus } : b
        )
      );

      setIsProcessing(true);
      const { success } = await updateBooking(booking.bookingID, newStatus);
  
      if (success) {
        toast.success(`${newStatus} booking successfully!`);
      } else {
        toast.error("Failed to update booking status.");
      }
      setEditBooking(null);
    } catch (error) {
      toast.error("Failed to update booking status.");
    } finally {
      setIsProcessing(false);
    }
  };

  //PAGINATION IMPLEMENTATION FOR BETTER UI
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);

  //TIMESLOTS FUNCTION FOR BETTER UI
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
    <main className="bookings-page">
      <header className="bookings-header">
        <h1 className="bookings-title">Bookings Review</h1>
        <p className="bookings-subtitle">Approve and Decline bookings!</p>
      </header>

      {/* Breadcrumb */}
      <nav className="breadcrumb-nav">
        <button 
          onClick={() => handleNavigate('/admin-home')} 
          className="breadcrumb-link"
        >
          <i className="home-icon">🏠</i> Dashboard
        </button>
        <strong className="separator">/</strong>
      </nav>

      <form className="search-filter-container" onSubmit={(e) => e.preventDefault()}>
        <fieldset className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search users..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </fieldset>

        <fieldset className="filter-container">
          <button
            type="button"
            onClick={toggleFilterDropdown}
            className="filter-button"
          >
            <Filter size={16} />
            {filterType === "all" ? "Booking status" : filterType}
            <ChevronDown size={16} className="chevron-icon" />
          </button>

          {isFilterOpen && (
            <ul className="filter-dropdown">
              {Statuses.map((type, index) => (
                <li
                  key={`${type}-${index}`}
                  className="filter-option"
                  onClick={() => {
                    setFilterType(type);
                    setIsFilterOpen(false);
                  }}
                >
                  {type === "all" ? "All Bookings" : type}
                </li>
              ))}
            </ul>
          )}
        </fieldset>
      </form>

      <section className="bookings-table-container">
        <table className="bookings-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Date</th>
              <th>Location</th>
              <th>Timeslots</th>
              <th>Booking Status:</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="6" className="loading-cell">
                  <section className="spinner-container">
                    <svg className="spinner" viewBox="0 0 50 50">
                      <circle className="spinner-ring" cx="25" cy="25" r="20" />
                    </svg>
                    <p>Loading bookings...</p>
                  </section>
                </td>
              </tr>
            ) : currentBookings.length === 0 ? (
              <tr>
                <td colSpan="6" className="loading-cell">
                  <p>No bookings to review</p>
                </td>
              </tr>
            ) : (
              currentBookings.map((booking, index) => (
                <tr key={booking.bookingID || `booking-${index}`}>
                  <td>{users[booking.userID]?.displayName || booking.userID}</td>
                  <td>
                    <time dateTime={booking.date}>{booking.date}</time>
                  </td>
                  <td>{booking.facilityID.charAt(0).toUpperCase() + booking.facilityID.slice(1)}</td>
                  <td className="timeslot-cell">
                    <small>{formatTimeslots(booking.bookedSlots)}</small>
                  </td>
                  <td className="action-cell">
                    {/* Pending Button */}
                    {booking.status === "pending" && (
                      <button
                        className="pending-button"
                        onClick={() => openEditModal(booking)}
                        disabled={isProcessing}
                      >
                        Pending
                      </button>
                    )}

                    {/* Declined button */}
                    {booking.status === "declined" && (
                      <button
                        className="decline-button"
                        disabled
                      >
                        {booking.status}
                      </button>
                    )}

                    {/* Approved button */}
                    {booking.status === "approved" && (
                      <button
                        className="approve-button"
                        disabled
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

      {/* Edit booking popup */}
      {editBooking && (
        <section className="modal-overlay" role="dialog" aria-labelledby="modal-title" aria-modal="true">
          <article className="modal-box edit-modal-box">
            <button
              className="close-popup-btn"
              onClick={() => setEditBooking(null)}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            <header>
              <h4 id="modal-title">Review Booking!</h4>
            </header>
            
            <dl className="booking-details">
              <dt>Name:</dt>
              <dd>{users[editBooking.userID]?.displayName || editBooking.userID}</dd>
              
              <dt>Date:</dt>
              <dd>
                <time dateTime={editBooking.date}>{editBooking.date}</time>
              </dd>
              
              <dt>Facility:</dt>
              <dd>{editBooking.facilityID.charAt(0).toUpperCase() + editBooking.facilityID.slice(1)}</dd>
              
              <dt>Timeslots:</dt>
              <dd>
                <small>{formatTimeslots(editBooking.bookedSlots)}</small>
              </dd>
            </dl>

            <footer className="modal-buttons">
              <button
                className="approve-button"
                onClick={() => handleStatusChange(editBooking, "approved")}
                disabled={isProcessing}
              >
                Approve
              </button>
              
              <button
                className="decline-button"
                onClick={() => handleStatusChange(editBooking, "declined")}
                disabled={isProcessing}
              >
                Decline
              </button>
            </footer>
          </article>
        </section>
      )}

      {/* Pagination */}
      <nav aria-label="Bookings pagination">
        <ul className="pagination-list">
          <li>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
          </li>
          {Array.from({ length: totalPages }, (_, i) => (
            <li key={i}>
              <button
                onClick={() => setCurrentPage(i + 1)}
                className={currentPage === i + 1 ? "active-page" : ""}
                aria-current={currentPage === i + 1 ? "page" : undefined}
              >
                {i + 1}
              </button>
            </li>
          ))}
          <li>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </li>
        </ul>
      </nav>

      <footer className="footer">
        <p>Facility Management System • Admin services • Version 1.0.4</p>
      </footer>
    </main>
  );
};

export default BookingsPage;