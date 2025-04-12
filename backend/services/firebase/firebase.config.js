// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC1CymHohELYGN7EipJOC5sL9iQe5sIOzc",
  authDomain: "facilty-pro.firebaseapp.com",
  projectId: "facilty-pro",
  storageBucket: "facilty-pro.firebasestorage.app",
  messagingSenderId: "33531147470",
  appId: "1:33531147470:web:46c8bc113fdf63a5a4cc9f",
  measurementId: "G-89EB162VPS"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Safely initialize Analytics only if supported and not in test environment
if (process.env.NODE_ENV !== 'test') {
  isSupported().then((supported) => {
    if (supported) {
      getAnalytics(app);
    }
  }).catch((e) => {
    console.warn("Analytics not supported:", e);
  });
}
