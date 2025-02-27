import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import CourseSelector from './components/CourseSelector';
import HoleEntry from './components/HoleEntry';
import { courses } from '../../data/courses';
import { roundsService } from '../../services/roundsService';

export default function EnterRound({ roundId: propRoundId }) {
  // Use either the prop or the URL parameter
  const { roundId: paramRoundId } = useParams();
  const roundId = propRoundId || paramRoundId;
  
  console.log('EnterRound - Component rendering with roundId:', roundId);
  
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedTee, setSelectedTee] = useState('');
  const [currentHole, setCurrentHole] = useState(1);
  const [roundData, setRoundData] = useState({});
  const [finishDialogOpen, setFinishDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Load existing round data if editing
  useEffect(() => {
    const loadRoundData = async () => {
      console.log('EnterRound - loadRoundData triggered with roundId:', roundId);
      
      if (roundId) {
        try {
          console.log('EnterRound - Calling roundsService.getRoundById with:', roundId);
          const existingRound = await roundsService.getRoundById(roundId);
          console.log('EnterRound - Retrieved round data:', existingRound);
          
          if (existingRound) {
            console.log('EnterRound - Setting state with round data');
            setIsEditing(true);
            setSelectedCourse(existingRound.courseId);
            console.log('EnterRound - Set selectedCourse to:', existingRound.courseId);
            setSelectedTee(existingRound.selectedTee);
            console.log('EnterRound - Set selectedTee to:', existingRound.selectedTee);
            setRoundData(existingRound.holes || {});
            console.log('EnterRound - Set roundData to:', existingRound.holes);
          } else {
            console.log('EnterRound - No round data found for ID:', roundId);
          }
        } catch (error) {
          console.error('EnterRound - Error loading round data:', error);
        }
      }
    };

    loadRoundData();
  }, [roundId]);

  // Reset round data when course changes (if not editing)
  useEffect(() => {
    if (!isEditing && selectedCourse) {
      setRoundData({});
      setCurrentHole(1);
    }
  }, [selectedCourse, isEditing]);

  const courseData = courses.find(c => c.id === selectedCourse);

  const getCurrentHoleData = (holeNumber) => {
    if (!courseData) return null;
    
    const hole = courseData.holes.find(h => h.number === holeNumber);
    if (!hole) return null;
  
    // Ensure tee distances exist
    const teeDistance = hole.teeDistances[selectedTee];
    if (teeDistance === undefined) {
      console.warn(`No distance found for tee ${selectedTee} on hole ${holeNumber}`);
    }
  
    return {
      ...hole,
      teeDistances: {
        ...hole.teeDistances,
        [selectedTee]: teeDistance || 400 // Default distance if not found
      }
    };
  };

  const currentHoleData = getCurrentHoleData(currentHole);

  const handleHoleComplete = (holeNumber, shots) => {
    console.log('Before update - roundData:', roundData);
    setRoundData(prevData => {
      const newData = {
        ...prevData,
        [holeNumber]: JSON.parse(JSON.stringify(shots)) // Deep copy to avoid reference issues
      };
      console.log('After update - roundData:', newData);
      return newData;
    });
  };

  const validateCurrentHole = () => {
    // Get current hole data
    const currentShots = roundData[currentHole] || [];
    
    // If no shots, no validation needed
    if (currentShots.length === 0) return true;
    
    // Check if all shots have required data
    const isValid = !currentShots.some(shot => 
      !shot.lieType || 
      !shot.distance || 
      (typeof shot.distance === 'string' && (!/^\d+$/.test(shot.distance) || parseInt(shot.distance, 10) <= 0)) || 
      (typeof shot.distance === 'number' && shot.distance <= 0)
    );
    
    if (!isValid) {
      alert("Please complete all shot information before continuing.");
    }
    
    return isValid;
  };

  const handleHoleClick = (holeNumber) => {
    if (validateCurrentHole()) {
      // Auto-save current hole data
      const currentShots = roundData[currentHole] || [];
      if (currentShots.length > 0) {
        handleHoleComplete(currentHole, currentShots);
      }
      
      // Switch to the selected hole
      setCurrentHole(holeNumber + 1);
    }
  };

  const isHoleCompleted = (holeNumber) => {
    return roundData[holeNumber] && roundData[holeNumber].length > 0;
  };

  const canFinishRound = () => {
    return Object.keys(roundData).length > 0;
  };
  
  const handleRoundComplete = async () => {
    if (!canFinishRound()) {
      return;
    }
  
    try {
      const roundToSave = {
        courseId: selectedCourse,
        courseName: courseData.name,
        selectedTee,
        holes: roundData,
        totalHoles: Object.keys(roundData).length,
        dateCreated: new Date().toISOString()
      };
  
      if (isEditing) {
        await roundsService.updateRound(roundId, roundToSave);
      } else {
        console.log('Saving new round:', roundToSave);
        await roundsService.saveRound(roundToSave);
      }
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving round:', error);
      // Here you could add error handling UI if needed
    }
  };

  const handleFinishEarly = () => {
    if (!canFinishRound()) {
      return;
    }
    
    if (validateCurrentHole()) {
      setFinishDialogOpen(false);
      handleRoundComplete();
    } else {
      // Keep dialog open if validation fails
      setFinishDialogOpen(false);
    }
  };

  return (
    <MainLayout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            {isEditing ? 'Edit Round' : 'Enter Round'}
          </Typography>
          {selectedCourse && selectedTee && (
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setFinishDialogOpen(true)}
              disabled={!canFinishRound()}
            >
              Save Round
            </Button>
          )}
        </Box>

        <CourseSelector
          selectedCourse={selectedCourse}
          selectedTee={selectedTee}
          onCourseChange={setSelectedCourse}
          onTeeChange={setSelectedTee}
          disabled={isEditing}
        />

        {selectedCourse && selectedTee && (
          <>
            <Box sx={{ 
              overflowX: 'auto', 
              display: 'flex', 
              gap: 1, 
              width: '100%',
              paddingBottom: 1
            }}>
              {[...Array(18)].map((_, index) => (
                <Button
                  key={index}
                  variant={currentHole === index + 1 ? 'contained' : 'outlined'}
                  color={isHoleCompleted(index + 1) ? 'success' : 'primary'}
                  onClick={() => handleHoleClick(index)}
                  sx={{ 
                    minWidth: 'auto', 
                    padding: '6px 12px',
                    flexShrink: 0 
                  }}
                >
                  {index + 1}
                </Button>
              ))}
            </Box>

            {currentHoleData && (
              <HoleEntry
                key={`hole-${currentHole}`}
                holeNumber={currentHole}
                par={currentHoleData.par}
                teeDistance={currentHoleData.teeDistances[selectedTee]}
                onHoleComplete={handleHoleComplete}
                existingData={roundData[currentHole]}
              />
            )}

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                disabled={currentHole === 1}
                onClick={() => {
                  if (validateCurrentHole()) {
                    // Auto-save current hole data
                    const currentShots = roundData[currentHole] || [];
                    if (currentShots.length > 0) {
                      handleHoleComplete(currentHole, currentShots);
                    }
                    // Move to previous hole
                    setCurrentHole(prev => prev - 1);
                  }
                }}
                variant="outlined"
              >
                Previous Hole
              </Button>
              <Button
                disabled={currentHole === 18}
                onClick={() => {
                  if (validateCurrentHole()) {
                    // Auto-save current hole data
                    const currentShots = roundData[currentHole] || [];
                    if (currentShots.length > 0) {
                      handleHoleComplete(currentHole, currentShots);
                    }
                    // Move to next hole
                    setCurrentHole(prev => prev + 1);
                  }
                }}
                variant="contained"
                color="primary"
              >
                Next Hole
              </Button>
            </Box>
          </>
        )}

        <Dialog
          open={finishDialogOpen}
          onClose={() => setFinishDialogOpen(false)}
        >
          <DialogTitle>Save Round?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to save this round? 
              {currentHole < 18 && " You haven't completed all 18 holes."}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFinishDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleFinishEarly} 
              variant="contained" 
              color="primary"
              disabled={!canFinishRound()}
            >
              Save Round
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </MainLayout>
  );
}