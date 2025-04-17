// src/services/UserService.js

import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase.config.js";
import { User } from "../models/user.js"; // Adjust the import path as necessary

// Create or update user in Firestore
export const saveUser = async (userData) => {
  const user = new User(userData);
  const userRef = doc(db, "users", user.uid);

  try {
    await setDoc(
      userRef,
      {
        ...user.toJSON(),
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );

    return user;
  } catch (error) {
    console.error("Error saving user:", error);
    throw error;
  }
};

// Get user by UID
export const getUserByUid = async (uid) => {
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
};

// Get user type
export const getUserType = async (uid) => {
  try {
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const data = userDoc.data();
      return data.user_type || null;
    }
    return null;
  } catch (error) {
    console.error("Error getting user type:", error);
    throw error;
  }
};

// Check if user exists
export const userExists = async (uid) => {
  try {
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);
    return userDoc.exists();
  } catch (error) {
    console.error("Error checking user existence:", error);
    throw error;
  }
};

// Update user type
export const updateUserType = async (uid, newUserType) => {
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
};
