import React, { useEffect, useState } from "react";
import { fetchBookings, UpdateBooking } from "../../../backend/services/bookingService.js";
import { toast } from "react-toastify";
import { getUserByUid } from "../../../backend/services/userServices.js";
import { Filter, Search, ChevronDown } from "lucide-react";
import "./Bookings.css";

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch bookings and users
  useEffect(() => {
    const getBookings = async () => {
      try {
        const bookingsList = await fetchBookings();
        
        // Fetch user info for each booking
        const usersMap = {}; 
        await Promise.all(
          bookingsList.map(async (booking) => {
            if (!usersMap[booking.userID]) {
              const userData = await getUserByUid(booking.userID);
              if (userData) {
                usersMap[booking.userID] = userData;
              }
            }
          })
        );

        setBookings(bookingsList);
        setUsers(usersMap);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getBookings();
  }, []);

  // Filter bookings
  const filteredBookings = bookings.filter((booking) => {
    const user = users[booking.userID];
    const displayName = user?.displayName || "";
    const matchesSearch =
      displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.facilityID?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || booking.status === filterType;

    return matchesSearch && matchesFilter;
  });

  const Statuses = ["all", ...new Set(bookings.map((booking) => booking.status))];
  const toggleFilterDropdown = () => {
    setIsFilterOpen(!isFilterOpen);
  };



  // Handle status change for a single booking
  const handleStatusChange = async (booking, newStatus) => {

    // Don't allow changing if already approved/declined
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
    try {
        const { success } = await UpdateBooking(booking.bookingID, newStatus);
    
        if (success) {
          toast.success(`${newStatus} booking successfully!`);
        } else {
          toast.error("Failed to update booking status.");
        }
      } catch (error) {
        toast.error("Error updating booking status.");
      } finally {
        setIsProcessing(false);
      }
};


  return (
    <main className="bookings-page">
      <header className="bookings-header">
        <h1 className="bookings-title">Bookings Review</h1>
        <p className="bookings-subtitle">Approve and Decline bookings!</p>
      </header>

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
              <th>Pending Approval</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? null : filteredBookings.length === 0 ? (
              <tr>
                <td colSpan="6" className="loading-cell">
                  <p>No bookings to review</p>
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking, index) => (
                <tr key={booking.bookingID || `booking-${index}`}>
                  <td>{users[booking.userID]?.displayName || booking.userID}</td>
                  <td>{booking.date}</td>
                  <td>{booking.facilityID}</td>
                  <td className="timeslot-cell">
                    {booking.bookedSlots.map((slot, i) => {
                    const startHour = slot;
                    const endHour = slot + 1;
                    const startTime = startHour > 12 ? ` ${startHour - 12}pm ` : ` ${startHour}am `;
                    const endTime = endHour > 12 ? ` ${endHour - 12}pm ` : ` ${endHour}am `;
                    return (
                    `${startTime}-${endTime}` + (i < booking.bookedSlots.length - 1 ? ',    ' : '')
                    );
                    })}
                </td>
                  <td className="actions-cell">
                    {/* Approve Button */}
                    {booking.status === "pending" && (
                      <button
                        className="approve-button"
                        onClick={() => handleStatusChange(booking, "approved")}
                        disabled={isProcessing}
                      >
                        Approve
                      </button>
                    )}

                    {/* Decline Button */}
                    {booking.status === "pending" && (
                      <button
                        className="decline-button"
                        onClick={() => handleStatusChange(booking, "declined")}
                        disabled={isProcessing}
                      >
                        Decline
                      </button>
                    )}

                    {/* After review */}
                    {booking.status === "declined" && (
                      <button
                        className="decline-button"
                      >{booking.status}
                        
                      </button>
                    )}

                    {/* After review */}
                    {booking.status === "approved" && (
                      <button
                        className="approve-button"
                      >{booking.status}
                        
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
};

export default BookingsPage;
