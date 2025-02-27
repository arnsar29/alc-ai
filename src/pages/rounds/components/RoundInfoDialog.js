// src/pages/rounds/components/RoundInfoDialog.js
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import { userService } from '../../../services/userService';
import { UserProfile } from '../../../models/UserProfile';
import { useAuth } from '../../../context/AuthContext';

export default function RoundInfoDialog({ open, onClose, onConfirm }) {
  const { currentUser } = useAuth();
  
  const [roundInfo, setRoundInfo] = useState({
    handicap: '',
    gender: '',
    weather: '',
    notes: ''
  });
  
  const [loading, setLoading] = useState(true);
  
  // Load user profile on first render
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const userProfile = await userService.getUserProfile(currentUser.uid);
        if (userProfile) {
          setRoundInfo(prev => ({
            ...prev,
            handicap: userProfile.handicap || '',
            gender: userProfile.gender || ''
          }));
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (open) {
      loadUserProfile();
    }
  }, [currentUser, open]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setRoundInfo(prev => ({
      ...prev,
      [name]: name === 'handicap' ? (value === '' ? '' : parseFloat(value)) : value
    }));
  };
  
  const handleSubmit = async () => {
    // If the user has changed their handicap, update their profile
    if (currentUser && roundInfo.handicap !== '') {
      try {
        await userService.updateHandicap(currentUser.uid, roundInfo.handicap);
      } catch (error) {
        console.error('Error updating handicap:', error);
      }
    }
    
    // Pass the round info to parent component
    onConfirm(roundInfo);
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Round Information</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Please provide your current handicap and other details about this round. 
              This helps us calculate more accurate statistics for you.
            </Typography>
            
            <TextField
              fullWidth
              label="Current Handicap"
              name="handicap"
              type="number"
              value={roundInfo.handicap}
              onChange={handleChange}
              inputProps={{ step: 0.1, min: -10, max: 54 }}
              required
              sx={{ mb: 3 }}
              helperText="What is your current handicap index?"
            />
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="gender-label">Gender</InputLabel>
              <Select
                labelId="gender-label"
                name="gender"
                value={roundInfo.gender}
                label="Gender"
                onChange={handleChange}
                required
              >
                <MenuItem value="">
                  <em>Select gender</em>
                </MenuItem>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="weather-label">Weather Conditions</InputLabel>
              <Select
                labelId="weather-label"
                name="weather"
                value={roundInfo.weather}
                label="Weather Conditions"
                onChange={handleChange}
              >
                <MenuItem value="">
                  <em>Select conditions</em>
                </MenuItem>
                <MenuItem value="sunny">Sunny</MenuItem>
                <MenuItem value="cloudy">Cloudy</MenuItem>
                <MenuItem value="rain">Rain</MenuItem>
                <MenuItem value="wind">Windy</MenuItem>
                <MenuItem value="wind-rain">Windy & Rain</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Notes"
              name="notes"
              value={roundInfo.notes}
              onChange={handleChange}
              multiline
              rows={3}
              placeholder="Any notes about this round (optional)"
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={!roundInfo.handicap || !roundInfo.gender || loading}
        >
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
}