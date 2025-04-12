// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);

if (process.env.NODE_ENV !== 'test') {
  import('firebase/analytics').then(({ getAnalytics, isSupported }) => {
    isSupported().then((supported) => {
      if (supported) getAnalytics(app);
    });
  });
}
