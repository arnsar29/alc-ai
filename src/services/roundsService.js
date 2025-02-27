import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  deleteDoc, 
  updateDoc, 
  getDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';

const ROUNDS_COLLECTION = 'rounds';

export const roundsService = {
  getAllRounds: async (userId = 'dev_user') => {
    try {
      const roundsRef = collection(db, ROUNDS_COLLECTION);
      const q = query(roundsRef, orderBy('dateCreated', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting rounds:', error);
      return [];
    }
  },

  saveRound: async (roundData, userId = 'dev_user') => {
    try {
      const roundsRef = collection(db, ROUNDS_COLLECTION);
      const newRound = {
        userId,
        dateCreated: new Date().toISOString(),
        ...roundData
      };
      
      const docRef = await addDoc(roundsRef, newRound);
      return {
        id: docRef.id,
        ...newRound
      };
    } catch (error) {
      console.error('Error saving round:', error);
      throw error;
    }
  },

// Add this to roundsService.js to the getRoundById function:
getRoundById: async (id) => {
  try {
    console.log('roundsService - Getting round with ID:', id);
    const roundRef = doc(db, ROUNDS_COLLECTION, id);
    const roundDoc = await getDoc(roundRef);
    
    if (!roundDoc.exists()) {
      console.log('roundsService - Round not found for ID:', id);
      throw new Error('Round not found');
    }
    
    const data = {
      id: roundDoc.id,
      ...roundDoc.data()
    };
    console.log('roundsService - Successfully retrieved round data:', data);
    return data;
  } catch (error) {
    console.error('roundsService - Error getting round by ID:', error);
    throw error;
  }
},

  updateRound: async (id, data) => {
    try {
      const roundRef = doc(db, ROUNDS_COLLECTION, id);
      await updateDoc(roundRef, data);
      return {
        id,
        ...data
      };
    } catch (error) {
      console.error('Error updating round:', error);
      throw error;
    }
  },

  deleteRound: async (roundId) => {
    try {
      const roundRef = doc(db, ROUNDS_COLLECTION, roundId);
      await deleteDoc(roundRef);
    } catch (error) {
      console.error('Error deleting round:', error);
      throw error;
    }
  }
};