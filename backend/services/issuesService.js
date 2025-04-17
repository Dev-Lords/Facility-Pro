import {  getDocs, collection, doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase.config.js";
import { Issue } from "../models/issue.js";

// In your fetchIssues function
export const fetchIssues = async () => {
  try {
    const issuesCollection = collection(db, "issues");
    const issuesSnapshot = await getDocs(issuesCollection);
    const issuesList = issuesSnapshot.docs.map(doc => {
      const data = doc.data();
      console.log("Raw Firebase doc:", doc.id, data); // Log raw data
      return {
        issueID: doc.id,
        ...data
      };
    });
    console.log("Processed issues list:", issuesList); // Log processed list
    return issuesList;
  } catch (error) {
    console.error("Error fetching issues:", error);
    return [];
  }
};


export const UpdateIssue = async (issueID, updatedIssue) => {
  if (!issueID) {
    throw new Error("No issue ID provided");
  }
  
  try {
    console.log("UpdateIssue called with ID:", issueID);
    console.log("UpdateIssue data:", updatedIssue);
    
    const issueRef = doc(db, "issues", issueID);
    await setDoc(issueRef, updatedIssue, { merge: true });
    
    console.log("Issue updated successfully in Firebase:", issueID);
    return true;
  } catch (error) {
    console.error("Error updating issue in Firebase:", error);
    throw error; // Re-throw to handle in the component
  }
};
