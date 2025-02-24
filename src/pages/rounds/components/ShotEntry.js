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
  Tooltip
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
  isHoleCompleted = false // New prop to track if hole is completed
}) {
  const [useCustomDistance, setUseCustomDistance] = useState(false);
  const [localDistance, setLocalDistance] = useState(distance || '');

  // Reset custom distance state when prefilledDistance changes
  useEffect(() => {
    // If hole is not completed and it's the first shot, reset custom distance
    if (isFirstShot && !isHoleCompleted) {
      setUseCustomDistance(false);
      setLocalDistance(prefilledDistance || '');
    }
  }, [prefilledDistance, isFirstShot, isHoleCompleted]);

  const handleDistanceChange = (e) => {
    const newDistance = e.target.value;
    
    // If it's the first shot, mark as custom distance
    if (isFirstShot) {
      setUseCustomDistance(true);
    }
    
    // Update local state and inform parent
    setLocalDistance(newDistance);
    onDistanceChange(newDistance);
  };

  // Determine which distance to display
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
          <FormControl fullWidth>
            <InputLabel>Lie</InputLabel>
            <Select
              value={lieType || ''}
              label="Lie"
              onChange={(e) => onLieChange(e.target.value)}
            >
              {lieTypes.map((lie) => (
                <MenuItem key={lie.id} value={lie.id}>
                  {lie.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Distance to Hole (yards)"
            type="number"
            value={displayDistance}
            onChange={handleDistanceChange}
            helperText={
              isFirstShot && prefilledDistance !== null && !useCustomDistance
                ? "Default distance from tee"
                : ""
            }
            InputProps={{
              style: { 
                // Ensure helper text is visible and doesn't overlap
                position: 'relative' 
              }
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