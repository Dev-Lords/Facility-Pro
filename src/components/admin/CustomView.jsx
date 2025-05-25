import React, { useEffect, useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer 
} from "recharts";
import { useNavigate } from "react-router-dom";
import { fetchBookings, fetchEvents, fetchIssues } from "../../../backend/services/ReportDataService";
import { exportToCSV, exportToPDF } from "../../../backend/services/ReportExportService";
import { 
  Calendar, ChevronDown, DownloadCloud, Filter, X,
  BarChart2, PieChart as PieChartIcon, LineChart as LineChartIcon,
  CheckSquare, Square, Home
} from "lucide-react";
import "./CustomView.css";
import { FaBars } from 'react-icons/fa';


const CustomView = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [issues, setIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bookings");
  const [exporting, setExporting] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [chartType, setChartType] = useState("bar");
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
  // Date filtering states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Advanced filtering states
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [statusFilters, setStatusFilters] = useState([]);
  const [facilityFilters, setFacilityFilters] = useState([]);
  const [priorityFilters, setPriorityFilters] = useState([]);
  
  // Export menu states
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [exportBookings, setExportBookings] = useState(true);
  const [exportEvents, setExportEvents] = useState(true);
  const [exportIssues, setExportIssues] = useState(true);

  // Available options for filters
  const [availableStatuses, setAvailableStatuses] = useState([]);
  const [availableFacilities, setAvailableFacilities] = useState([]);
  const [availablePriorities, setAvailablePriorities] = useState([]);

  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [bookingsData, eventsData, issuesData] = await Promise.all([
          fetchBookings(),
          fetchEvents(),
          fetchIssues()
        ]);
        
        setBookings(bookingsData);
        setEvents(eventsData);
        setIssues(issuesData);
        
        // Extract available filter options
        const statuses = new Set();
        const facilities = new Set();
        const priorities = new Set();
        
        bookingsData.forEach(booking => {
          if (booking.status) statuses.add(booking.status);
          if (booking.facilityID) facilities.add(booking.facilityID);
        });
        
        eventsData.forEach(event => {
          if (event.status) statuses.add(event.status);
          if (event.location) facilities.add(event.location);
        });
        
        issuesData.forEach(issue => {
          if (issue.status) statuses.add(issue.status);
          if (issue.facilityID) facilities.add(issue.facilityID);
          if (issue.priority) priorities.add(issue.priority);
        });
        
        setAvailableStatuses(Array.from(statuses));
        setAvailableFacilities(Array.from(facilities));
        setAvailablePriorities(Array.from(priorities));
        
      } catch (error) {
        console.error("Error loading report data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Prepare data for charts
  const getBookingChartData = () => {
    const statusCounts = {};
    filteredBookings.forEach(booking => {
      const status = booking.status || "Unknown";
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    return Object.keys(statusCounts).map(status => ({
      name: status,
      value: statusCounts[status]
    }));
  };

  const getEventChartData = () => {
    const monthlyCounts = {};
    filteredEvents.forEach(event => {
      if (event.date) {
        const month = new Date(event.date).toLocaleString('default', { month: 'short' });
        monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
      }
    });
    
    return Object.keys(monthlyCounts).map(month => ({
      name: month,
      value: monthlyCounts[month]
    }));
  };

  const getIssuesChartData = () => {
    const priorityCounts = {};
    filteredIssues.forEach(issue => {
      const priority = issue.priority || "Normal";
      priorityCounts[priority] = (priorityCounts[priority] || 0) + 1;
    });
    
    return Object.keys(priorityCounts).map(priority => ({
      name: priority,
      value: priorityCounts[priority]
    }));
  };

  const getChartData = () => {
    switch (activeTab) {
      case "bookings": return getBookingChartData();
      case "events": return getEventChartData();
      case "issues": return getIssuesChartData();
      default: return [];
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case "confirmed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  // Enhanced export function
  const handleExport = async (format) => {
    setExporting(true);
    try {
      // Only include selected data types
      const dataToExport = {};
      
      if (exportBookings) dataToExport.bookings = filteredBookings;
      if (exportEvents) dataToExport.events = filteredEvents;
      if (exportIssues) dataToExport.issues = filteredIssues;
      
      // Create descriptive filename based on selections
      const typesIncluded = [];
      if (exportBookings) typesIncluded.push('bookings');
      if (exportEvents) typesIncluded.push('events');
      if (exportIssues) typesIncluded.push('issues');
      
      const filename = typesIncluded.join('-');
      
      if (format === 'csv') {
        await exportToCSV(filename, dataToExport);
      } else if (format === 'pdf') {
        await exportToPDF(filename, dataToExport);
      }
    } catch (error) {
      console.error(`Error exporting to ${format}:`, error);
      alert(`Failed to export to ${format.toUpperCase()}. Please try again.`);
    } finally {
      setExporting(false);
      setIsExportMenuOpen(false);
    }
  };

  const filterDataByDate = (data) => {
    // If no date filters are set, return all data
    if (!startDate && !endDate) return data;
    
    return data.filter(item => {
      if (!item.date) return true;
      
      const itemDate = new Date(item.date);
      let includeItem = true;
      
      if (startDate) {
        const start = new Date(startDate);
        includeItem = includeItem && itemDate >= start;
      }
      
      if (endDate) {
        const end = new Date(endDate);
        // Set end date to end of day for inclusive filtering
        end.setHours(23, 59, 59, 999);
        includeItem = includeItem && itemDate <= end;
      }
      
      return includeItem;
    });
  };

  const filterByAdvancedCriteria = (data) => {
    return data.filter(item => {
      // Filter by status if statusFilters are set
      if (statusFilters.length > 0 && item.status) {
        if (!statusFilters.includes(item.status)) return false;
      }
      
      // Filter by facility/location
      if (facilityFilters.length > 0) {
        if (item.facilityID && !facilityFilters.includes(item.facilityID)) return false;
        if (item.location && !facilityFilters.includes(item.location)) return false;
      }
      
      // Filter by priority (for issues)
      if (priorityFilters.length > 0 && item.priority) {
        if (!priorityFilters.includes(item.priority)) return false;
      }
      
      return true;
    });
  };

  // Apply all filters in sequence
  const applyAllFilters = (data) => {
    const dateFiltered = filterDataByDate(data);
    return filterByAdvancedCriteria(dateFiltered);
  };

  // Filtered data
  const filteredBookings = applyAllFilters(bookings);
  const filteredEvents = applyAllFilters(events);
  const filteredIssues = applyAllFilters(issues);

  const getDateRangeText = () => {
    if (startDate && endDate) {
      return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    } else if (startDate) {
      return `From ${formatDate(startDate)}`;
    } else if (endDate) {
      return `Until ${formatDate(endDate)}`;
    }
    return "All Time";
  };

  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    if (startDate || endDate) count++; // Date filter
    if (statusFilters.length > 0) count++;
    if (facilityFilters.length > 0) count++;
    if (priorityFilters.length > 0) count++;
    return count;
  };

  // Breadcrumb Navigation
  const BreadcrumbNav = () => (
    <nav className="breadcrumb-nav">
      
      <button 
        onClick={() => handleNavigate('/admin-home')} 
        className="breadcrumb-link"
      >
        <Home size={16} className="home-icon" />
        <strong>Dashboard</strong>
      </button>
      <strong className="separator">/</strong>
      <button
        className="breadcrumb-link"
        onClick={() => handleNavigate('/reports')}>
      <strong className="current-page">Custom Reports</strong>
      </button>
            <strong className="separator">/</strong>
      <strong className="current-page">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</strong>
    </nav>
  );

  const renderDashboardSummary = () => {
    return (
      <>
        <BreadcrumbNav />
        <section className="summary-cards">
          <article className="summary-card summary-card-bookings">
            <section className="summary-card-content">
              <section>
                <p className="summary-card-label">Total Bookings</p>
                <h3 className="summary-card-value">{filteredBookings.length}</h3>
              </section>
              <figure className="summary-card-icon">
                <Calendar size={24} />
              </figure>
            </section>
            <footer className="summary-card-footer">
              <small className="summary-card-badge">
                {getDateRangeText()}
              </small>
            </footer>
          </article>
          
          <article className="summary-card summary-card-events">
            <section className="summary-card-content">
              <section>
                <p className="summary-card-label">Upcoming Events</p>
                <h3 className="summary-card-value">{filteredEvents.length}</h3>
              </section>
              <figure className="summary-card-icon">
                <Calendar size={24} />
              </figure>
            </section>
            <footer className="summary-card-footer">
              <small className="summary-card-badge">
                {getDateRangeText()}
              </small>
            </footer>
          </article>
          
          <article className="summary-card summary-card-issues">
            <section className="summary-card-content">
              <section>
                <p className="summary-card-label">Maintenance Issues</p>
                <h3 className="summary-card-value">{filteredIssues.length}</h3>
              </section>
              <figure className="summary-card-icon">
                <Calendar size={24} />
              </figure>
            </section>
            <footer className="summary-card-footer">
              <small className="summary-card-badge">
                {getDateRangeText()}
              </small>
            </footer>
          </article>
        </section>
      </>
    );
  };

  const renderChart = () => {
    const data = getChartData();

    switch (chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        );
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      case "line":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  const renderBookingsTable = () => (
    <figure className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Facility</th>
            <th>Status</th>
            <th>Slots</th>
          </tr>
        </thead>
        <tbody>
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking, index) => (
              <tr key={index} className="table-row">
                <td>{formatDate(booking.date)}</td>
                <td>{booking.facilityID || "-"}</td>
                <td>
                  <mark className={`status-badge ${getStatusColor(booking.status)}`}>
                    {booking.status || "Unknown"}
                  </mark>
                </td>
                <td>
                  {booking.bookedSlots?.join(", ") || "-"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="table-empty-message">No bookings found with current filters</td>
            </tr>
          )}
        </tbody>
      </table>
    </figure>
  );

  const renderEventsList = () => (
    <section className="events-grid">
      {filteredEvents.length > 0 ? (
        filteredEvents.map((event, index) => (
          <article key={index} className="event-card">
            <header className="event-card-header">
              <h3 className="event-title">{event.title || "Untitled Event"}</h3>
              <mark className={`status-badge ${getStatusColor(event.status)}`}>
                {event.status || "Unknown"}
              </mark>
            </header>
            <p className="event-date">{formatDate(event.date)}</p>
            <p className="event-location">{event.location || "No location specified"}</p>
            {event.description && <p className="event-description">{event.description}</p>}
            {event.attendees && (
              <footer className="event-attendees">
                <p>Attendees: {event.attendees.length}</p>
              </footer>
            )}
          </article>
        ))
      ) : (
        <p className="empty-message">No events found with current filters</p>
      )}
    </section>
  );

  const renderIssuesList = () => (
    <section className="issues-list">
      {filteredIssues.length > 0 ? (
        filteredIssues.map((issue, index) => (
          <article key={index} className={`issue-card priority-${issue.priority?.toLowerCase() || 'normal'}`}>
            <section className="issue-card-content">
              <header className="issue-card-header">
                <h3 className="issue-title">
                  {issue.title || `Issue #${issue.id || index + 1}`}
                </h3>
                <mark className={`priority-badge priority-${issue.priority?.toLowerCase() || 'normal'}`}>
                  {issue.priority || "Normal"}
                </mark>
              </header>
              <p className="issue-description">
              {issue.issueDescription || "No description provided"}
              </p>
              <footer className="issue-meta">
                <small>Reported: {issue.reportedAt ? formatDate(issue.reportedAt) : "-"}</small>
                <small>Status: {issue.issueStatus || "Open"}</small>
                {issue.location && <small>Location: {issue.location}</small>}
              </footer>
            </section>
          </article>
        ))
      ) : (
        <p className="empty-message">No maintenance issues found with current filters</p>
      )}
    </section>
  );

  // Custom Date Range Picker component
  const DateRangePicker = () => {
    const clearFilters = () => {
      setStartDate("");
      setEndDate("");
      setIsDatePickerOpen(false);
    };
    
    const applyFilters = () => {
      setIsDatePickerOpen(false);
    };
    
    return (
      <section className="dropdown date-picker-dropdown">
        <button
          type="button"
          className="dropdown-toggle"
          onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
        >
          <Calendar size={16} className="dropdown-icon" />
          {getDateRangeText()}
          <ChevronDown size={16} className="dropdown-icon" />
        </button>

        {isDatePickerOpen && (
          <menu className="dropdown-menu date-picker-menu">
            <section className="dropdown-content date-picker-content">
              <label>
                Start Date:
                <input
                  type="date"
                  id="start-date"
                  className="date-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </label>
              
              <label>
                End Date:
                <input
                  type="date"
                  id="end-date"
                  className="date-input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </label>
              
              <menu className="date-picker-actions">
                <li><button onClick={clearFilters} className="date-picker-btn clear-btn">
                  Clear
                </button></li>
                <li><button onClick={applyFilters} className="date-picker-btn apply-btn">
                  Apply
                </button></li>
              </menu>
            </section>
          </menu>
        )}
      </section>
    );
  };

  // Advanced Filter Menu component
  const AdvancedFilterMenu = () => {
    const [tempStatusFilters, setTempStatusFilters] = useState([...statusFilters]);
    const [tempFacilityFilters, setTempFacilityFilters] = useState([...facilityFilters]);
    const [tempPriorityFilters, setTempPriorityFilters] = useState([...priorityFilters]);
    
    const applyFilters = () => {
      setStatusFilters(tempStatusFilters);
      setFacilityFilters(tempFacilityFilters);
      setPriorityFilters(tempPriorityFilters);
      setIsFilterMenuOpen(false);
    };
    
    const clearAllFilters = () => {
      setTempStatusFilters([]);
      setTempFacilityFilters([]);
      setTempPriorityFilters([]);
    };
    
    const toggleFilter = (filter, value) => {
      switch (filter) {
        case 'status':
          setTempStatusFilters(prev => 
            prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
          );
          break;
        case 'facility':
          setTempFacilityFilters(prev => 
            prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
          );
          break;
        case 'priority':
          setTempPriorityFilters(prev => 
            prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
          );
          break;
        default:
          break;
      }
    };
    
    return (
      <section className="dropdown filter-dropdown">
        <button
          type="button"
          className={`dropdown-toggle ${getActiveFilterCount() > 0 ? 'active-filters' : ''}`}
          onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
        >
          <Filter size={16} className="dropdown-icon" />
          Filters
          {getActiveFilterCount() > 0 && (
            <sup className="filter-badge">{getActiveFilterCount()}</sup>
          )}
          <ChevronDown size={16} className="dropdown-icon" />
        </button>

        {isFilterMenuOpen && (
          <menu className="dropdown-menu filter-menu">
            <section className="dropdown-content filter-content">
              <h3 className="filter-section-title">Filter by Status</h3>
              <menu className="filter-options">
                {availableStatuses.map((status) => (
                  <li key={status} className="filter-option">
                    <input
                      type="checkbox"
                      id={`status-${status}`}
                      checked={tempStatusFilters.includes(status)}
                      onChange={() => toggleFilter('status', status)}
                    />
                    <label htmlFor={`status-${status}`}>{status}</label>
                  </li>
                ))}
              </menu>
              
              <h3 className="filter-section-title">Filter by Facility</h3>
              <menu className="filter-options">
                {availableFacilities.map((facility) => (
                  <li key={facility} className="filter-option">
                    <input
                      type="checkbox"
                      id={`facility-${facility}`}
                      checked={tempFacilityFilters.includes(facility)}
                      onChange={() => toggleFilter('facility', facility)}
                    />
                    <label htmlFor={`facility-${facility}`}>{facility}</label>
                  </li>
                ))}
              </menu>
              
              {availablePriorities.length > 0 && (
                <>
                  <h3 className="filter-section-title">Filter by Priority</h3>
                  <menu className="filter-options">
                    {availablePriorities.map((priority) => (
                      <li key={priority} className="filter-option">
                        <input
                          type="checkbox"
                          id={`priority-${priority}`}
                          checked={tempPriorityFilters.includes(priority)}
                          onChange={() => toggleFilter('priority', priority)}
                        />
                        <label htmlFor={`priority-${priority}`}>{priority}</label>
                      </li>
                    ))}
                  </menu>
                </>
              )}
              
              <menu className="filter-actions">
                <li><button onClick={clearAllFilters} className="filter-btn clear-btn">
                  Clear All
                </button></li>
                <li><button onClick={applyFilters} className="filter-btn apply-btn">
                  Apply Filters
                </button></li>
              </menu>
            </section>
          </menu>
        )}
      </section>
    );
  };

  // Chart type selector
  const ChartTypeSelector = () => {
    const [isOpen, setIsOpen] = useState(false);
    
    const chartOptions = [
      { value: "bar", label: "Bar Chart", icon: <BarChart2 size={16} /> },
      { value: "pie", label: "Pie Chart", icon: <PieChartIcon size={16} /> },
      { value: "line", label: "Line Chart", icon: <LineChartIcon size={16} /> }
    ];
    
    const currentOption = chartOptions.find(option => option.value === chartType);
    
    return (
      <section className="dropdown">
        <button
          type="button"
          className="dropdown-toggle"
          onClick={() => setIsOpen(!isOpen)}
        >
          {currentOption?.icon}
          {currentOption?.label || "Chart Type"}
          <ChevronDown size={16} className="dropdown-icon" />
        </button>

        {isOpen && (
          <menu className="dropdown-menu">
            <section className="dropdown-content">
              {chartOptions.map((option) => (
                <li key={option.value}>
                  <button
                    onClick={() => {
                      setChartType(option.value);
                      setIsOpen(false);
                    }}
                    className={`dropdown-item ${chartType === option.value ? 'active' : ''}`}
                  >
                    {option.icon}
                    {option.label}
                  </button>
                </li>
              ))}
            </section>
          </menu>
        )}
      </section>
    );
  };

  // Enhanced Export menu component
  const ExportMenu = () => {
    const toggleExportItem = (item) => {
      switch (item) {
        case 'bookings':
          setExportBookings(!exportBookings);
          break;
        case 'events':
          setExportEvents(!exportEvents);
          break;
        case 'issues':
          setExportIssues(!exportIssues);
          break;
        default:
          break;
      }
    };
    
    const isExportSelectionValid = exportBookings || exportEvents || exportIssues;
    
    return (
      <section className="dropdown">
        <button
          type="button"
          className="dropdown-toggle"
          onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
          disabled={exporting}
        >
          {exporting ? (
            <>
              <progress className="spinner"></progress>
              Exporting...
            </>
          ) : (
            <>
              <DownloadCloud size={16} className="dropdown-icon" />
              Export Data
              <ChevronDown size={16} className="dropdown-icon" />
            </>
          )}
        </button>

        {isExportMenuOpen && (
          <menu className="dropdown-menu export-menu">
            <section className="dropdown-content export-content">
              <h3 className="export-title">Select data to export</h3>
              
              <menu className="export-options">
                <li className="export-option">
                  <button 
                    className="checkbox-btn"
                    onClick={() => toggleExportItem('bookings')}
                  >
                    {exportBookings ? <CheckSquare size={18} /> : <Square size={18} />}
                  </button>
                  Bookings ({filteredBookings.length})
                </li>
                
                <li className="export-option">
                  <button 
                    className="checkbox-btn"
                    onClick={() => toggleExportItem('events')}
                  >
                    {exportEvents ? <CheckSquare size={18} /> : <Square size={18} />}
                  </button>
                  Events ({filteredEvents.length})
                </li>
                
                <li className="export-option">
                  <button 
                    className="checkbox-btn"
                    onClick={() => toggleExportItem('issues')}
                  >
                    {exportIssues ? <CheckSquare size={18} /> : <Square size={18} />}
                  </button>
                  Issues ({filteredIssues.length})
                </li>
              </menu>
              
              <menu className="export-format-options">
                <li>
                  <button
                    onClick={() => isExportSelectionValid && handleExport('csv')}
                    className={`export-btn ${!isExportSelectionValid ? 'disabled' : ''}`}
                    disabled={!isExportSelectionValid}
                  >
                    Export as CSV
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => isExportSelectionValid && handleExport('pdf')}
                    className={`export-btn ${!isExportSelectionValid ? 'disabled' : ''}`}
                    disabled={!isExportSelectionValid}
                  >
                    Export as PDF
                  </button>
                </li>
              </menu>
            </section>
          </menu>
        )}
      </section>
    );
  };

  // Active filter indicators
  const ActiveFilterIndicators = () => {
    if (getActiveFilterCount() === 0) return null;
    
    return (
      <menu className="active-filters-indicators">
        {(startDate || endDate) && (
          <li className="filter-indicator">
            <small>Date: {getDateRangeText()}</small>
            <button 
              className="clear-filter-btn"
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
            >
              <X size={14} />
            </button>
          </li>
        )}
        
        {statusFilters.length > 0 && (
          <li className="filter-indicator">
            <small>Status: {statusFilters.join(', ')}</small>
            <button 
              className="clear-filter-btn"
              onClick={() => setStatusFilters([])}
            >
              <X size={14} />
            </button>
          </li>
        )}
        
        {facilityFilters.length > 0 && (
          <li className="filter-indicator">
            <small>Facility: {facilityFilters.join(', ')}</small>
            <button 
              className="clear-filter-btn"
              onClick={() => setFacilityFilters([])}
            >
              <X size={14} />
            </button>
          </li>
        )}
        
        {priorityFilters.length > 0 && (
          <li className="filter-indicator">
            <small>Priority: {priorityFilters.join(', ')}</small>
            <button 
              className="clear-filter-btn"
              onClick={() => setPriorityFilters([])}
            >
              <X size={14} />
            </button>
          </li>
        )}
      </menu>
    );
  };

  // View toggle buttons
  const ViewToggle = () => (
    <menu className="view-toggle">
      <li>
        <button
          type="button"
          onClick={() => setViewMode("list")}
          className={`view-toggle-btn ${viewMode === "list" ? 'active' : ''}`}
        >
          List View
        </button>
      </li>
      <li>
        <button
          type="button"
          onClick={() => setViewMode("chart")}
          className={`view-toggle-btn ${viewMode === "chart" ? 'active' : ''}`}
        >
          Chart View
        </button>
      </li>
    </menu>
  );

  return (
    <main className="dashboard">
      <article className="dashboard-container">
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
          <h1 className=" user-management-title" >Custom Reports</h1>

          <p className=" user-management-subtitle">Tailor your insights—analyze facility data your way with powerful visual tools</p>
        </header>

        {renderDashboardSummary()}
        
        {getActiveFilterCount() > 0 && <ActiveFilterIndicators />}

        <section className="dashboard-controls">
          <menu className="tab-navigation">
            <li>
              <button
                onClick={() => setActiveTab("bookings")}
                className={`tab-btn ${activeTab === "bookings" ? 'active' : ''}`}
              >
                Bookings
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("events")}
                className={`tab-btn ${activeTab === "events" ? 'active' : ''}`}
              >
                Events
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("issues")}
                className={`tab-btn ${activeTab === "issues" ? 'active' : ''}`}
              >
                Issues
              </button>
            </li>
          </menu>
          
          <menu className="action-buttons">
            <li><ViewToggle /></li>
            {viewMode === "chart" && <li><ChartTypeSelector /></li>}
            <li><DateRangePicker /></li>
            <li><AdvancedFilterMenu /></li>
            <li><ExportMenu /></li>
          </menu>
        </section>

        {isLoading ? (
          <section className="loading-container">
            <progress className="loading-spinner"></progress>
            <p>Loading data...</p>
          </section>
        ) : (
          <article className="content-container">
            {viewMode === "chart" ? (
              <figure className="chart-container">
                <h2 className="section-title">
                  {activeTab === "bookings" && "Booking Status Distribution"}
                  {activeTab === "events" && "Events by Month"}
                  {activeTab === "issues" && "Issues by Priority"}
                </h2>
                {renderChart()}
              </figure>
            ) : (
              <>
                {activeTab === "bookings" && (
                  <section className="section">
                    <h2 className="section-title">Facility Bookings</h2>
                    {renderBookingsTable()}
                  </section>
                )}

                {activeTab === "events" && (
                  <section className="section">
                    <h2 className="section-title">Upcoming Events</h2>
                    {renderEventsList()}
                  </section>
                )}

                {activeTab === "issues" && (
                  <section className="section">
                    <h2 className="section-title">Maintenance Issues</h2>
                    {renderIssuesList()}
                  </section>
                )}
              </>
            )}
          </article>
        )}
      </article>
    </main>
  );
};

export default CustomView;