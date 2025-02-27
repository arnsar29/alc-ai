// src/services/strokesGainedService.js
import { strokesGainedTablesService } from './strokesGainedTablesService';

// Cache for the currently loaded table
let currentTable = null;
let currentTableKey = null;

/**
 * Find the expected strokes based on distance and lie type
 * @param {number} distance - Distance to hole in yards
 * @param {string} lieType - Type of lie (tee, fairway, rough, bunker, recovery)
 * @param {Array} table - The strokes gained table to use
 * @returns {number} Expected strokes to hole out
 */
const getExpectedStrokes = (distance, lieType, table) => {
  // Handle green separately - putting model
  if (lieType === 'green') {
    // Simple putting model: 2 putts for distances > 20 feet, 1.5 putts for 10-20 feet, 1.1 for < 10 feet
    const distanceInFeet = distance * 3; // Convert yards to feet
    if (distanceInFeet < 10) return 1.1;
    if (distanceInFeet < 20) return 1.5;
    return 2.0;
  }

  // For other lies, use the strokes gained table
  // Find the closest distance in the table
  const closestRow = table.reduce((prev, curr) => {
    return (Math.abs(curr.distance - distance) < Math.abs(prev.distance - distance)) 
      ? curr 
      : prev;
  });

  // Return the expected strokes for the given lie type
  // Default to fairway if lieType is not found
  return closestRow[lieType] || closestRow.fairway;
};

/**
 * Calculate strokes gained for a shot
 * @param {Object} shot - The current shot
 * @param {Object} nextShot - The next shot (null if this is the last shot)
 * @param {Array} table - The strokes gained table to use
 * @returns {number} Strokes gained value
 */
const calculateStrokesGained = (shot, nextShot, table) => {
  if (!shot || !shot.lieType || !shot.distance) {
    return 0;
  }

  // Expected strokes from current position
  const expectedStrokes = getExpectedStrokes(shot.distance, shot.lieType, table);
  
  // If this is the last shot (into the hole), strokes gained is expected - 1
  if (!nextShot) {
    return expectedStrokes - 1;
  }
  
  // Expected strokes from next position
  const nextExpectedStrokes = getExpectedStrokes(nextShot.distance, nextShot.lieType, table);
  
  // Strokes gained = expected - (next expected + 1)
  // The +1 accounts for the shot taken to get to the next position
  return expectedStrokes - (nextExpectedStrokes + 1);
};

/**
 * Calculate strokes gained for all shots in a round
 * @param {Object} round - The round data with holes and shots
 * @param {Object} userProfile - The user profile 
 * @returns {Promise<Object>} Strokes gained statistics for the round
 */
const calculateRoundStrokesGained = async (round, userProfile) => {
  if (!round || !round.holes) {
    return {
      total: 0,
      byCategory: {
        tee: 0,
        approach: 0,
        around: 0,
        putting: 0,
        teeToGreen: 0
      }
    };
  }

  // Get the appropriate strokes gained table
  const gender = userProfile?.gender || 'male';
  const handicapRange = userProfile?.getHandicapRange() || '10-15'; // Default to mid-handicap
  
  // Check if we need to load a new table
  const tableKey = `${gender}_${handicapRange}`;
  if (currentTableKey !== tableKey || !currentTable) {
    currentTable = await strokesGainedTablesService.getTable(gender, handicapRange);
    currentTableKey = tableKey;
  }

  let totalStrokesGained = 0;
  let teeStrokesGained = 0;
  let approachStrokesGained = 0;
  let aroundStrokesGained = 0;
  let puttingStrokesGained = 0;
  
  // Process each hole
  Object.values(round.holes).forEach(shots => {
    // Calculate strokes gained for each shot
    shots.forEach((shot, index) => {
      const nextShot = index < shots.length - 1 ? shots[index + 1] : null;
      const strokesGained = calculateStrokesGained(shot, nextShot, currentTable);
      
      // Categorize the shot
      if (shot.lieType === 'tee') {
        teeStrokesGained += strokesGained;
      } else if (shot.lieType === 'green') {
        puttingStrokesGained += strokesGained;
      } else if (shot.distance > 50) {
        approachStrokesGained += strokesGained;
      } else {
        aroundStrokesGained += strokesGained;
      }
      
      totalStrokesGained += strokesGained;
    });
  });

  // Calculate tee-to-green (all strokes gained minus putting)
  const teeToGreen = teeStrokesGained + approachStrokesGained + aroundStrokesGained;
  
  return {
    total: parseFloat(totalStrokesGained.toFixed(2)),
    byCategory: {
      tee: parseFloat(teeStrokesGained.toFixed(2)),
      approach: parseFloat(approachStrokesGained.toFixed(2)),
      around: parseFloat(aroundStrokesGained.toFixed(2)),
      putting: parseFloat(puttingStrokesGained.toFixed(2)),
      teeToGreen: parseFloat(teeToGreen.toFixed(2))
    }
  };
};

/**
 * Calculate strokes gained for multiple rounds with filtering options
 * @param {Array} rounds - Array of rounds
 * @param {Object} userProfile - The user profile
 * @param {Object} options - Filter options (timeframe, course, etc.)
 * @returns {Promise<Object>} Aggregated strokes gained statistics
 */
const calculateAggregateStrokesGained = async (rounds, userProfile, options = {}) => {
  if (!rounds || !rounds.length) {
    return {
      total: 0,
      byCategory: {
        tee: 0,
        approach: 0,
        around: 0,
        putting: 0,
        teeToGreen: 0
      },
      rounds: 0
    };
  }
  
  // Filter rounds based on options
  let filteredRounds = [...rounds];
  
  // Filter by timeframe
  if (options.timeframe) {
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (options.timeframe) {
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case '6months':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    filteredRounds = filteredRounds.filter(round => {
      const roundDate = new Date(round.dateCreated);
      return roundDate >= cutoffDate;
    });
  }
  
  // Filter by course
  if (options.courseId) {
    filteredRounds = filteredRounds.filter(round => round.courseId === options.courseId);
  }
  
  // Calculate strokes gained for each round
  const roundsData = await Promise.all(
    filteredRounds.map(round => calculateRoundStrokesGained(round, userProfile))
  );
  
  // Aggregate the data
  const aggregate = roundsData.reduce((acc, curr) => {
    return {
      total: acc.total + curr.total,
      byCategory: {
        tee: acc.byCategory.tee + curr.byCategory.tee,
        approach: acc.byCategory.approach + curr.byCategory.approach,
        around: acc.byCategory.around + curr.byCategory.around,
        putting: acc.byCategory.putting + curr.byCategory.putting,
        teeToGreen: acc.byCategory.teeToGreen + curr.byCategory.teeToGreen
      },
      rounds: acc.rounds + 1
    };
  }, { 
    total: 0, 
    byCategory: { tee: 0, approach: 0, around: 0, putting: 0, teeToGreen: 0 }, 
    rounds: 0 
  });
  
  // Calculate averages
  if (aggregate.rounds > 0) {
    aggregate.average = {
      total: parseFloat((aggregate.total / aggregate.rounds).toFixed(2)),
      byCategory: {
        tee: parseFloat((aggregate.byCategory.tee / aggregate.rounds).toFixed(2)),
        approach: parseFloat((aggregate.byCategory.approach / aggregate.rounds).toFixed(2)),
        around: parseFloat((aggregate.byCategory.around / aggregate.rounds).toFixed(2)),
        putting: parseFloat((aggregate.byCategory.putting / aggregate.rounds).toFixed(2)),
        teeToGreen: parseFloat((aggregate.byCategory.teeToGreen / aggregate.rounds).toFixed(2))
      }
    };
  }
  
  return aggregate;
};

/**
 * Record shot data for future table updates
 * @param {Object} shot - The shot data
 * @param {Object} nextShot - The next shot (null if this is the last shot)
 * @param {string} gender - User gender
 * @param {string} handicapRange - User handicap range
 * @returns {Promise<void>}
 */
const recordShotData = async (shot, nextShot, gender, handicapRange) => {
  // This would be implemented to collect data for future table updates
  // For now, we'll leave this as a placeholder
  // In a real implementation, this would store data in a separate collection
  console.log('Recording shot data for future table updates');
};

/**
 * Clear the table cache
 */
const clearTableCache = () => {
  currentTable = null;
  currentTableKey = null;
};

export const strokesGainedService = {
  calculateStrokesGained: async (shot, nextShot, userProfile) => {
    // Get appropriate table
    const gender = userProfile?.gender || 'male';
    const handicapRange = userProfile?.getHandicapRange() || '10-15';
    
    // Load table if needed
    const tableKey = `${gender}_${handicapRange}`;
    if (currentTableKey !== tableKey || !currentTable) {
      currentTable = await strokesGainedTablesService.getTable(gender, handicapRange);
      currentTableKey = tableKey;
    }
    
    return calculateStrokesGained(shot, nextShot, currentTable);
  },
  calculateRoundStrokesGained,
  calculateAggregateStrokesGained,
  recordShotData,
  clearTableCache
};