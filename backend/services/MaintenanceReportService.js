import { fetchIssues as getFromDB } from "../services/issuesService";

export const resolveStatus = (status) => {
  return ["closed"].includes(status.toLowerCase()) ? "Closed" : "Open";
};

export const fetchFilteredIssues = async (statusFilter, facilityFilter) => {
  const issues = await getFromDB();

  return issues.filter((issue) => {
    const status = resolveStatus(issue.issueStatus);
    const statusMatch = statusFilter === "all" || status.toLowerCase() === statusFilter;
    const facilityMatch = facilityFilter === "all" || issue.facility === facilityFilter;
    return statusMatch && facilityMatch;
  });
};

export const getStats = (filteredIssues) => {
  const open = filteredIssues.filter(i => resolveStatus(i.issueStatus) === "Open").length;
  const closed = filteredIssues.length - open;
  return { open, closed, total: filteredIssues.length };
};

export function exportToCsv(data, filename) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(row =>
    headers.map(field => `"${(row[field] || "").toString().replace(/"/g, '""')}"`).join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}
