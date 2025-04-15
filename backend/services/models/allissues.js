import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase.config.js";
import { Issue } from "./issue.js";

 export const fetchIssues = async () => {
        try {
          const result = await getDocs(collection(db, "FacilityIssues"));

          const issueObjects = result.docs.map(doc => {

            const data = doc.data();

            const issue = {
                issueID: data.issueID,
                issueTitle: data.issueTitle,
                issueDescription: data.issueDescription,
                reporter: data.reporter,
                reportedAt: data.reportedAt,
                issueStatus: data.status,
                feedback: data.feedback
            }

            return new Issue(issue);

          });

          return issueObjects;

        } catch (error) {
          console.error("Failed to fetch issues:", error);
        }
      };