import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword as firebaseSignIn
} from "firebase/auth";

import { app } from "../firebase/firebase.config.js";
import { saveUser, fetchUser } from "../services/userServices.js"; // Service functions


const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// 🔐 Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if user exists
   

    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      phoneNumber: user.phoneNumber || null,
      providerId: user.providerData[0]?.providerId || "google.com",
      emailVerified: user.emailVerified
    };

    

    await saveUser(userData);
    return result;

  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export const signUpWithEmailAndPassword = async (name, phoneNumber, email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || name,
      photoURL: user.photoURL || null,
      phoneNumber: user.phoneNumber || phoneNumber,
      providerId: "email",
      emailVerified: true,
      user_type: "resident",
      createdAt: new Date().toISOString()
    };

    await saveUser(userData);
    return userCredential;

  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
};

// 🔓 Sign in with Email & Password
export const signInWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await firebaseSignIn(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in with email/password:", error);
    throw error;
  }
};

// 🔒 Sign out
export const signOutUser = async () => {
  try {
    await signOut(auth);
    console.log("User signed out");
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// 👤 Get current user profile from Firestore
export const getCurrentUserProfile = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;

  try {
    return await fetchUser(currentUser.uid);
  } catch (error) {
    console.error("Error fetching current user profile:", error);
    return null;
  }
};

export { auth };
