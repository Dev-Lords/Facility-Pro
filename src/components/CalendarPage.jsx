import React, { useState } from 'react';
import './CalendarPage.css';

const CalendarPage = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const unbookableDates = [
    "2025-04-01",
    "2025-04-05",
    "2025-04-18",
    "2025-05-12",
    "2025-05-25",
    "2025-04-02"
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const formatDate = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const handleDateClick = (day) => {
    const dateString = formatDate(currentYear, currentMonth, day);
    if (!unbookableDates.includes(dateString) && new Date(currentYear, currentMonth, day) >= today) {
      alert(`You selected ${dateString}`);
    }
  };

  const renderCalendar = () => {
    const calendar = [];
    let day = 1;

    for (let week = 0; week < 6; week++) {
      const days = [];

      for (let i = 0; i < 7; i++) {
        if (week === 0 && i < firstDay) {
          days.push(<td key={`empty-${i}`}></td>);
        } else if (day > daysInMonth) {
          break;
        } else {
          const dateString = formatDate(currentYear, currentMonth, day);
          const isBlocked = unbookableDates.includes(dateString);
          const isPast = new Date(currentYear, currentMonth, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const isToday = today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;

          let className = isBlocked ? 'blocked' : 'available';
          if (isPast) className += ' past';
          if (isToday) className += ' today';

          days.push(
            <td
              key={i}
              className={className}
              onClick={() => !isBlocked && !isPast && handleDateClick(day)}
            >
              {isBlocked||isPast ? '❌' : day}
              
            </td>
          );
          day++;
        }
      }

      calendar.push(<tr key={week}>{days}</tr>);
    }

    return calendar;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <section className="calendar-container">
      <div className="calendar-header">
        <h1>Facility Booking Calendar</h1>
        <p>Select a date to book your preferred facility</p>
      </div>

      <div className="month-nav">
        <button onClick={handlePrevMonth}>← Prev</button>
        <h2>{monthNames[currentMonth]} {currentYear}</h2>
        <button onClick={handleNextMonth}>Next →</button>
      </div>

      <table className="calendar-table">
        <thead>
          <tr>
            <th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th>
            <th>Thu</th><th>Fri</th><th>Sat</th>
          </tr>
        </thead>
        <tbody>{renderCalendar()}</tbody>
      </table>
    </section>
  );
};

export default CalendarPage;
