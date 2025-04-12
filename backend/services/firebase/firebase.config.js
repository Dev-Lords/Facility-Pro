
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";


const firebaseConfig = {
  apiKey: "AIzaSyC1CymHohELYGN7EipJOC5sL9iQe5sIOzc",
  authDomain: "facilty-pro.firebaseapp.com",
  projectId: "facilty-pro",
  storageBucket: "facilty-pro.firebasestorage.app",
  messagingSenderId: "33531147470",
  appId: "1:33531147470:web:46c8bc113fdf63a5a4cc9f",
  measurementId: "G-89EB162VPS"
};


export const app = initializeApp(firebaseConfig);


if (process.env.NODE_ENV !== 'test') {
  isSupported().then((supported) => {
    if (supported) {
      getAnalytics(app);
    }
  }).catch((e) => {
    console.warn("Analytics not supported:", e);
  });
}
