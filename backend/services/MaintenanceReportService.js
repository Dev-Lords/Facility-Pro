import { fetchIssues as getFromDB } from "../services/issuesService";

// Standardize and interpret issue status
export const resolveStatus = (status) => {
  if (!status) return "Open";
  const closedSet = ["closed", "resolved", "completed"];
  return closedSet.includes(status.toLowerCase()) ? "Closed" : "Open";
};

// Enhanced fetch and filter issues with more options
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
        (issue.relatedFacility && issue.relatedFacility.toLowerCase() === facilityFilter.toLowerCase());

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

// Enhanced statistics with priority breakdown
export const getStats = (filteredIssues) => {
  const open = filteredIssues.filter(i => resolveStatus(i.issueStatus) === "Open").length;
  const closed = filteredIssues.length - open;
  
  const priorityCounts = {
    High: filteredIssues.filter(i => i.priority === "High").length,
    Medium: filteredIssues.filter(i => i.priority === "Medium").length,
    Low: filteredIssues.filter(i => i.priority === "Low").length,
    Unspecified: filteredIssues.filter(i => !i.priority || i.priority === "Unspecified").length
  };

  return { 
    open, 
    closed, 
    total: filteredIssues.length,
    priorityCounts 
  };
};

// Enhanced CSV Export with more fields
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

  const csvContent = [headers, ...rows].join("\n");
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

// New function to calculate facility availability
export const calculateFacilityAvailability = (issues) => {
  const facilities = ["Gym", "Pool", "Soccer Field", "Basketball Court"];
  
  return facilities.map(facility => {
    const relatedIssues = issues.filter(i => i.relatedFacility === facility);
    if (relatedIssues.length === 0) return { facility, availability: 100 };

    const openIssues = relatedIssues.filter(i => resolveStatus(i.issueStatus) === "Open");
    const availability = Math.max(0, 100 - (openIssues.length / relatedIssues.length) * 100);
    
    return {
      facility,
      availability: Math.round(availability),
      totalIssues: relatedIssues.length,
      openIssues: openIssues.length
    };
  });
};



