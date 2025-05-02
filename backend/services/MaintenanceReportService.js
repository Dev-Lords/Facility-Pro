import { fetchIssues as getFromDB } from "../services/issuesService";

// Standardize and interpret issue status
export const resolveStatus = (status) => {
  if (!status) return "Open";
  const closedSet = ["closed"];
  return closedSet.includes(status.toLowerCase()) ? "Closed" : "Open";
};

// Fetch and filter issues
export const fetchFilteredIssues = async (statusFilter, facilityFilter, priorityFilter) => {
  const issues = await getFromDB();

  return issues.filter(issue => {
    const status = resolveStatus(issue.issueStatus);

    const statusMatch =
      statusFilter === "all" ||
      status.toLowerCase() === statusFilter.toLowerCase();

    const facilityMatch =
      facilityFilter === "all" ||
      issue.relatedFacility?.toLowerCase() === facilityFilter.toLowerCase();

    const priorityMatch =
      priorityFilter === "all" ||
      issue.priority?.toLowerCase() === priorityFilter.toLowerCase();

    return statusMatch && facilityMatch && priorityMatch;
  });
};

// Statistics for open, closed, and total
export const getStats = (filteredIssues) => {
  const open = filteredIssues.filter(i => resolveStatus(i.issueStatus) === "Open").length;
  const closed = filteredIssues.length - open;
  return { open, closed, total: filteredIssues.length };
};

// CSV Export Function
export function exportToCsv(data, filename) {
  if (!data.length) return;

  const headers = ["Title", "Status", "Priority", "Facility", "Location", "Reported"];
  const rows = data.map(row => [
    row.issueTitle,
    resolveStatus(row.issueStatus),
    row.priority,
    row.relatedFacility,
    row.location,
    new Date(row.reportedAt).toLocaleDateString()
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${(field || "").toString().replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}



