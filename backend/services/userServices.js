// src/services/UserService.js

import { db } from "../firebase/firebase.config.js";
import { User } from "../models/user.js"; // Adjust the import path as necessary
import { doc,getDoc,setDoc}from "firebase/firestore";

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

//Admin-functions:

//onboard member
export const createAccountRequest = async (formData) => {
  const url = 'https://us-central1-facilty-pro.cloudfunctions.net/api/create-account';

  const payload = {
    email: formData.email,
    password: formData.password,
    displayName: formData.name,
    user_type: formData.user_type
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorResponse = await response.json();
    console.error("Error response:", errorResponse);
    throw new Error(errorResponse.error);
  }

  return true;
};


//delete user
export const deleteAccount = async (uid) => {
  console.log("deleteAccount function hit", uid);
  const url = `https://us-central1-facilty-pro.cloudfunctions.net/api/delete-account/${uid}`;

  const response = await fetch(url, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorResponse = await response.json();
    console.error("Delete account error:", errorResponse);
    throw new Error(errorResponse.error);
  }

  return true;
};

//fetch users
export const fetchAllUsers = async () => {
  const url = 'https://us-central1-facilty-pro.cloudfunctions.net/api/get-all-users';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  const users = await response.json();
  return users;
};


//update a user
export const updateUserType = async (uid, newUserType) => {
  const url = 'https://us-central1-facilty-pro.cloudfunctions.net/api/update-user-type';
  const payload = {
    uid,
    newType: newUserType,
  };

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorResponse = await response.json();
    throw new Error(errorResponse.error || 'Failed to update user type');
  }

  return true;
};

export const fetchUser = async (uid) => {
  const url = `https://us-central1-facilty-pro.cloudfunctions.net/api/get-user/${uid}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }

  const user = await response.json();
  return user;
};

