// reportService.js
import { collection, getDocs } from "firebase/firestore";
import db from "./firebase";

export const fetchBookings = async () => {
  const snapshot = await getDocs(collection(db, "bookings"));
  return snapshot.docs.map(doc => doc.data());
};

export const fetchEvents = async () => {
  const snapshot = await getDocs(collection(db, "events"));
  return snapshot.docs.map(doc => doc.data());
};

export const fetchIssues = async () => {
  const snapshot = await getDocs(collection(db, "issues"));
  return snapshot.docs.map(doc => doc.data());
};
