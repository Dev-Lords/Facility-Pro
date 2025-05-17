import jsPDF from "jspdf";
import autoTable from "jspdf-autotable" 
import { fetchIssues as getFromDB } from "../services/issuesService";

// Standardize and interpret issue status
export const resolveStatus = (status) => {
  if (!status) return "Open";
  const closedSet = ["closed", "resolved", "completed"];
  return closedSet.includes(status.toLowerCase()) ? "Closed" : "Open";
};

// Fetch and filter issues
export const fetchFilteredIssues = async (statusFilter, facilityFilter, priorityFilter) => {
  try {
    const issues = await getFromDB();

    return issues.filter(issue => {
      const status = resolveStatus(issue.issueStatus);
      const priority = issue.priority || "Unspecified";

      const statusMatch =
        statusFilter === "all" ||
        status.toLowerCase() === statusFilter.toLowerCase();

      const facilityMatch =
        facilityFilter === "all" ||
        (issue.relatedFacility &&
          issue.relatedFacility.toLowerCase() === facilityFilter.toLowerCase());

      const priorityMatch =
        priorityFilter === "all" ||
        priority.toLowerCase() === priorityFilter.toLowerCase();

      return statusMatch && facilityMatch && priorityMatch;
    });
  } catch (error) {
    console.error("Error fetching filtered issues:", error);
    return [];
  }
};

// Enhanced statistics with case-insensitive priority breakdown
export const getStats = (filteredIssues) => {
  const open = filteredIssues.filter(i => resolveStatus(i.issueStatus) === "Open").length;
  const closed = filteredIssues.length - open;

  const toLower = (val) => (val || "").toLowerCase();

  const priorityCounts = {
    High: filteredIssues.filter(i => toLower(i.priority) === "high").length,
    Medium: filteredIssues.filter(i => toLower(i.priority) === "medium").length,
    Low: filteredIssues.filter(i => toLower(i.priority) === "low").length,
    Unspecified: filteredIssues.filter(i => !i.priority || toLower(i.priority) === "unspecified").length
  };

  return {
    open,
    closed,
    total: filteredIssues.length,
    priorityCounts
  };
};

export function handleExportPDF (filteredIssues) {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(16);
  doc.text("Maintenance Report", 14, 20);

  // Summary Section
  doc.setFontSize(12);
  const { open, closed, priorityCounts } = getStats(filteredIssues);

  const summaryLines = [
    `Total Issues: ${filteredIssues.length}`,
    `Open: ${open}   Closed: ${closed}`,
    `High: ${priorityCounts.High}   Medium: ${priorityCounts.Medium}   Low: ${priorityCounts.Low}`
  ];

  summaryLines.forEach((line, index) => {
    doc.text(line, 14, 30 + index * 8);
  });

  // Table Headers
  const headers = [["Title", "Status", "Priority", "Facility", "Location", "Reported"]];

  // Table Rows
  const rows = filteredIssues.map(issue => [
    issue.issueTitle,
    resolveStatus(issue.issueStatus),
    issue.priority || "Unspecified",
    issue.relatedFacility || "N/A",
    issue.location || "N/A",
    issue.reportedAt ? new Date(issue.reportedAt).toLocaleDateString() : "N/A"
  ]);

  // Create table using autoTable
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

  // Save the PDF
  doc.save("maintenance_report.pdf");
};



// Export filtered data to CSV
export function exportToCsv(data, filename) {
  if (!data.length) {
    alert("No data to export!");
    return;
  }

  const headers = [
    "ID", "Title", "Description", "Status",
    "Priority", "Facility", "Location",
    "Reported Date", "Closed Date", "Assigned To"
  ];

  const rows = data.map(row => [
    row.issueID || "",
    `"${(row.issueTitle || "").replace(/"/g, '""')}"`,
    `"${(row.description || "").replace(/"/g, '""')}"`,
    resolveStatus(row.issueStatus),
    row.priority || "Unspecified",
    row.relatedFacility || "",
    row.location || "",
    row.reportedAt ? new Date(row.reportedAt).toLocaleDateString() : "",
    row.closedAt ? new Date(row.closedAt).toLocaleDateString() : "",
    row.assignedTo || ""
  ]);

  const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Facility availability calculation
export const calculateFacilityAvailability = (issues) => {
  const facilities = ["Gym", "Pool", "Soccer Field", "Basketball Court"];

  return facilities.map(facility => {
    const relatedIssues = issues.filter(i => i.relatedFacility === facility);
    if (relatedIssues.length === 0) {
      return {
        facility,
        availability: 100,
        totalIssues: 0,
        openIssues: 0,
        status: "Available"
      };
    }

    const openIssues = relatedIssues.filter(i => resolveStatus(i.issueStatus) === "Open");
    const availability = Math.max(0, 100 - (openIssues.length / relatedIssues.length) * 100);

    return {
      facility,
      availability: Math.round(availability),
      totalIssues: relatedIssues.length,
      openIssues: openIssues.length,
      status: openIssues.length === 0 ? "Available" : "Unavailable"
    };
  });
};




