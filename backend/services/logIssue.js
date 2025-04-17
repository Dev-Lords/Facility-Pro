// logIssue.jsimport { db, storage } from "../firebase/firebase.config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { storage } from "../firebase/firebase.config.js"; 
import {db} from "../firebase/firebase.config.js"

export async function logIssueToFirebase(data, reporter) {
  const issueID = uuidv4();
  const reportedAt = new Date().toISOString();
  const imageUrls = [];

  for (let image of data.images) {
    const imageRef = ref(storage, `issues/${issueID}/${image.name}`);
    const snapshot = await uploadBytes(imageRef, image);
    const url = await getDownloadURL(snapshot.ref);
    imageUrls.push(url);
  }

  const issueData = {
    issueID,
    issueTitle: data.issueTitle,
    issueDescription: data.issueDescription,
    reporter,
    reportedAt,
    issueStatus: "open",
    feedback: "",
    assignedTo: null,
    location: data.location,
    priority: data.priority,
    category: data.category,
    images: imageUrls,
  };

  await setDoc(doc(db, "issues", issueID), issueData);
}
