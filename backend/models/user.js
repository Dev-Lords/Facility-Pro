
// src/models/User.js

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

  toJSON() {
    return {
      uid: this.uid,
      email: this.email,
      displayName: this.displayName,
      photoURL: this.photoURL,
      phoneNumber: this.phoneNumber,
      providerId: this.providerId,
      emailVerified: this.emailVerified,
      user_type: this.user_type,
      createdAt: this.createdAt
    };
  }
}
