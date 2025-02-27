// src/pages/profile/ProfileSettings.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Grid,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { userService } from '../../services/userService';
import { UserProfile } from '../../models/UserProfile';
import { useAuth } from '../../context/AuthContext';

export default function ProfileSettings() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(new UserProfile());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser) {
        navigate('/signin');
        return;
      }

      try {
        setLoading(true);
        const userProfile = await userService.getUserProfile(currentUser.uid);
        if (userProfile) {
          setProfile(userProfile);
        } else {
          // Create a new profile with default values
          setProfile(new UserProfile({
            id: currentUser.uid,
            displayName: currentUser.displayName || '',
            email: currentUser.email || '',
            photoURL: currentUser.photoURL || ''
          }));
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load profile. Please try again.',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => {
      // Create a new UserProfile with updated values
      return new UserProfile({
        ...prev,
        [name]: name === 'handicap' ? parseFloat(value) : value
      });
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      navigate('/signin');
      return;
    }

    try {
      setSaving(true);
      await userService.saveUserProfile(currentUser.uid, profile);
      setSnackbar({
        open: true,
        message: 'Profile saved successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save profile. Please try again.',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <MainLayout>
        <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>Profile Settings</Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Golf Information
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                This information helps us provide personalized statistics based on your skill level.
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Handicap"
                    name="handicap"
                    type="number"
                    inputProps={{ step: 0.1, min: -10, max: 54 }}
                    value={profile.handicap !== null ? profile.handicap : ''}
                    onChange={handleChange}
                    helperText="Enter your current handicap, or closest estimate"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      name="gender"
                      value={profile.gender || ''}
                      label="Gender"
                      onChange={handleChange}
                    >
                      <MenuItem value="">
                        <em>Select gender</em>
                      </MenuItem>
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Preferred Tee Box</InputLabel>
                    <Select
                      name="preferredTee"
                      value={profile.preferredTee || ''}
                      label="Preferred Tee Box"
                      onChange={handleChange}
                    >
                      <MenuItem value="">
                        <em>Select tee box</em>
                      </MenuItem>
                      <MenuItem value="championship">Championship</MenuItem>
                      <MenuItem value="back">Back</MenuItem>
                      <MenuItem value="middle">Middle</MenuItem>
                      <MenuItem value="forward">Forward</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Home Club"
                    name="homeClub"
                    value={profile.homeClub || ''}
                    onChange={handleChange}
                    placeholder="Optional"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Display Name"
                    name="displayName"
                    value={profile.displayName || ''}
                    onChange={handleChange}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={profile.email || ''}
                    InputProps={{
                      readOnly: true,
                    }}
                    helperText="Email cannot be changed"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              sx={{ mt: 2 }}
            >
              {saving ? <CircularProgress size={24} /> : 'Save Profile'}
            </Button>
          </Box>
        </Box>
        
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </MainLayout>
  );
}