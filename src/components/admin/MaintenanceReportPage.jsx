import React, { useEffect, useState, useRef } from "react";
import { fetchFilteredIssues, getStats, resolveStatus, exportToCsv } from "../../../backend/services/MaintenanceReportService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from "react-router-dom";
// Updated Chart.js imports - add necessary components
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  BarController // Add BarController
} from "chart.js";
import "./MaintenanceReport.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController, // Register BarController
  Title,
  Tooltip,
  Legend
);

const MaintenanceReportPage = () => {
  const [allIssues, setAllIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [facilityFilter, setFacilityFilter] = useState("all");
  const [showGraphs, setShowGraphs] = useState(false);

  const statusChartRef = useRef(null);
  const priorityChartRef = useRef(null);
  const chartInstances = useRef({});

  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchFilteredIssues("all", "all", "all");
      setAllIssues(data);
      setFilteredIssues(data);
    };
    loadData();
  }, []);

  const applyFilters = async () => {
    const data = await fetchFilteredIssues(statusFilter, facilityFilter, priorityFilter);
    setFilteredIssues(data);
    setShowGraphs(false);
  };

  const getPriorityCounts = (issues) => {
    return {
      High: issues.filter(issue => issue.priority?.toLowerCase() === "high").length,
      Medium: issues.filter(issue => issue.priority?.toLowerCase() === "medium").length,
      Low: issues.filter(issue => issue.priority?.toLowerCase() === "low").length
    };
  };

  const calculateFacilityAvailability = (issues) => {
    const facilities = ["Gym", "Pool", "Soccer Field", "Basketball Court"];
    return facilities.map(facility => {
      const hasOpenIssues = issues.some(issue =>
        issue.relatedFacility === facility &&
        resolveStatus(issue.issueStatus) === "Open"
      );
      return {
        facility,
        availability: hasOpenIssues ? 0 : 100,
        status: hasOpenIssues ? "Unavailable" : "Available"
      };
    });
  };

  useEffect(() => {
    if (!showGraphs || filteredIssues.length === 0) return;

    const cleanupCharts = () => {
      Object.values(chartInstances.current).forEach(chart => chart?.destroy());
    };
    cleanupCharts();

    const createBarChart = (ref, title, labels, data, colors) => {
      if (!ref.current) return null;
      
      const ctx = ref.current.getContext("2d");
      return new ChartJS(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [{
            label: title,
            data,
            backgroundColor: colors,
            borderColor: colors.map(c => c.replace('0.6', '1')),
            borderWidth: 1,
            borderRadius: 4,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: title,
              font: { size: 16, weight: "bold" }
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  return `${context.raw}`;
                }
              }
            }
          },
          scales: {
            y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.05)" } },
            x: { grid: { display: false } }
          }
        }
      });
    };

    const { open, closed } = getStats(filteredIssues);
    const priorityCounts = getPriorityCounts(filteredIssues);

    chartInstances.current.status = createBarChart(
      statusChartRef,
      "Issue Status",
      ["Open", "Closed"],
      [open, closed],
      ["#63b3ed", "#3182ce"]
    );

    chartInstances.current.priority = createBarChart(
      priorityChartRef,
      "Issues by Priority",
      ["High", "Medium", "Low"],
      [priorityCounts.High, priorityCounts.Medium, priorityCounts.Low],
      ["#3182ce", "#63b3ed", "#90cdf4"]
    );

    return cleanupCharts;
  }, [filteredIssues, showGraphs]);

  const handleExportCSV = () => {
    exportToCsv(filteredIssues, "maintenance_report.csv");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Maintenance Report", 14, 20);

    const { open, closed, priorityCounts } = getStats(filteredIssues);

    const summaryLines = [
      `Total Issues: ${filteredIssues.length}`,
      `Open: ${open}   Closed: ${closed}`,
      `High: ${priorityCounts.High}   Medium: ${priorityCounts.Medium}   Low: ${priorityCounts.Low}`
    ];

    summaryLines.forEach((line, index) => {
      doc.setFontSize(12);
      doc.text(line, 14, 30 + index * 8);
    });

    const headers = [["Title", "Status", "Priority", "Facility", "Location", "Reported"]];
    const rows = filteredIssues.map(issue => [
      issue.issueTitle,
      resolveStatus(issue.issueStatus),
      issue.priority || "Unspecified",
      issue.relatedFacility || "N/A",
      issue.location || "N/A",
      issue.reportedAt ? new Date(issue.reportedAt).toLocaleDateString() : "N/A"
    ]);

    autoTable(doc, {
      startY: 60,
      head: headers,
      body: rows,
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [49, 130, 206],
        textColor: 255,
        fontStyle: 'bold',
      },
    });

    doc.save("maintenance_report.pdf");
  };

  const { open, closed } = getStats(filteredIssues);
  const priorityCounts = getPriorityCounts(filteredIssues);
  const facilityAvailability = calculateFacilityAvailability(filteredIssues);

  return (
    <main className="issues-page" id="report-section">
      <header className="usageTrends-header">
        <h2>Maintenance Report Dashboard</h2>
      </header>

        {/* Breadcrumb */}
      <nav className="breadcrumb-nav">
        <button 
          onClick={() => handleNavigate('/admin-home')} 
          className="breadcrumb-link"
        >
          <span className="home-icon">🏠</span> Dashboard
        </button>
        <span className="separator">/</span>
        <button
        className='breadcrumb-link'
          onClick={() => handleNavigate('/Reports')}>
        <span className="current-page"></span> Reports
        </button>
      </nav>

      <section className="summary-stats-horizontal">
        <article className="summary-card-sm"><h3>Total Issues</h3><p>{filteredIssues.length}</p></article>
        <article className="summary-card-sm"><h3>Open</h3><p>{open}</p></article>
        <article className="summary-card-sm"><h3>Closed</h3><p>{closed}</p></article>
        <article className="summary-card-sm"><h3>High Priority</h3><p>{priorityCounts.High}</p></article>
        <article className="summary-card-sm"><h3>Medium Priority</h3><p>{priorityCounts.Medium}</p></article>
        <article className="summary-card-sm"><h3>Low Priority</h3><p>{priorityCounts.Low}</p></article>
      </section>

      <section className="facility-availability">
        <h3>Facility Availability</h3>
        <section className="facility-cards">
          {facilityAvailability.map((facility) => (
            <article 
              key={facility.facility} 
              className={`facility-card ${facility.status.toLowerCase()}`}
            >
              <h4>{facility.facility}</h4>
              <p className="percentage">{facility.availability}%</p>
              <p className="status">{facility.status}</p>
            </article>
          ))}
        </section>
      </section>

      <section className="filter-section">
        <label>
          Status:
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </label>
        <label>
          Priority:
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </label>
        <label>
          Facility:
          <select value={facilityFilter} onChange={(e) => setFacilityFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="Soccer Field">Soccer Field</option>
            <option value="Gym">Gym</option>
            <option value="Pool">Pool</option>
            <option value="Basketball Court">Basketball Court</option>
          </select>
        </label>
        <button className="apply-btn" onClick={applyFilters}>Apply Filters</button>
        <button 
          className="graph-btn" 
          onClick={() => setShowGraphs(!showGraphs)}
          disabled={filteredIssues.length === 0}
        >
          {showGraphs ? "Hide Graphs" : "Show Graphs"}
        </button>
      </section>

      <section className="table-section">
        <p className="results-count">
          Showing {filteredIssues.length} issue{filteredIssues.length !== 1 ? "s" : ""}
        </p>
        <table className="log-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Facility</th>
              <th>Location</th>
              <th>Reported</th>
            </tr>
          </thead>
          <tbody>
            {filteredIssues.map((issue) => (
              <tr key={issue.issueID} className="log-table-row">
                <td>{issue.issueTitle}</td>
                <td><mark className={`status-badge status-${issue.issueStatus}`}>{resolveStatus(issue.issueStatus)}</mark></td>
                <td><mark className={`priority-badge priority-${issue.priority}`}>{issue.priority}</mark></td>
                <td>{issue.relatedFacility}</td>
                <td>{issue.location}</td>
                <td>{new Date(issue.reportedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="Buttons">
        <button className="export-btn csv-btn" onClick={handleExportCSV}>Download as CSV</button>
        <button className="export-btn pdf-btn" onClick={handleExportPDF}>Download as PDF</button>
      </section>

      {showGraphs && (
        <section className="graphs-section">
          <h2>Maintenance Analytics</h2>
          <section className="bar-charts">
            <figure className="chart-wrapper">
              <canvas ref={statusChartRef}></canvas>
            </figure>
            <figure className="chart-wrapper">
              <canvas ref={priorityChartRef}></canvas>
            </figure>
          </section>
        </section>
      )}
    </main>
  );
};

export default MaintenanceReportPage;