// Firebase Cloud Functions - functions/src/updateStrokesGainedTables.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Constants
const ROUNDS_COLLECTION = 'rounds';
const SG_TABLES_COLLECTION = 'strokesGainedTables';
const HANDICAP_RANGES = ['<0', '0-5', '5-10', '10-15', '15-20', '20-25', '25+'];
const GENDERS = ['male', 'female'];

// Get handicap range for a given handicap value
function getHandicapRange(handicap) {
  if (handicap < 0) return '<0';
  if (handicap < 5) return '0-5';
  if (handicap < 10) return '5-10';
  if (handicap < 15) return '10-15';
  if (handicap < 20) return '15-20';
  if (handicap < 25) return '20-25';
  return '25+';
}

// Get expected strokes from a position based on a table
function getExpectedStrokes(distance, lieType, table) {
  // Handle green separately - simple putting model
  if (lieType === 'green') {
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

  // Return the expected strokes for the given lie type (or default to fairway)
  return closestRow[lieType] || closestRow.fairway;
}

// Calculate average strokes to hole out from various positions
async function calculateAverageStrokes(rounds, gender, handicapRange) {
  // Initialize data structure to collect shot data
  // For each distance/lie combination, collect total strokes and count
  const shotData = {};
  
  // Process each round
  for (const round of rounds) {
    const holes = round.holes || {};
    
    // Process each hole
    Object.values(holes).forEach(shots => {
      // Process each shot
      shots.forEach((shot, index) => {
        if (!shot.lieType || !shot.distance) return;
        
        // Round distance to nearest bucket (10, 20, 30, etc.)
        const distance = Math.round(shot.distance / 10) * 10;
        const lieType = shot.lieType;
        
        // Create key for this distance/lie combination
        const key = `${distance}_${lieType}`;
        
        // Initialize if not exists
        if (!shotData[key]) {
          shotData[key] = {
            distance,
            lieType,
            totalStrokes: 0,
            count: 0
          };
        }
        
        // Calculate strokes to hole out from this position
        let strokesToHoleOut = shots.length - index;
        
        // Add to totals
        shotData[key].totalStrokes += strokesToHoleOut;
        shotData[key].count += 1;
      });
    });
  }
  
  // Calculate averages and format for table structure
  const distanceBuckets = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 120, 140, 160, 
                           180, 200, 220, 240, 260, 280, 300, 320, 340, 360, 380,
                           400, 420, 440, 460, 480, 500, 520, 540, 560, 580, 600];
  
  // Get existing table to use as a baseline
  const tableId = `${gender}_${handicapRange}`;
  const tableDoc = await db.collection(SG_TABLES_COLLECTION).doc(tableId).get();
  let existingTable = [];
  
  if (tableDoc.exists) {
    existingTable = tableDoc.data().tableData || [];
  } else {
    // Get baseline pro table from the scratch golfer category
    const proTableDoc = await db.collection(SG_TABLES_COLLECTION).doc(`${gender}_<0`).get();
    if (proTableDoc.exists) {
      existingTable = proTableDoc.data().tableData || [];
    } else {
      // Fallback to empty array with distance buckets
      existingTable = distanceBuckets.map(distance => ({
        distance,
        tee: null,
        fairway: null,
        rough: null,
        bunker: null,
        recovery: null
      }));
    }
  }
  
  // For each distance bucket and lie type, update the table with new data if available
  const newTable = existingTable.map(row => {
    const newRow = { ...row };
    const distance = row.distance;
    
    // For each lie type, check if we have new data
    ['tee', 'fairway', 'rough', 'bunker', 'recovery'].forEach(lieType => {
      const key = `${distance}_${lieType}`;
      if (shotData[key] && shotData[key].count >= 5) {
        // We have enough data points (minimum 5) to consider updating
        const avgStrokes = shotData[key].totalStrokes / shotData[key].count;
        
        // Blend with existing data - 30% new data, 70% existing
        // This prevents radical changes from small sample sizes
        if (newRow[lieType] !== null) {
          newRow[lieType] = parseFloat((0.7 * newRow[lieType] + 0.3 * avgStrokes).toFixed(2));
        } else {
          newRow[lieType] = parseFloat(avgStrokes.toFixed(2));
        }
      }
    });
    
    return newRow;
  });
  
  // Ensure table consistency across handicap ranges
  // Higher handicaps should never have better expected strokes than lower handicaps
  if (handicapRange !== '<0') {
    // Get the next lower handicap range
    const ranges = HANDICAP_RANGES;
    const currentIndex = ranges.indexOf(handicapRange);
    
    if (currentIndex > 0) {
      const lowerHandicapRange = ranges[currentIndex - 1];
      const lowerTableId = `${gender}_${lowerHandicapRange}`;
      const lowerTableDoc = await db.collection(SG_TABLES_COLLECTION).doc(lowerTableId).get();
      
      if (lowerTableDoc.exists) {
        const lowerTable = lowerTableDoc.data().tableData || [];
        
        // Ensure no value is better (lower) than the corresponding value in the lower handicap table
        newTable.forEach((row, i) => {
          if (i < lowerTable.length) {
            const lowerRow = lowerTable[i];
            
            ['tee', 'fairway', 'rough', 'bunker', 'recovery'].forEach(lieType => {
              if (row[lieType] !== null && lowerRow[lieType] !== null && row[lieType] < lowerRow[lieType]) {
                // If better than lower handicap, set to at least equal to lower handicap
                row[lieType] = parseFloat((lowerRow[lieType] + 0.03).toFixed(2));
              }
            });
          }
        });
      }
    }
  }
  
  return newTable;
}

// Main Cloud Function that runs on a schedule (daily)
exports.updateStrokesGainedTables = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    try {
      console.log('Starting daily update of strokes gained tables');
      
      // Get all rounds from the past 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const roundsSnapshot = await db.collection(ROUNDS_COLLECTION)
        .where('dateCreated', '>=', sixMonthsAgo.toISOString())
        .get();
      
      if (roundsSnapshot.empty) {
        console.log('No rounds found in the past 6 months');
        return null;
      }
      
      console.log(`Found ${roundsSnapshot.size} rounds to analyze`);
      
      // Group rounds by gender and handicap range
      const roundGroups = {};
      
      roundsSnapshot.forEach(doc => {
        const round = doc.data();
        if (!round.handicap || !round.gender) return;
        
        const gender = round.gender;
        const handicapRange = getHandicapRange(round.handicap);
        
        const key = `${gender}_${handicapRange}`;
        if (!roundGroups[key]) {
          roundGroups[key] = [];
        }
        
        roundGroups[key].push(round);
      });
      
      // Process each group and update tables
      for (const [key, rounds] of Object.entries(roundGroups)) {
        if (rounds.length < 10) {
          console.log(`Skipping ${key} due to insufficient data (${rounds.length} rounds)`);
          continue;
        }
        
        const [gender, handicapRange] = key.split('_');
        console.log(`Processing ${rounds.length} rounds for ${gender} ${handicapRange}`);
        
        // Calculate new table data
        const newTable = await calculateAverageStrokes(rounds, gender, handicapRange);
        
        // Update the table in Firestore
        await db.collection(SG_TABLES_COLLECTION).doc(key).set({
          tableData: newTable,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
          gender,
          handicapRange,
          sampleSize: rounds.length,
          updatedBy: 'system'
        }, { merge: true });
        
        console.log(`Updated table for ${gender} ${handicapRange}`);
      }
      
      console.log('Completed updating strokes gained tables');
      return null;
    } catch (error) {
      console.error('Error updating strokes gained tables:', error);
      return null;
    }
  });

// Function to manually initialize tables with baseline values
exports.initializeStrokesGainedTables = functions.https.onCall(async (data, context) => {
  // Check if request is from an admin
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can initialize tables'
    );
  }

  try {
    console.log('Initializing strokes gained tables with baseline values');
    
    // Get the pro baseline table
    const proTablePath = `${data.gender || 'male'}_<0`;
    const proTableDoc = await db.collection(SG_TABLES_COLLECTION).doc(proTablePath).get();
    
    if (!proTableDoc.exists) {
      throw new Error('Pro table not found. Please create it first.');
    }
    
    const proTable = proTableDoc.data().tableData;
    
    // For each handicap range, create adjusted tables
    for (const handicapRange of HANDICAP_RANGES) {
      if (handicapRange === '<0') continue; // Skip pro table, already exists
      
      console.log(`Creating table for ${data.gender || 'male'} ${handicapRange}`);
      
      // Parse the handicap range to get a median value for adjustments
      let handicapValue;
      if (handicapRange === '25+') {
        handicapValue = 28; // Estimate for 25+ handicap
      } else {
        const [min, max] = handicapRange.split('-').map(Number);
        handicapValue = (min + max) / 2;
      }
      
      // Calculate adjustment factors based on research
      const distanceAdjustmentFactor = 1 + (handicapValue * 0.014);
      const shortGamePenalty = handicapValue * 0.02;
      const puttingPenalty = handicapValue * 0.015;
      
      // Generate adjusted table
      const adjustedTable = proTable.map(entry => {
        const distanceAdjustment = ((entry.distance / 100) * 0.25 * (distanceAdjustmentFactor - 1));
        
        const adjustedEntry = { ...entry };
        
        if (adjustedEntry.tee !== null) {
          adjustedEntry.tee = adjustedEntry.tee + distanceAdjustment;
        }
        
        adjustedEntry.fairway = adjustedEntry.fairway + distanceAdjustment + (handicapValue * 0.01);
        adjustedEntry.rough = adjustedEntry.rough + distanceAdjustment + (handicapValue * 0.015);
        adjustedEntry.bunker = adjustedEntry.bunker + distanceAdjustment + shortGamePenalty;
        adjustedEntry.recovery = adjustedEntry.recovery + distanceAdjustment + (shortGamePenalty * 1.5);
        
        // Round to 2 decimal places
        Object.keys(adjustedEntry).forEach(key => {
          if (key !== 'distance' && adjustedEntry[key] !== null) {
            adjustedEntry[key] = Math.round(adjustedEntry[key] * 100) / 100;
          }
        });
        
        return adjustedEntry;
      });
      
      // Save the table
      const tableId = `${data.gender || 'male'}_${handicapRange}`;
      await db.collection(SG_TABLES_COLLECTION).doc(tableId).set({
        tableData: adjustedTable,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        gender: data.gender || 'male',
        handicapRange,
        isDefault: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    console.log('Successfully initialized all tables');
    return { success: true };
  } catch (error) {
    console.error('Error initializing tables:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});