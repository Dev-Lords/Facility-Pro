import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase.config";

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
  }
}



