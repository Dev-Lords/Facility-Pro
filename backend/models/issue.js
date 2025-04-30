
export class Issue {
  constructor(issue) {
    this.issueID = issue.issueID || null;
    this.issueTitle = issue.issueTitle || "";
    this.issueDescription = issue.issueDescription || "";
    this.reporter = issue.reporter || null;
    this.reportedAt = issue.reportedAt || new Date().toISOString();
    this.issueStatus = issue.issueStatus || "open";
    this.feedback = issue.feedback || "";
    this.assignedTo = issue.assignedTo || null;
    this.location = issue.location || "Unknown";
    this.priority = issue.priority || "medium";
    this.images = issue.images || [];
    this.category = issue.category || "General";
  }

  toJSON() {
    return {
      issueID: this.issueID,
      issueTitle: this.issueTitle,
      issueDescription: this.issueDescription,
      reporter: this.reporter,
      reportedAt: this.reportedAt,
      issueStatus: this.issueStatus,
      feedback: this.feedback,
      assignedTo: this.assignedTo,
      location: this.location,
      priority: this.priority,
      images: this.images,
      category: this.category
    };
  }

}




