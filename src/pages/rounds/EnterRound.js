import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  useMediaQuery,
  useTheme,
  StepButton
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import CourseSelector from './components/CourseSelector';
import HoleEntry from './components/HoleEntry';
import { courses } from '../../data/courses';
import { roundsService } from '../../services/roundsService';

export default function EnterRound() {
  const { roundId } = useParams();
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
    if (roundId) {
      const existingRound = roundsService.getRound(roundId);
      if (existingRound) {
        setIsEditing(true);
        setSelectedCourse(existingRound.courseId);
        setSelectedTee(existingRound.selectedTee);
        setRoundData(existingRound.holes);
      }
    }
  }, [roundId]);

  // Reset round data when course changes
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
        [holeNumber]: shots
      };
      console.log('After update - roundData:', newData);
      return newData;
    });
  };

  const handleHoleClick = (holeNumber) => {
    setCurrentHole(holeNumber + 1);
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
    setFinishDialogOpen(false);
    handleRoundComplete();
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
              Finish Round
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
                onClick={() => setCurrentHole(prev => prev - 1)}
              >
                Previous Hole
              </Button>
              <Button
                disabled={currentHole === 18}
                onClick={() => setCurrentHole(prev => prev + 1)}
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
          <DialogTitle>Finish Round?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to finish recording this round? 
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
              Finish Round
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </MainLayout>
  );
}