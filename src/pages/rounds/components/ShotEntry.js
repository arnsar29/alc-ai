import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Typography,
  IconButton,
  Tooltip,
  FormHelperText
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { lieTypes, clubTypes } from '../../../data/courses';

export default function ShotEntry({
  shotNumber,
  distance,
  onDistanceChange,
  lieType,
  onLieChange,
  club,
  onClubChange,
  isFirstShot = false,
  prefilledDistance = null,
  onDelete,
  isHoleCompleted = false
}) {
  const [distanceError, setDistanceError] = useState(false);
  const [lieError, setLieError] = useState(false);
  const [useCustomDistance, setUseCustomDistance] = useState(false);
  const [localDistance, setLocalDistance] = useState(distance || '');

  // Reset custom distance state when prefilledDistance changes
  useEffect(() => {
    if (isFirstShot && !isHoleCompleted) {
      setUseCustomDistance(false);
      setLocalDistance(prefilledDistance || '');
    }
  }, [prefilledDistance, isFirstShot, isHoleCompleted]);

  useEffect(() => {
    if (distance !== localDistance) {
      setLocalDistance(distance || '');
    }
  }, [distance, localDistance]);

  const handleDistanceChange = (e) => {
    const value = e.target.value;
    
    // Check if value is a valid positive number
    const isValid = /^\d+$/.test(value) && parseInt(value, 10) > 0;
    
    // Update error state
    setDistanceError(!isValid && value !== '');
    
    // If it's the first shot, mark as custom distance
    if (isFirstShot) {
      setUseCustomDistance(true);
    }
    
    // Update local state
    setLocalDistance(value);
    
    // Only inform parent if value is valid or empty
    if ((isValid || value === '') && onDistanceChange) {
      onDistanceChange(value === '' ? '' : parseInt(value, 10));
    }
  };

  const handleLieBlur = () => {
    setLieError(!lieType);
  };

  // Calculate display distance within the render function
  const displayDistance = 
    isFirstShot && !useCustomDistance && prefilledDistance !== null 
      ? prefilledDistance 
      : localDistance;

  return (
    <Box sx={{ my: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1">
          Shot {shotNumber}
        </Typography>
        {shotNumber > 1 && (
          <Tooltip title="Delete shot">
            <IconButton onClick={onDelete} size="small" color="error">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth error={lieError}>
            <InputLabel>Lie</InputLabel>
            <Select
              value={lieType || ''}
              label="Lie"
              onChange={(e) => {
                setLieError(false); // Clear error when value changes
                onLieChange(e.target.value);
              }}
              onBlur={handleLieBlur}
            >
              {lieTypes.map((lie) => (
                <MenuItem key={lie.id} value={lie.id}>
                  {lie.name}
                </MenuItem>
              ))}
            </Select>
            {lieError && (
              <FormHelperText>Select which lie you played this shot from</FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Distance to Hole (yards)"
            type="number"
            value={displayDistance}
            onChange={handleDistanceChange}
            error={distanceError}
            helperText={distanceError ? "Please enter a positive number" : ""}
            inputProps={{ 
              min: 1
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Club (Optional)</InputLabel>
            <Select
              value={club || ''}
              label="Club (Optional)"
              onChange={(e) => onClubChange(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {clubTypes.map((club) => (
                <MenuItem key={club.id} value={club.id}>
                  {club.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
}