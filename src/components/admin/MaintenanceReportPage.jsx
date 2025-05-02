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
  const priorityChartRef = useRef(null);
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

    const createBarChart = (ref, labels, data, colors, label) => {
      const ctx = ref.current.getContext("2d");
      const chart = new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [{
            label,
            data,
            backgroundColor: colors,
            barThickness: 25
          }]
        },
        options: {
          plugins: { legend: { display: false } },
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                stepSize: 20
              }
            }
          }
        }
      });
      return chart;
    };

    chartInstances.current.status = createBarChart(
      statusChartRef,
      ["Open", "Closed"],
      [open, closed],
      ["#1e4e8c", "#3d6ea8"],
      "Issue Status"
    );

    const priorities = ["High", "Medium", "Low"];
    const priorityData = priorities.map(p => issues.filter(i => i.priority === p).length);
    chartInstances.current.priority = createBarChart(
      priorityChartRef,
      priorities,
      priorityData,
      ["#e53935", "#fb8c00", "#43a047"],
      "Priority Distribution"
    );

    const facilities = ["Gym", "Pool", "Soccer Field", "Basketball Court"];
    const availabilityData = facilities.map(facility => {
      const related = issues.filter(i => i.relatedFacility === facility);
      if (related.length === 0) return 100;
      const openCount = related.filter(i => resolveStatus(i.issueStatus) === "Open").length;
      return Math.max(0, 100 - (openCount / related.length) * 100);
    });

    chartInstances.current.availability = createBarChart(
      availabilityChartRef,
      facilities,
      availabilityData,
      ["#4caf50", "#43a047", "#388e3c", "#2e7d32"],
      "Facility Availability (%)"
    );
  }, [issues]);

  const handleExportCSV = () => exportToCsv(issues, "maintenance_report.csv");

  const handleExportPDF = async () => {
    const canvas = await html2canvas(document.getElementById("report-section"));
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
    pdf.save("maintenance_report.pdf");
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
            <article className="stat-card">Open: {open}</article>
            <article className="stat-card">Closed: {closed}</article>
            <article className="stat-card">Total: {total}</article>
          </section>

          <figure className="chart-wrapper"><canvas ref={statusChartRef}></canvas></figure>
          <figure className="chart-wrapper"><canvas ref={priorityChartRef}></canvas></figure>
          <figure className="chart-wrapper"><canvas ref={availabilityChartRef}></canvas></figure>
        </section>
      </section>
    </main>
  );
};

export default MaintenanceReportPage;