// src/models/UserProfile.js

/**
 * User profile model with fields for golf-specific information
 */
export class UserProfile {
    constructor({
      id = '',
      displayName = '',
      email = '',
      photoURL = '',
      handicap = null,
      gender = null,
      preferredTee = null,
      homeClub = '',
      createdAt = new Date().toISOString(),
      updatedAt = new Date().toISOString()
    } = {}) {
      this.id = id;
      this.displayName = displayName;
      this.email = email;
      this.photoURL = photoURL;
      this.handicap = handicap;
      this.gender = gender;
      this.preferredTee = preferredTee;
      this.homeClub = homeClub;
      this.createdAt = createdAt;
      this.updatedAt = updatedAt;
    }
  
    /**
     * Get the handicap range bucket for this user
     * @returns {string} Handicap range (e.g., '0-5', '5-10', etc.)
     */
    getHandicapRange() {
      if (this.handicap === null) return null;
      
      if (this.handicap < 0) return '<0';
      if (this.handicap < 5) return '0-5';
      if (this.handicap < 10) return '5-10';
      if (this.handicap < 15) return '10-15';
      if (this.handicap < 20) return '15-20';
      if (this.handicap < 25) return '20-25';
      return '25+';
    }
  
    /**
     * Convert to a plain object for Firestore
     */
    toFirestore() {
      return {
        displayName: this.displayName,
        email: this.email,
        photoURL: this.photoURL,
        handicap: this.handicap,
        gender: this.gender,
        preferredTee: this.preferredTee,
        homeClub: this.homeClub,
        createdAt: this.createdAt,
        updatedAt: new Date().toISOString()
      };
    }
  
    /**
     * Create from Firestore document
     */
    static fromFirestore(doc) {
      if (!doc || !doc.exists) {
        return null;
      }
      
      const data = doc.data();
      return new UserProfile({
        id: doc.id,
        ...data
      });
    }
  }