// src/models/User.js
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase.config";

export class User {
  constructor(userData) {
    this.uid = userData.uid || null;
    this.email = userData.email || null;
    this.displayName = userData.displayName || null;
    this.photoURL = userData.photoURL || null;
    this.phoneNumber = userData.phoneNumber || null;
    this.providerId = userData.providerId || null;
    this.emailVerified = userData.emailVerified || false;
    this.user_type = userData.user_type || "resident";
    this.createdAt = userData.createdAt || new Date().toISOString();
  }

  // Create or update user in Firestore
  static async saveUser(userData) {
    const user = new User(userData);
    const userRef = doc(db, "users", user.uid);
    
    try {
      await setDoc(userRef, {
        ...user,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      return user;
    } catch (error) {
      console.error("Error saving user:", error);
      throw error;
    }
  }

  // Get user by UID
  static async getByUid(uid) {
    try {
      const userRef = doc(db, "users", uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return new User(userDoc.data());
      }
      return null;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  }

  // Check if user exists
  static async exists(uid) {
    try {
      const userRef = doc(db, "users", uid);
      const userDoc = await getDoc(userRef);
      return userDoc.exists();
    } catch (error) {
      console.error("Error checking user existence:", error);
      throw error;
    }
  }

  // Update user type
  static async updateUserType(uid, newUserType) {
    try {
      const userRef = doc(db, "users", uid);
      await setDoc(userRef, { 
        user_type: newUserType,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      return true;
    } catch (error) {
      console.error("Error updating user type:", error);
      throw error;
    }
  }
}