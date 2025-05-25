import { ref, uploadBytes, getDownloadURL,getStorage } from "firebase/storage";


export const fetchIssues = async () => {
  const url = `https://us-central1-facilty-pro.cloudfunctions.net/api/fetch-issues`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch issues");
    const issues = await response.json();
    return issues;
  } catch (error) {
    console.error("Error fetching issues:", error);
    return [];
  }
};


export const UpdateIssue = async (issueID, updatedIssue) => {
  
   const url = `https://us-central1-facilty-pro.cloudfunctions.net/api/issues/${issueID}`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedIssue)
    });

    if (!response.ok) throw new Error("Failed to update issue");
    return true;
  } catch (error) {
    console.error("Error updating issue:", error);
    throw error;
  }
};


export async function uploadIssueImages(storage, issueID, images) {  //needs to be migrated to api
  const imageUrls = [];

  if (!images || images.length === 0) {
    return imageUrls;
  }

  for (let image of images) {
    const fileName = `${Date.now()}-${image.name}`;
    const imageRef = ref(storage, `issues/${issueID}/${fileName}`);

    try {
      const snapshot = await uploadBytes(imageRef, image);
      const url = await getDownloadURL(snapshot.ref);
      imageUrls.push(url);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  }

  return imageUrls;
}



export const createIssue = async (issueData) => {
  const storage = getStorage();
  const issueID = `${Date.now()}`; 

  try {
    
    const imageUrls = await uploadIssueImages(storage, issueID, issueData.images);

    const data = {
      ...issueData,
      issueID,
      images: imageUrls,
    };

    const response = await fetch("https://us-central1-facilty-pro.cloudfunctions.net/api/create-issue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Backend error:", errText);
      throw new Error("Issue creation failed");
    }

    const result = await response.json();
    return result.issueID;
  } catch (error) {
    console.error("Error creating full issue:", error);
    throw error;
  }
};



export const getIssueByUserId = async (userId) => {
   const url = `https://us-central1-facilty-pro.cloudfunctions.net/api/issuesByUser?userId=${encodeURIComponent(userId)}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch user issues");
    const issues = await response.json();
    return issues;
  } catch (error) {
    console.error("Error fetching user issues:", error);
    return [];
  }
};
