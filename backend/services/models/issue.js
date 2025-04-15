import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase.config";

export class Issue {
    constructor(issue) {
        this.issueID= issue.issueID|| null;
        this.issueTitle = issue.issueTitle || null;
        this.issueDescription = issue.issueDescription || null;
        this.reporter = issue.reporter || null;
        this.reportedAt = issue.reportedAt || new Date().toISOString;
        this.issueStatus = issue.issueStatus || "Reported";
        this.feedback = issue.feedback || null;
      }      
}