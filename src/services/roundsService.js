import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  deleteDoc, 
  updateDoc, 
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

  updateRound: async (roundId, updatedData, userId = 'dev_user') => {
    try {
      const roundRef = doc(db, ROUNDS_COLLECTION, roundId);
      await updateDoc(roundRef, updatedData);
      return { id: roundId, ...updatedData };
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