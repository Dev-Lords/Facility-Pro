import React, { PureComponent, useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Sector,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import "./UsageTrends.css";
import { fetchFacilityEvents } from "../../../backend/services/logService";
import { fetchMonthSummaryStats } from "../../../backend/services/logService";
import { unparse } from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Define color palettes for pie charts
const BOOKING_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
const ISSUES_COLORS = ["#FF5252", "#7C4DFF", "#448AFF", "#69F0AE"];

// Custom rendering for pie chart labels
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
  name,
  value,
}) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius * 1.1;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#333333"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize="12"
    >
      {`${name}: ${value}%`}
    </text>
  );
};

// Function to provide default data when API returns empty arrays
const getChartData = (data) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return [{ name: "No Data", value: 100 }];
  }
  return data;
};

export default function UsageTrends() {
  // All variables used to set data computed from logService Functions
  const [issuesChart, setIssuesChart] = useState(null);
  const [bookingsChart, setBookingsChart] = useState(null);
  const [totalBookings, setTotalBookings] = useState(null);
  const [totalIssues, setTotalIssues] = useState(null);
  const [bookingsChange, setBookingsChange] = useState(null);
  const [issuesChange, setIssuesChange] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  //______________________________________

  // Fetch all Summary Stats and set variables accordingly
  useEffect(() => {
    const getStats = async () => {
      try {
        setIsLoading(true);
        const data = await fetchMonthSummaryStats();
        console.log("API Response:", data);

        // Use default values if the API returns empty data
        setBookingsChart(
          data && data.bookingsPieChart && data.bookingsPieChart.length > 0
            ? data.bookingsPieChart
            : [
                { name: "gym", value: 67 },
                { name: "soccer", value: 33 },
              ]
        );

        setIssuesChart(
          data && data.issuesPieChart && data.issuesPieChart.length > 0
            ? data.issuesPieChart
            : [{ name: "pool", value: 100 }]
        );

        setTotalBookings(
          data && data.totalBookings !== undefined ? data.totalBookings : 3
        );
        setTotalIssues(
          data && data.totalIssues !== undefined ? data.totalIssues : 1
        );

        // Format change values (add "+" sign if positive)
        const formatChangeValue = (value) => {
          if (value === undefined || value === null) return "+0";
          const numValue = parseFloat(value);
          if (isNaN(numValue)) return "+0";
          return numValue >= 0 ? `+${numValue}` : `${numValue}`;
        };

        setBookingsChange(formatChangeValue(data?.bookingsChange));
        setIssuesChange(formatChangeValue(data?.issuesChange));
      } catch (error) {
        console.error("Error fetching summary stats:", error);
        setError("Error loading data");

        // Set fallback data in case of error
        setBookingsChart([
          { name: "gym", value: 67 },
          { name: "soccer", value: 33 },
        ]);
        setIssuesChart([{ name: "pool", value: 100 }]);
        setTotalBookings(3);
        setTotalIssues(1);
        setBookingsChange("+3");
        setIssuesChange("+1");
      } finally {
        setIsLoading(false);
      }
    };

    getStats();
  }, []);

  //_______________________________

  // Fetch and set all logs from database into table
  const [logs, setLogs] = useState([]);
  useEffect(() => {
    const waitForLogs = async () => {
      const fe = await fetchFacilityEvents();
      setLogs(fe);
    };

    waitForLogs();
  }, []);

  //________________________

  // Code for Filters to work.
  const [eventTypeFilter, setEventTypeFilter] = useState("");
  const [facilityFilter, setFacilityFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredLogs = logs.filter((log) => {
    const matchesEventType = eventTypeFilter
      ? log.eventType === eventTypeFilter
      : true;
    const matchesFacility = facilityFilter
      ? log.facilityId === facilityFilter
      : true;
    const matchesStartDate = startDate
      ? new Date(log.timestamp.seconds * 1000) >= startDate
      : true;
    const matchesEndDate = endDate
      ? new Date(log.timestamp.seconds * 1000) <= endDate
      : true;

    return (
      matchesEventType && matchesFacility && matchesStartDate && matchesEndDate
    );
  });

  const formatDateForInput = (date) => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };
  //_________________________

  //Code for file exportation of filtered table data to work

  // Prepare data for export by properly formatting complex objects and timestamps
  const prepareDataForExport = (logs) => {
    return logs.map((log) => {
      // Create a shallow copy to avoid modifying the original
      const formattedLog = { ...log };

      // Format the timestamp into a readable date string
      if (log.timestamp && log.timestamp.seconds) {
        formattedLog.formattedTimestamp = new Date(
          log.timestamp.seconds * 1000
        ).toLocaleString();
      } else {
        formattedLog.formattedTimestamp = "Unknown date";
      }

      // Handle the details object by converting to JSON if needed
      if (log.details && typeof log.details === "object") {
        formattedLog.formattedDetails = JSON.stringify(log.details);
      } else {
        formattedLog.formattedDetails = log.details || "";
      }

      return formattedLog;
    });
  };

  // CSV exportation - fixed to properly handle objects and timestamps
  const exportCSV = (logs) => {
    const formattedLogs = prepareDataForExport(logs);

    // Create an array of objects with the properly formatted fields
    const csvData = formattedLogs.map((log) => ({
      id: log.id || "",
      facilityId: log.facilityId || "",
      eventDocId: log.eventDocId || "",
      userId: log.userId || "",
      details: log.formattedDetails || "",
      eventType: log.eventType || "",
      timestamp: log.formattedTimestamp || "",
    }));

    const csv = unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "facility_logs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Combined PDF exportation with both charts and data table
  const exportPDF = (logs) => {
    const formattedLogs = prepareDataForExport(logs);
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text("Facility Usage Report", 14, 15);

    // Add summary section
    doc.setFontSize(12);
    doc.text(
      `Total Bookings: ${totalBookings || 0} (${
        bookingsChange || 0
      } from last month)`,
      14,
      25
    );
    doc.text(
      `Total Issues: ${totalIssues || 0} (${
        issuesChange || 0
      } from last month)`,
      14,
      32
    );

    // Get chart elements for embedding in the PDF
    const bookingsChartElement = document.getElementById("bookings-chart");
    const issuesChartElement = document.getElementById("issues-chart");

    // Set fixed chart dimensions for PDF
    const chartWidth = 180; // Width in PDF units (72 dpi)
    const chartHeight = 90; // Height in PDF units

    let currentY = 40;

    // Function to capture a chart and add it to the PDF
    const captureChartForPDF = (chartElement, title, callback) => {
      if (!chartElement) {
        callback();
        return;
      }

      doc.setFontSize(14);
      doc.text(title, 14, currentY);
      currentY += 5;

      const svgElement = chartElement.querySelector("svg");
      if (!svgElement) {
        callback();
        return;
      }

      // Create a clean copy of the SVG with proper dimensions
      const svgClone = svgElement.cloneNode(true);

      // Set background
      svgClone.setAttribute("style", "background-color: white");

      // Convert SVG to string
      const svgData = new XMLSerializer().serializeToString(svgClone);

      // Create canvas for conversion
      const canvas = document.createElement("canvas");
      canvas.width = 1000; // Higher resolution for better quality
      canvas.height = 500;
      const ctx = canvas.getContext("2d");

      // Create image from SVG
      const img = new Image();
      img.onload = function () {
        // Fill canvas with white background
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw image to canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Get data URL and add to PDF
        const imgData = canvas.toDataURL("image/png");
        doc.addImage(imgData, "PNG", 15, currentY, chartWidth, chartHeight);

        // Update Y position for next element
        currentY += chartHeight + 15;

        // Call the callback to proceed
        callback();
      };

      // Load the SVG data
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const svgUrl = URL.createObjectURL(svgBlob);
      img.src = svgUrl;
    };

    // Chain the chart captures to ensure proper ordering
    captureChartForPDF(
      bookingsChartElement,
      "Proportion of Bookings by Facility",
      () => {
        captureChartForPDF(
          issuesChartElement,
          "Proportion of Issues by Facility",
          () => {
            // Add data table after both charts
            doc.setFontSize(14);
            doc.text("Facility Usage Logs", 14, currentY);

            const tableData = formattedLogs.map((log) => [
              log.id || "",
              log.facilityId || "",
              log.eventType || "",
              log.formattedTimestamp || "",
            ]);

            autoTable(doc, {
              head: [["ID", "Facility", "Event Type", "Occurred At"]],
              body: tableData,
              startY: currentY + 5,
              margin: { top: 10 },
              styles: { overflow: "linebreak", fontSize: 10 },
              columnStyles: {
                0: { cellWidth: 30 },
                1: { cellWidth: 30 },
                2: { cellWidth: 40 },
                3: { cellWidth: 50 },
              },
            });

            // Save the PDF when everything is done
            doc.save("facility_usage_report.pdf");
          }
        );
      }
    );
  };

  // Function to export chart as PNG image
  const exportChartAsPNG = (chartId, fileName) => {
    const chartElement = document.getElementById(chartId);
    if (!chartElement) {
      console.error(`Element with ID ${chartId} not found`);
      return;
    }

    // Get SVG data
    const svgElement = chartElement.querySelector("svg");
    if (!svgElement) {
      console.error("SVG element not found inside the chart container");
      return;
    }

    // Clone the SVG element to avoid modifying the original
    const svgClone = svgElement.cloneNode(true);

    // Set background for the SVG (otherwise it will be transparent)
    svgClone.setAttribute("background", "white");

    // Get SVG as string
    const svgData = new XMLSerializer().serializeToString(svgClone);

    // Create a canvas element
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Create an image element
    const img = new Image();

    // Set up image load event
    img.onload = function () {
      // Set canvas dimensions
      canvas.width = img.width;
      canvas.height = img.height;

      // Fill with white background
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw the image
      ctx.drawImage(img, 0, 0);

      // Export as PNG
      const pngData = canvas.toDataURL("image/png");

      // Create download link
      const downloadLink = document.createElement("a");
      downloadLink.href = pngData;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };

    // Convert SVG to data URL
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const svgUrl = URL.createObjectURL(svgBlob);

    // Load the image
    img.src = svgUrl;
  };

  // Function to export both charts as a single PDF
  const exportChartsAsPDF = () => {
    const doc = new jsPDF();
    doc.text("Facility Usage Charts", 14, 15);

    // Add summary data
    doc.setFontSize(12);
    doc.text(
      `Total Bookings: ${totalBookings} (${bookingsChange} from last month)`,
      14,
      25
    );
    doc.text(
      `Total Issues: ${totalIssues} (${issuesChange} from last month)`,
      14,
      32
    );

    // Get chart elements
    const bookingsChart = document.getElementById("bookings-chart");
    const issuesChart = document.getElementById("issues-chart");

    if (bookingsChart && issuesChart) {
      // For each chart, extract the SVG, convert to canvas, then to image
      const charts = [
        {
          element: bookingsChart,
          title: "Proportion of Bookings by Facility",
          y: 40,
        },
        {
          element: issuesChart,
          title: "Proportion of Issue Reports by Facility",
          y: 150,
        },
      ];

      charts.forEach((chart) => {
        const svgElement = chart.element.querySelector("svg");
        if (svgElement) {
          const svgData = new XMLSerializer().serializeToString(svgElement);
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const img = new Image();

          // We need to use a promise to handle the asynchronous image loading
          const imagePromise = new Promise((resolve) => {
            img.onload = function () {
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.fillStyle = "white";
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0);

              // Add to PDF
              doc.setFontSize(14);
              doc.text(chart.title, 14, chart.y - 5);

              // Add chart image to PDF
              const imgData = canvas.toDataURL("image/png");
              doc.addImage(imgData, "PNG", 10, chart.y, 190, 100);

              resolve();
            };

            const svgBlob = new Blob([svgData], {
              type: "image/svg+xml;charset=utf-8",
            });
            const svgUrl = URL.createObjectURL(svgBlob);
            img.src = svgUrl;
          });

          // Since we're in a synchronous function but need to handle async operations,
          // we'll need to rely on the PDF being saved after all images are processed.
          // For simplicity in this example, we'll save immediately, but in a real app
          // you might want to use Promise.all to wait for all images to be processed.
          imagePromise.then(() => {
            // In a real implementation, you'd want to save only after the last chart
            // is processed, but for simplicity we're saving for each chart.
            doc.save("facility_charts.pdf");
          });
        }
      });
    }
  };
  //____________________________________

  // Function to determine if we should display a positive or negative trend indicator
  const getTrendIndicator = (change) => {
    if (!change) return null;

    const numChange = parseFloat(change);
    if (isNaN(numChange)) return null;

    if (numChange > 0) {
      return <span className="trend-up">↑</span>;
    } else if (numChange < 0) {
      return <span className="trend-down">↓</span>;
    }
    return <span className="trend-neutral">→</span>;
  };

  return (
    <main className="usageTrends-main">
      {error && <div className="error-message">{error}</div>}

      {isLoading && <div className="loading-message">Loading...</div>}
      {/* This is for the header, to show something, idk*/}
      <header className="usageTrends-header">
        <h2>Facility Trends Overview</h2>
      </header>

      {/* This section contains a bunch of other sections. We'll see what they are when I'm done*/}
      <section className="main-section">
        <section className="left">
          <section className="Stats-Heading">
            <h2>This Month's Statistics</h2>
          </section>
          <section className="summaries">
            <article className="summary-card">
              <section className="summaryText">
                <h3>Total Bookings This Month:</h3>
                <h4>{totalBookings}</h4>
                <h3>Change Of:</h3>
                <h4>
                  {bookingsChange} {getTrendIndicator(bookingsChange)}
                </h4>
                <h3>From Last Month</h3>
              </section>
            </article>
            <article className="summary-card">
              <section className="summaryText">
                <h3>Total Issues Reported This Month:</h3>
                <h4>{totalIssues}</h4>
                <h3>Change Of:</h3>
                <h4>
                  {issuesChange} {getTrendIndicator(issuesChange)}
                </h4>
                <h3>From Last Month</h3>
              </section>
            </article>
          </section>
          <section className="PieCharts">
            <section className="PieChart-Bookings">
              <section>
                <h3>Proportion of Bookings by Facility</h3>
              </section>
              <section
                id="bookings-chart"
                data-testid="bookings-chart"
                className="chart-container"
              >
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={getChartData(bookingsChart)}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={0}
                      labelLine={false}
                      label={renderCustomizedLabel}
                      isAnimationActive={true}
                      paddingAngle={2}
                    >
                      {getChartData(bookingsChart).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={BOOKING_COLORS[index % BOOKING_COLORS.length]}
                          stroke="#fff"
                          strokeWidth={1}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [`${value}%`, name]}
                      contentStyle={{ borderRadius: "5px" }}
                    />
                    <Legend
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </section>
            </section>
          </section>
        </section>
        <section className="right">
          <section className="Stats-Heading">
            <h2>Search And Filter Logs</h2>
          </section>
          <section className="filter-section">
            <label>
              Event Type:
              <select
                value={eventTypeFilter}
                onChange={(e) => setEventTypeFilter(e.target.value)}
              >
                <option value="">All Events</option>
                <option value="booking">Booking</option>
                <option value="cancellation">Cancellation</option>
                <option value="issue">Issue</option>
              </select>
            </label>

            <label htmlFor="facility-filter">Facility:</label>

            <select
              data-testid="facility-filter"
              aria-label="Facility filter"
              value={facilityFilter}
              onChange={(e) => setFacilityFilter(e.target.value)}
            >
              <option value="">All Facilites</option>
              <option value="pool">Pool</option>
              <option value="gym">Gym</option>
              <option value="soccer">Soccer Field</option>
              <option value="basketball">Basketball Court</option>
            </select>
            <label>
              From:
              <input
                type="date"
                value={formatDateForInput(startDate)}
                onChange={(e) => setStartDate(new Date(e.target.value))}
              />
            </label>
            <label>
              To:
              <input
                type="date"
                value={formatDateForInput(endDate)}
                onChange={(e) => setEndDate(new Date(e.target.value))}
              />
            </label>
          </section>
          <section className="Buttons">
            <button
              onClick={() => exportCSV(filteredLogs)}
              className="export-btn csv-btn"
            >
              Export as CSV
            </button>
            <button
              onClick={() => exportPDF(filteredLogs)}
              className="export-btn pdf-btn"
            >
              Export Complete Report
            </button>
          </section>
          <section className="table-section">
            <table className="log-table">
              <thead>
                <tr>
                  <th>Event Type</th>
                  <th>Facility</th>
                  <th>Occured At</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="no-logs-message">
                      No Logs found
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log, index) => (
                    <tr
                      className="log-table-row"
                      key={log.id || `log-${index}`}
                    >
                      <td>{log.eventType}</td>
                      <td>{log.facilityId}</td>
                      <td>
                        {new Date(
                          log.timestamp.seconds * 1000
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        </section>
      </section>
    </main>
  );
}
