// src/scripts/initializeStrokesGainedTables.js
// Run this script once to initialize the strokes gained tables in Firebase

import { db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Constants
const SG_TABLES_COLLECTION = 'strokesGainedTables';
const HANDICAP_RANGES = ['<0', '0-5', '5-10', '10-15', '15-20', '20-25', '25+'];
const GENDERS = ['male', 'female'];

// Get the pro baseline table
const getProTable = () => {
  return [
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
};

// Generate an adjusted table for different handicap ranges
const generateTableForHandicap = (handicapRange, gender = 'male') => {
  const proTable = getProTable();
  
  if (handicapRange === '<0') {
    // Return the pro table for scratch or better players
    return proTable;
  }
  
  // Parse the handicap range to get a median value for adjustments
  let handicapValue;
  if (handicapRange === '25+') {
    handicapValue = 28; // Estimate for 25+ handicap
  } else {
    const [min, max] = handicapRange.split('-').map(Number);
    handicapValue = (min + max) / 2;
  }
  
  // Calculate adjustment factors based on research
  // Based on the fact that 90-golfers (18 handicap) have a steeper slope (0.66 vs 0.41)
  const distanceAdjustmentFactor = 1 + (handicapValue * 0.014); // 14% higher for 10 handicap
  
  // Higher handicaps struggle more with short game
  const shortGamePenalty = handicapValue * 0.02; // 0.2 strokes per 10 handicap points
  const puttingPenalty = handicapValue * 0.015; // 0.15 strokes per 10 handicap points
  
  // Generate adjusted table
  return proTable.map(entry => {
    // Get distance-based adjustment
    const distanceAdjustment = ((entry.distance / 100) * 0.25 * (distanceAdjustmentFactor - 1));
    
    // Different adjustments for different lies
    const adjustedEntry = { ...entry };
    
    // Tee shots - adjusted based on distance only
    if (adjustedEntry.tee !== null) {
      adjustedEntry.tee = adjustedEntry.tee + distanceAdjustment;
    }
    
    // Fairway - adjusted based on distance plus a small penalty
    adjustedEntry.fairway = adjustedEntry.fairway + distanceAdjustment + (handicapValue * 0.01);
    
    // Rough and sand - higher handicaps struggle more from difficult lies
    adjustedEntry.rough = adjustedEntry.rough + distanceAdjustment + (handicapValue * 0.015);
    adjustedEntry.bunker = adjustedEntry.bunker + distanceAdjustment + shortGamePenalty;
    
    // Recovery - significantly harder for higher handicaps
    adjustedEntry.recovery = adjustedEntry.recovery + distanceAdjustment + (shortGamePenalty * 1.5);
    
    // Round to 2 decimal places
    Object.keys(adjustedEntry).forEach(key => {
      if (key !== 'distance' && adjustedEntry[key] !== null) {
        adjustedEntry[key] = Math.round(adjustedEntry[key] * 100) / 100;
      }
    });
    
    return adjustedEntry;
  });
};

// Initialize all tables
export const initializeAllTables = async () => {
  try {
    console.log('Starting to initialize tables...');
    
    for (const gender of GENDERS) {
      for (const handicapRange of HANDICAP_RANGES) {
        console.log(`Initializing ${gender} ${handicapRange} table...`);
        
        const tableId = `${gender}_${handicapRange}`;
        const tableRef = doc(db, SG_TABLES_COLLECTION, tableId);
        
        const tableData = generateTableForHandicap(handicapRange, gender);
        
        await setDoc(tableRef, {
          tableData,
          gender,
          handicapRange,
          lastUpdated: serverTimestamp(),
          isDefault: true,
          sampleSize: 0,
          createdAt: serverTimestamp()
        });
        
        console.log(`Table ${tableId} initialized successfully.`);
      }
    }
    
    console.log('All tables initialized successfully!');
    return true;
  } catch (error) {
    console.error('Error initializing tables:', error);
    return false;
  }
};

// Execute if run directly
// To run this script:
// 1. Add a button in an admin panel
// 2. Or create a temporary button in a component
// 3. Or adjust to run from a Firebase Function
if (typeof window !== 'undefined') {
  window.initializeStrokesGainedTables = initializeAllTables;
  console.log('Initialization function registered as window.initializeStrokesGainedTables');
}

export default initializeAllTables;