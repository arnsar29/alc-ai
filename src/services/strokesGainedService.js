// src/services/strokesGainedService.js
export const lieTypes = [
    { id: 'tee', name: 'Tee' },
    { id: 'fairway', name: 'Fairway' },
    { id: 'rough', name: 'Rough' },
    { id: 'bunker', name: 'Bunker/Sand' },
    { id: 'green', name: 'Green' },
    { id: 'recovery', name: 'Recovery' }, // New lie type
    // ... any other existing lie types
  ];
// Define the strokes gained table based on the data provided
const strokesGainedTable = [
    { distance: 10, tee: null, fairway: 2.18, rough: 2.34, bunker: 2.43, recovery: 3.45 },
    { distance: 20, tee: null, fairway: 2.40, rough: 2.59, bunker: 2.53, recovery: 3.51 },
    { distance: 30, tee: null, fairway: 2.52, rough: 2.70, bunker: 2.66, recovery: 3.57 },
    { distance: 40, tee: null, fairway: 2.60, rough: 2.78, bunker: 2.82, recovery: 3.71 },
    { distance: 50, tee: null, fairway: 2.66, rough: 2.87, bunker: 2.92, recovery: 3.79 },
    { distance: 60, tee: null, fairway: 2.70, rough: 2.91, bunker: 3.15, recovery: 3.83 },
    { distance: 70, tee: null, fairway: 2.72, rough: 2.93, bunker: 3.21, recovery: 3.84 },
    { distance: 80, tee: null, fairway: 2.75, rough: 2.96, bunker: 3.24, recovery: 3.84 },
    { distance: 90, tee: null, fairway: 2.77, rough: 2.99, bunker: 3.24, recovery: 3.82 },
    { distance: 100, tee: 2.92, fairway: 2.80, rough: 3.02, bunker: 3.23, recovery: 3.80 },
    { distance: 120, tee: 2.99, fairway: 2.85, rough: 3.08, bunker: 3.21, recovery: 3.78 },
    { distance: 140, tee: 2.97, fairway: 2.91, rough: 3.15, bunker: 3.22, recovery: 3.80 },
    { distance: 160, tee: 2.99, fairway: 2.98, rough: 3.23, bunker: 3.28, recovery: 3.81 },
    { distance: 180, tee: 3.05, fairway: 3.08, rough: 3.31, bunker: 3.40, recovery: 3.82 },
    { distance: 200, tee: 3.12, fairway: 3.19, rough: 3.42, bunker: 3.55, recovery: 3.87 },
    { distance: 220, tee: 3.17, fairway: 3.32, rough: 3.53, bunker: 3.70, recovery: 3.92 },
    { distance: 240, tee: 3.25, fairway: 3.45, rough: 3.64, bunker: 3.84, recovery: 3.97 },
    { distance: 260, tee: 3.45, fairway: 3.58, rough: 3.74, bunker: 3.93, recovery: 4.03 },
    { distance: 280, tee: 3.65, fairway: 3.69, rough: 3.83, bunker: 4.00, recovery: 4.10 },
    { distance: 300, tee: 3.71, fairway: 3.78, rough: 3.90, bunker: 4.04, recovery: 4.20 },
    { distance: 320, tee: 3.79, fairway: 3.84, rough: 3.95, bunker: 4.12, recovery: 4.31 },
    { distance: 340, tee: 3.86, fairway: 3.88, rough: 4.02, bunker: 4.26, recovery: 4.44 },
    { distance: 360, tee: 3.92, fairway: 3.95, rough: 4.11, bunker: 4.41, recovery: 4.56 },
    { distance: 380, tee: 3.96, fairway: 4.03, rough: 4.21, bunker: 4.55, recovery: 4.66 },
    { distance: 400, tee: 3.99, fairway: 4.11, rough: 4.30, bunker: 4.69, recovery: 4.75 },
    { distance: 420, tee: 4.02, fairway: 4.19, rough: 4.40, bunker: 4.83, recovery: 4.84 },
    { distance: 440, tee: 4.08, fairway: 4.27, rough: 4.49, bunker: 4.97, recovery: 4.94 },
    { distance: 460, tee: 4.17, fairway: 4.34, rough: 4.58, bunker: 5.11, recovery: 5.03 },
    { distance: 480, tee: 4.28, fairway: 4.42, rough: 4.68, bunker: 5.25, recovery: 5.13 },
    { distance: 500, tee: 4.41, fairway: 4.50, rough: 4.77, bunker: 5.40, recovery: 5.22 },
    { distance: 520, tee: 4.54, fairway: 4.58, rough: 4.87, bunker: 5.54, recovery: 5.32 },
    { distance: 540, tee: 4.65, fairway: 4.66, rough: 4.96, bunker: 5.68, recovery: 5.41 },
    { distance: 560, tee: 4.74, fairway: 4.74, rough: 5.06, bunker: 5.82, recovery: 5.51 },
    { distance: 580, tee: 4.79, fairway: 4.82, rough: 5.15, bunker: 5.96, recovery: 5.60 },
    { distance: 600, tee: 4.82, fairway: 4.89, rough: 5.25, bunker: 6.10, recovery: 5.70 }
  ];
  
  /**
   * Find the expected strokes based on distance and lie type
   * @param {number} distance - Distance to hole in yards
   * @param {string} lieType - Type of lie (tee, fairway, rough, bunker, recovery)
   * @returns {number} Expected strokes to hole out
   */
  const getExpectedStrokes = (distance, lieType) => {
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
    const closestRow = strokesGainedTable.reduce((prev, curr) => {
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
   * @returns {number} Strokes gained value
   */
  const calculateStrokesGained = (shot, nextShot) => {
    if (!shot || !shot.lieType || !shot.distance) {
      return 0;
    }
  
    // Expected strokes from current position
    const expectedStrokes = getExpectedStrokes(shot.distance, shot.lieType);
    
    // If this is the last shot (into the hole), strokes gained is expected - 1
    if (!nextShot) {
      return expectedStrokes - 1;
    }
    
    // Expected strokes from next position
    const nextExpectedStrokes = getExpectedStrokes(nextShot.distance, nextShot.lieType);
    
    // Strokes gained = expected - (next expected + 1)
    // The +1 accounts for the shot taken to get to the next position
    return expectedStrokes - (nextExpectedStrokes + 1);
  };
  
  /**
   * Calculate strokes gained for all shots in a round
   * @param {Object} round - The round data with holes and shots
   * @returns {Object} Strokes gained statistics for the round
   */
  const calculateRoundStrokesGained = (round) => {
    if (!round || !round.holes) {
      return {
        total: 0,
        byCategory: {
          tee: 0,
          approach: 0,
          around: 0,
          putting: 0
        }
      };
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
        const strokesGained = calculateStrokesGained(shot, nextShot);
        
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
    
    return {
      total: parseFloat(totalStrokesGained.toFixed(2)),
      byCategory: {
        tee: parseFloat(teeStrokesGained.toFixed(2)),
        approach: parseFloat(approachStrokesGained.toFixed(2)),
        around: parseFloat(aroundStrokesGained.toFixed(2)),
        putting: parseFloat(puttingStrokesGained.toFixed(2))
      }
    };
  };
  
  /**
   * Calculate strokes gained for multiple rounds with filtering options
   * @param {Array} rounds - Array of rounds
   * @param {Object} options - Filter options (timeframe, course, etc.)
   * @returns {Object} Aggregated strokes gained statistics
   */
  const calculateAggregateStrokesGained = (rounds, options = {}) => {
    if (!rounds || !rounds.length) {
      return {
        total: 0,
        byCategory: {
          tee: 0,
          approach: 0,
          around: 0,
          putting: 0
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
    const roundsData = filteredRounds.map(round => calculateRoundStrokesGained(round));
    
    // Aggregate the data
    const aggregate = roundsData.reduce((acc, curr) => {
      return {
        total: acc.total + curr.total,
        byCategory: {
          tee: acc.byCategory.tee + curr.byCategory.tee,
          approach: acc.byCategory.approach + curr.byCategory.approach,
          around: acc.byCategory.around + curr.byCategory.around,
          putting: acc.byCategory.putting + curr.byCategory.putting
        },
        rounds: acc.rounds + 1
      };
    }, { 
      total: 0, 
      byCategory: { tee: 0, approach: 0, around: 0, putting: 0 }, 
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
          putting: parseFloat((aggregate.byCategory.putting / aggregate.rounds).toFixed(2))
        }
      };
    }
    
    return aggregate;
  };
  
  export const strokesGainedService = {
    calculateStrokesGained,
    calculateRoundStrokesGained,
    calculateAggregateStrokesGained
  };