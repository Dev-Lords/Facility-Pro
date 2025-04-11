// src/services/firebase-auth.js
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { app } from "../firebase/firebase.config.js";
import { User } from "../models/user.js"; // Adjust the import path as necessary

// Initialize Firebase Authentication
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Sign in function with user data storage
// src/services/firebase-auth.js
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("User signed in:", user);
    
    // Check if user exists first
    const existingUser = await User.getByUid(user.uid);
    
    // Prepare user data
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      phoneNumber: user.phoneNumber || null,
      providerId: user.providerData[0]?.providerId || "google.com",
      emailVerified: user.emailVerified
    };
    
    // If user exists, preserve their user_type
    if (existingUser) {
      userData.user_type = existingUser.user_type; // Keep existing user_type
      console.log("Existing user signed in, preserving user_type:", userData.user_type);
    } else {
      // Only set default user_type for new users
      userData.user_type = "user";
      userData.createdAt = new Date().toISOString();
      console.log("Creating new user profile with default user_type");
    }
    
    // Save user data to Firestore
    await User.saveUser(userData);
    
    return result;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};
// Sign out function
export const signOutUser = async () => {
  try {
    await signOut(auth);
    console.log("User signed out");
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Function to get current user profile
export const getCurrentUserProfile = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;
  
  try {
    return await User.getByUid(currentUser.uid);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

// Export auth instance and other functions
export { auth };