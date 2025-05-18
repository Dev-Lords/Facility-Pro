import {  getDocs, collection, doc, setDoc } from "firebase/firestore";
import { db , storage} from "../firebase/firebase.config.js";
import { Issue } from "../models/issue.js";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

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




export async function uploadIssueImages(issueID, images) {
  const imageUrls = [];
  
  if (!images || images.length === 0) {
    return imageUrls;
  }

  for (let image of images) {
    // Generate a unique filename using timestamp if needed
    const fileName = `${Date.now()}-${image.name}`;
    const imageRef = ref(storage, `issues/${issueID}/${fileName}`);
    
    try {
      const snapshot = await uploadBytes(imageRef, image);
      const url = await getDownloadURL(snapshot.ref);
      imageUrls.push(url);
    } catch (error) {
      console.error("Error uploading image:", error);
      // Continue with other images if one fails
    }
  }
  
  return imageUrls;
}


export async function createIssue(data) {
  try {
    // Generate a new document reference with auto-generated ID
    const issueRef = doc(collection(db, "issues"));
    const issueID = issueRef.id;
    
    // Handle image uploads
    const imageUrls = await uploadIssueImages(issueID, data.images);
    
    // Create issue data with uploaded image URLs and ensure issueID matches document ID
    const issueData = {
      ...data,
      issueID: issueID, // Use Firebase's auto-generated ID
      images: imageUrls,
      issueStatus: "open", // Set default status
      feedback: "",       // Set default feedback
      assignedTo: null,   // Set default assignedTo
      location: data.location || "Unspecified",  //  Ensure location is saved
      relatedFacility: data.relatedFacility || "Not Specified", // ✅ Save the facility
      reportedAt: data.reportedAt || new Date().toISOString()
    };
    
    // Create an instance of the Issue model
    const issue = new Issue(issueData);
    
    // Use the toJSON method to convert to a plain object for Firestore
    const issueForFirestore = issue.toJSON();
    
    // Save the plain object to Firestore with the auto-generated ID
    await setDoc(issueRef, issueForFirestore);
    
    return issueID;
  } catch (error) {
    console.error("Error in createIssue:", error);
    throw error; // Re-throw to handle in the component
  }
}



export const getIssueByUserId = async (userId) => {
  try {
    const issuesCollection = collection(db, "issues");
    const issuesSnapshot = await getDocs(issuesCollection);
    const issuesList = issuesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        issueID: doc.id,
        ...data
      };
    });
    
    // Filter issues by userId
    const userIssues = issuesList.filter(issue => issue.reporter === userId);
    
    return userIssues;
  } catch (error) {
    console.error("Error fetching issues by user ID:", error);
    return [];
  }
}