import React, { useEffect, useState, useRef } from "react";
import { fetchFilteredIssues, getStats, resolveStatus, exportToCsv } from "../../../backend/services/MaintenanceReportService";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Chart } from "chart.js/auto";
import "./MaintenanceReport.css";

const MaintenanceReportPage = () => {
  const [issues, setIssues] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [facilityFilter, setFacilityFilter] = useState("all");
  const statusChartRef = useRef(null);
  const availabilityChartRef = useRef(null);
  const chartInstances = useRef({});

  const loadData = async () => {
    const data = await fetchFilteredIssues(statusFilter, facilityFilter, priorityFilter);
    setIssues(data);
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, facilityFilter, priorityFilter]);

  useEffect(() => {
    const { open, closed } = getStats(issues);

    const cleanupCharts = () => {
      Object.values(chartInstances.current).forEach(chart => chart?.destroy());
    };
    cleanupCharts();

    const createPieChart = (ref, title, labels, data, colors) => {
      const ctx = ref.current.getContext("2d");
      return new Chart(ctx, {
        type: "pie",
        data: {
          labels,
          datasets: [{
            data,
            backgroundColor: colors,
            borderWidth: 1,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "bottom"
            },
            title: {
              display: true,
              text: title,
              font: {
                size: 16,
                weight: "bold"
              }
            }
          }
        }
      });
    };

    chartInstances.current.status = createPieChart(
      statusChartRef,
      "Open vs Closed Issues",
      ["Open", "Closed"],
      [open, closed],
      ["#1e4e8c", "#3d6ea8"]
    );

    const facilities = ["Gym", "Pool", "Soccer Field", "Basketball Court"];
    const availabilityData = facilities.map(facility => {
      const related = issues.filter(i => i.relatedFacility === facility);
      if (related.length === 0) return 100;
      const openCount = related.filter(i => resolveStatus(i.issueStatus) === "Open").length;
      return Math.max(0, 100 - (openCount / related.length) * 100);
    });
    chartInstances.current.availability = createPieChart(
      availabilityChartRef,
      "Availability of Facilities Based on Maintenance Issues",
      facilities,
      availabilityData,
      ["#4caf50", "#43a047", "#388e3c", "#2e7d32"]
    );
  }, [issues]);

  const handleExportCSV = () => {
    try {
      exportToCsv(issues, "maintenance_report.csv");
    } catch (err) {
      console.error("CSV Export failed", err);
    }
  };

  const handleExportPDF = async () => {
    try {
      const canvas = await html2canvas(document.getElementById("report-section"));
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
      pdf.save("maintenance_report.pdf");
    } catch (err) {
      console.error("PDF Export failed", err);
    }
  };

  const { open, closed, total } = getStats(issues);

  return (
    <main className="issues-page" id="report-section">
      <header className="usageTrends-header">
        <h2>Maintenance Report: Filtered and Downloadable Maintenance</h2>
      </header>

      <section className="main-section">
        <section className="left">
          <section className="Stats-Heading">
            <h2>Filter Logs</h2>
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
          </section>

          <section className="table-section">
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
                {issues.map((issue) => (
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
        </section>

        <section className="right">
          <section className="Stats-Heading">
            <h2>Monthly Statistics</h2>
          </section>
          <section className="summary-stats">
            <article className="summary-card">Open: {open}</article>
            <article className="summary-card">Closed: {closed}</article>
            <article className="summary-card">Total: {total}</article>
          </section>

          <section className="PieCharts">
            <figure className="chart-wrapper"><canvas ref={statusChartRef}></canvas></figure>
            <figure className="chart-wrapper"><canvas ref={availabilityChartRef}></canvas></figure>
          </section>
        </section>
      </section>
    </main>
  );
};

export default MaintenanceReportPage;

