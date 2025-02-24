// Simple data structure for local storage
const STORAGE_KEY = 'stroke_iq_rounds';

export const roundsService = {
  // Get all rounds for a user
  getAllRounds: (userId = 'dev_user') => {
    const allRounds = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return allRounds[userId] || [];
  },

  // Save a new round
  saveRound: (roundData, userId = 'dev_user') => {
    const allRounds = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const userRounds = allRounds[userId] || [];
    
    const newRound = {
      id: Date.now(), // Simple unique ID for development
      userId,
      dateCreated: new Date().toISOString(),
      ...roundData
    };

    userRounds.push(newRound);
    allRounds[userId] = userRounds;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allRounds));
    return newRound;
  },

  // Update existing round
  updateRound: (roundId, updatedData, userId = 'dev_user') => {
    const allRounds = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const userRounds = allRounds[userId] || [];
    
    const updatedRounds = userRounds.map(round => 
      round.id === roundId ? { ...round, ...updatedData } : round
    );

    allRounds[userId] = updatedRounds;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allRounds));
    return updatedRounds.find(r => r.id === roundId);
  },

  // Delete a round
  deleteRound: (roundId, userId = 'dev_user') => {
    const allRounds = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const userRounds = allRounds[userId] || [];
    
    allRounds[userId] = userRounds.filter(round => round.id !== roundId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allRounds));
  }
};