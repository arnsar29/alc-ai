import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert
} from '@mui/material';
import ShotEntry from './ShotEntry';

export default function HoleEntry({
  holeNumber,
  par,
  teeDistance,
  onHoleComplete,
  existingData
}) {
  // Initialize shots with existing data or default to tee shot
  const [shots, setShots] = useState(() => {
    if (existingData && existingData.length > 0) {
      console.log('Using existing data for shots:', existingData);
      return existingData;
    }
    return [{
      lieType: 'tee',
      distance: teeDistance,
      club: ''
    }];
  });

  // Only update if there's a change in hole number or existing data
  useEffect(() => {
    if (existingData && existingData.length > 0) {
      console.log('Restoring existing shots for hole:', holeNumber, existingData);
      setShots(existingData);
    } else if (!existingData || existingData.length === 0) {
      console.log('Setting new tee shot for hole:', holeNumber);
      setShots([{
        lieType: 'tee',
        distance: teeDistance,
        club: ''
      }]);
    }
  }, [holeNumber, existingData]); // Removed teeDistance from dependencies

  useEffect(() => {
    console.log('Current hole:', holeNumber);
    console.log('Existing data:', existingData);
    console.log('Current shots:', shots);
  }, [holeNumber, existingData, shots]);

  const validateShots = () => {
    // Check if any shots have invalid data
    const invalidShots = shots.filter(shot => 
      !shot.lieType || 
      !shot.distance || 
      (typeof shot.distance === 'string' && !/^\d+$/.test(shot.distance)) ||
      (typeof shot.distance === 'number' && shot.distance <= 0)
    );
    
    return invalidShots.length === 0;
  };

  const addShot = () => {
    // Validate existing shots before adding new one
    if (!validateShots()) {
      alert("Please complete all shot information before adding a new shot.");
      return;
    }
    
    const newShots = [...shots, { lieType: '', distance: '', club: '' }];
    setShots(newShots);
    
    // Auto-save when adding a shot
    onHoleComplete(holeNumber, newShots);
  };
  
  const deleteShot = (index) => {
    const newShots = shots.filter((_, i) => i !== index);
    setShots(newShots);
    
    // Auto-save when deleting a shot
    onHoleComplete(holeNumber, newShots);
  };

  const updateShot = (index, field, value) => {
    const newShots = [...shots];
    newShots[index] = { ...newShots[index], [field]: value };
    setShots(newShots);
    
    // Automatically save changes to parent component
    onHoleComplete(holeNumber, newShots);
  };

  return (
    <Paper sx={{ p: 3, my: 2 }}>
      <Typography variant="h6" gutterBottom>
        Hole {holeNumber} - Par {par}
      </Typography>
      
      {shots.map((shot, index) => (
        <ShotEntry
          key={index}
          shotNumber={index + 1}
          lieType={shot.lieType}
          distance={shot.distance}
          club={shot.club}
          onLieChange={(value) => updateShot(index, 'lieType', value)}
          onDistanceChange={(value) => updateShot(index, 'distance', value)}
          onClubChange={(value) => updateShot(index, 'club', value)}
          onDelete={() => deleteShot(index)}
          isFirstShot={index === 0}
          prefilledDistance={index === 0 ? teeDistance : null}
          isHoleCompleted={shots.length > 0}
        />
      ))}
      
      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        <Button 
          variant="outlined" 
          onClick={addShot}
        >
          Add Shot
        </Button>
      </Box>
    </Paper>
  );
}