import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import app from "./firebase-config";

// Initialize Firebase Authentication
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Sign in function
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    console.log("User signed in:", result.user);
    return result.user;
  } catch (error) {
    console.error("Error signing in:", error);
  }
};

// Sign out function
export const signOutUser = async () => {
  try {
    await signOut(auth);
    console.log("User signed out");
  } catch (error) {
    console.error("Error signing out:", error);
  }
};

// Export auth instance for use in other components
export { auth };
