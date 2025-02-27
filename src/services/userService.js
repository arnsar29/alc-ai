// src/services/userService.js
import { db } from '../firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { UserProfile } from '../models/UserProfile';

const USERS_COLLECTION = 'users';

/**
 * Service for managing user profiles
 */
export const userService = {
  /**
   * Get a user profile by ID
   * @param {string} userId - The user ID
   * @returns {Promise<UserProfile|null>} The user profile or null if not found
   */
  getUserProfile: async (userId) => {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      const userDoc = await getDoc(userRef);
      return UserProfile.fromFirestore(userDoc);
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  },

  /**
   * Create or update a user profile
   * @param {string} userId - The user ID
   * @param {UserProfile} profileData - The profile data to save
   * @returns {Promise<UserProfile>} The updated user profile
   */
  saveUserProfile: async (userId, profileData) => {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        // Update existing profile
        await updateDoc(userRef, profileData.toFirestore());
      } else {
        // Create new profile
        await setDoc(userRef, profileData.toFirestore());
      }
      
      return new UserProfile({
        id: userId,
        ...profileData.toFirestore()
      });
    } catch (error) {
      console.error('Error saving user profile:', error);
      throw error;
    }
  },

  /**
   * Update user handicap
   * @param {string} userId - The user ID
   * @param {number} handicap - The new handicap value
   * @returns {Promise<void>}
   */
  updateHandicap: async (userId, handicap) => {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      await updateDoc(userRef, { 
        handicap, 
        updatedAt: new Date().toISOString() 
      });
    } catch (error) {
      console.error('Error updating handicap:', error);
      throw error;
    }
  },

  /**
   * Get user count by handicap range and gender
   * Used for analytics and table generation
   */
  getUserCountByHandicapAndGender: async (handicapRange, gender) => {
    try {
      const usersRef = collection(db, USERS_COLLECTION);
      
      // Define handicap range boundaries
      let minHandicap, maxHandicap;
      switch (handicapRange) {
        case '<0':
          minHandicap = -100; // Arbitrary low number
          maxHandicap = 0;
          break;
        case '0-5':
          minHandicap = 0;
          maxHandicap = 5;
          break;
        case '5-10':
          minHandicap = 5;
          maxHandicap = 10;
          break;
        case '10-15':
          minHandicap = 10;
          maxHandicap = 15;
          break;
        case '15-20':
          minHandicap = 15;
          maxHandicap = 20;
          break;
        case '20-25':
          minHandicap = 20;
          maxHandicap = 25;
          break;
        case '25+':
          minHandicap = 25;
          maxHandicap = 100; // Arbitrary high number
          break;
        default:
          throw new Error(`Invalid handicap range: ${handicapRange}`);
      }
      
      const q = query(
        usersRef, 
        where('gender', '==', gender),
        where('handicap', '>=', minHandicap),
        where('handicap', '<', maxHandicap)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      console.error('Error getting user count:', error);
      return 0;
    }
  }
};