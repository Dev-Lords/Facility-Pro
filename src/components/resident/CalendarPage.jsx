import React, { useState, useEffect } from 'react';
import './CalendarPage.css';
import { fetchAvailableNumericSlots ,createBooking,validBooking} from "./../../../backend/services/bookingService";
import { useNavigate } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';


const convertToTimeSlots = (hours) => {
  const convertToTimeSlot = (hour) => {
    const startHour = hour;
    const endHour = hour + 1;

    const formatTime = (hour) => {
      let period = hour >= 12 ? "PM" : "AM";
      let displayHour = hour % 12;
      if (displayHour === 0) displayHour = 12;
      return `${displayHour}${period}`;
    };

    return `${formatTime(startHour)} - ${formatTime(endHour)}`;
  };
  return hours.map(convertToTimeSlot);
};
const convertToNumericHours = (slots) => {
  const parseTime = (timeStr) => {
    const match = timeStr.match(/^(\d+)(AM|PM)$/);
    if (!match) return null;

    let hour = parseInt(match[1], 10);
    const period = match[2];

    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;

    return hour;
  };

  return slots.map(slot => {
    const [startTime] = slot.split(" - ");
    return parseTime(startTime);
  });
};


const CalendarPage = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);

  const [popupVisible, setPopupVisible] = useState(false);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [bookingSubmittedVisible, setBookingSubmittedVisible] = useState(false);


  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedSlots, setSelectedSlots] = useState([]);
  const [finalizedSlots, setFinalizedSlots] = useState([]);
  const [bookingError, setBookingError] = useState("");
  const [submitError, setSubmitError] = useState("");


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

  const unbookableDates = [];

  useEffect(() => {
    if (!selectedDate) return;
    setLoading(true);
    (async () => {
      try {
        const slots = await fetchAvailableNumericSlots(sessionStorage.getItem("facility"), selectedDate);
        const wordSlots = convertToTimeSlots(slots);
        setAvailableSlots(wordSlots);
      } catch (error) {
        console.error("Error fetching available slots:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedDate]);

  useEffect(() => {
    setSelectedSlots([]);
   
  }, [selectedDate]);
  useEffect(() => {
    const savedDate = sessionStorage.getItem('selectedDate');
    const showPopup = sessionStorage.getItem('showPopup') === 'true';
  
    if (savedDate) {
      setSelectedDate(savedDate);
      if (showPopup) {
        setPopupVisible(true);
      }
    }
  }, []);
  



  const toggleSlot = (slot) => {
    if (selectedSlots.includes(slot)) {
      setSelectedSlots(selectedSlots.filter((s) => s !== slot));
    } else if (selectedSlots.length < 3) {
      setSelectedSlots([...selectedSlots, slot]);
    }
  };

  const handleSubmit = () => {
    if (selectedSlots.length === 0) {
      setSubmitError("Please select at least one slot before submitting.");
      return;
    }
    setFinalizedSlots(selectedSlots);
    setPopupVisible(false);
    sessionStorage.setItem('showPopup', 'false');
    setConfirmationVisible(true);
    setSelectedSlots([]);
  };
  const handleConfirm = async () => {
    //setConfirmationVisible(false);
    try {
      const validity = await validBooking(sessionStorage.getItem("facility"), selectedDate, finalizedSlots,localStorage.getItem("userID"));
  
      if (validity === "booking limit exceeded") {
        setBookingError("You can only book up to 3 slots per facility per day.");
        setConfirmationVisible(true);
        return;
      }
    
      if (validity === "error creating booking") {
        setBookingError("There was a problem in making your booking please try again.");
        setConfirmationVisible(true);
        return;
      }
      setConfirmationVisible(false);
      const chosenSlots = convertToNumericHours(finalizedSlots);
      await createBooking(sessionStorage.getItem("facility"),selectedDate,chosenSlots,localStorage.getItem("userID"));
      const updatedSlots = await fetchAvailableNumericSlots(sessionStorage.getItem("facility"), selectedDate);
      setAvailableSlots(convertToTimeSlots(updatedSlots));
      setBookingSubmittedVisible(true); 
      setTimeout(() => setBookingSubmittedVisible(false), 5000); 
      console.log("Booking successful!");
    } catch (error) {
      console.error("Error creating booking:", error);
      
    }
  };
  
  const formatDate = (input) => {
    const date = input instanceof Date ? input : new Date(input);
    if (isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateClick = (dateString) => {
    setBookingError("");
    setSelectedDate(dateString);
    setPopupVisible(true);
    sessionStorage.setItem('showPopup', 'true');
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const renderCalendar = () => {
    const weeks = [];
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    let dayCounter = 1;

    for (let week = 0; week < 6; week++) {
      const days = [];
      for (let i = 0; i < 7; i++) {
        if (week === 0 && i < firstDay) {
          days.push(<td key={`empty-${week}-${i}`} />);
        } else if (dayCounter > daysInMonth) {
          days.push(<td key={`empty-end-${week}-${i}`} />);
        } else {
          const dateObj = new Date(currentYear, currentMonth, dayCounter);
          dateObj.setHours(0, 0, 0, 0);
          const dateString = formatDate(dateObj);
          const isBlocked = unbookableDates.includes(dateString);
          const isPast = dateObj < today;
          const isToday = today.getTime() === dateObj.getTime();

          days.push(
            <td key={dateString} className={isBlocked ? 'blocked' : isPast ? 'past' : isToday ? 'today' : 'available'}>
              <button
                disabled={isBlocked || isPast}
                onClick={() => handleDateClick(dateString)}
              >
                {isBlocked || isPast ? '❌' : dayCounter}
              </button>
            </td>
          );
          dayCounter++;
        }
      }
      weeks.push(<tr key={week}>{days}</tr>);
    }
    return weeks;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <article className={`calendar-container ${(popupVisible || confirmationVisible)||bookingSubmittedVisible ? 'blurred' : ''}`}>
      <header className="user-management-header">
          <section className="hamburger-menu">
                    <FaBars className="hamburger-icon" onClick={toggleMenu} />
                    {menuOpen && (
                      <nav className="dropdown-menu">
                        <button onClick={() => handleNavigate('/')}>Home</button>
                        <button onClick={handleSignOut}>Sign Out</button>
                      </nav>
                    )}
                  </section>
        <h1 className=" user-management-title">Facility Booking Calendar</h1>
        <p className=" user-management-subtitle">Select a date to book your preferred facility</p>
      </header>

         {/* Breadcrumb */}
      <nav className="breadcrumb-nav">
        <button 
          onClick={() => handleNavigate('/resident-home')} 
          className="breadcrumb-link"
        >
          <span className="home-icon">🏠</span> Dashboard
        </button>
        <span className="separator">/</span>
        
        <span className="current-page"></span> Book slots
      </nav>

      <nav className="month-nav">
        <button onClick={handlePrevMonth}>← Prev</button>
        <h2>{monthNames[currentMonth]} {currentYear}</h2>
        <button onClick={handleNextMonth}>Next →</button>
      </nav>

      <table className="calendar-table">
        <thead>
          <tr>
            <th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th>
            <th>Thu</th><th>Fri</th><th>Sat</th>
          </tr>
        </thead>
        <tbody>{renderCalendar()}</tbody>
      </table>

      {popupVisible && (
        <section className="popup">
          
          <h2>Available Slots for {selectedDate}</h2>
          {loading ? (
            <p>Loading slots...</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {availableSlots.length > 0 ? (
                availableSlots.map((slot, index) => (
                  <li
                    key={index}
                    onClick={() => toggleSlot(slot)}
                    style={{
                      padding: "10px",
                      margin: "5px 0",
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                      cursor: selectedSlots.length === 3 && !selectedSlots.includes(slot) ? "not-allowed" : "pointer",
                      backgroundColor: selectedSlots.includes(slot) ? "#cce5ff" : "#fff",
                      opacity: selectedSlots.length === 3 && !selectedSlots.includes(slot) ? 0.2 : 1,
                    }}
                  >
                    {slot}
                  </li>
                ))
              ) : (
                <p>No slots available.</p>
              )}
            </ul>
          )}
          {submitError && (
  <p style={{ color: "red", marginTop: "1rem" }}>{submitError}</p>
)}           <section>
        <section className="popupButton">
          <button onClick={() => setPopupVisible(false)}>Close</button>
          <button  onClick={handleSubmit}
          >Submit</button>
          </section>
          </section>
        </section>
      )}

      {confirmationVisible && (
        <section className="popup2">
          <h2>Confirm booking</h2>
          <p>You have selected the following slots for the date: {selectedDate}:</p>
          <ul>
            {finalizedSlots.map((slot, index) => (
              <li key={index}>{slot}</li>
            ))}
          </ul>
          {bookingError && (
              <p style={{ color: "red", marginTop: "-0.5rem" }}>{bookingError}</p>)}
                 <section className="popupButton">
                  <button  onClick={() => {
                    setConfirmationVisible(false)
                  }}>Close</button>
                  <button onClick={() =>{ 
                    handleConfirm()}}>Confirm</button>
          </section>
        </section>
      )}
      {bookingSubmittedVisible && (
        <section className="popup2">
          <h2>Booking Submitted</h2>
          <p>Your booking has been submitted successfully.</p>
          <p>We'll review it and send confirmation via email.</p>
          <button onClick={() => {
            setBookingSubmittedVisible(false);
          }}>Close</button>
        </section>
      )}

    </article>
  );
};

export default CalendarPage;
