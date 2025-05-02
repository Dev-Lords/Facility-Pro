import { fetchIssues as getFromDB } from "../services/issuesService";

export const resolveStatus = (status) => {
  if (!status) return "Open";
  const closedSet = ["closed"];
  return closedSet.includes(status.toLowerCase()) ? "Closed" : "Open";
};

export const fetchFilteredIssues = async (statusFilter, facilityFilter, priorityFilter) => {
  const issues = await getFromDB();

  return issues.filter(issue => {
    const status = resolveStatus(issue.issueStatus);
    const statusMatch = statusFilter === "all" || status.toLowerCase() === statusFilter;
    const facilityMatch = facilityFilter === "all" || issue.relatedFacility === facilityFilter;
    const priorityMatch = priorityFilter === "all" || issue.priority === priorityFilter;
    return statusMatch && facilityMatch && priorityMatch;
  });
};

export const getStats = (filteredIssues) => {
  const open = filteredIssues.filter(i => resolveStatus(i.issueStatus) === "Open").length;
  const closed = filteredIssues.length - open;
  return { open, closed, total: filteredIssues.length };
};

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


