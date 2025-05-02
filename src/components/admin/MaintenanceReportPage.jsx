import React, { useEffect, useState, useRef } from "react";
import { fetchFilteredIssues, getStats, resolveStatus, exportToCsv } from "../../../backend/services/MaintenanceReportService";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Chart } from "chart.js/auto";
import "./MaintenanceReport.css";

const MaintenanceReportPage = () => {
  const [issues, setIssues] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [facilityFilter, setFacilityFilter] = useState("all");
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const loadData = async () => {
    const data = await fetchFilteredIssues(statusFilter, facilityFilter);
    setIssues(data);
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, facilityFilter]);

  useEffect(() => {
    const { open, closed } = getStats(issues);

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    chartInstanceRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Open", "Closed"],
        datasets: [{
          label: "Issues",
          data: [open, closed],
          backgroundColor: ["#1e4e8c", "#3d6ea8"]
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }, [issues]);

  const handleExportCSV = () => {
    exportToCsv(issues, "maintenance_report.csv");
  };

  const handleExportPDF = async () => {
    const canvas = await html2canvas(document.getElementById("report-section"));
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
    pdf.save("maintenance_report.pdf");
  };

  const { open, closed, total } = getStats(issues);

  return (
    <div className="issues-page" id="report-section">
      <header className="facility-header">
        <h1 className="facility-title">Maintenance Report</h1>
        <p className="facility-subtitle">Filtered and downloadable maintenance insights</p>
      </header>

      <section className="filter-controls">
        <select className="status-filter" onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
        <select className="status-filter" onChange={(e) => setFacilityFilter(e.target.value)}>
          <option value="all">All Facilities</option>
          <option value="soccer">Soccer</option>
          <option value="tennis">Tennis</option>
          <option value="netball">Netball</option>
          <option value="gym">Gym</option>
        </select>
      </section>

      <div className="summary-stats">
        <div className="stat-card">Open: {open}</div>
        <div className="stat-card">Closed: {closed}</div>
        <div className="stat-card">Total: {total}</div>
      </div>

      <div className="chart-wrapper">
        <canvas ref={chartRef} height={150}></canvas>
      </div>

      <section className="issues-container">
        <table className="issues-table">
          <thead>
            <tr>
              <th>ID</th><th>Title</th><th>Status</th><th>Priority</th><th>Facility</th><th>Location</th><th>Reported</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((issue) => (
              <tr key={issue.issueID}>
                <td>{issue.issueID}</td>
                <td>{issue.issueTitle}</td>
                <td><span className={`status-badge status-${issue.issueStatus}`}>{resolveStatus(issue.issueStatus)}</span></td>
                <td><span className={`priority-badge priority-${issue.priority}`}>{issue.priority}</span></td>
                <td>{issue.facility}</td>
                <td>{issue.location}</td>
                <td>{new Date(issue.reportedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <footer className="pagination-controls">
        <button className="facility-btn" onClick={handleExportCSV}>Download CSV</button>
        <button className="facility-btn" onClick={handleExportPDF}>Download PDF</button>
      </footer>
    </div>
  );
};

export default MaintenanceReportPage;
