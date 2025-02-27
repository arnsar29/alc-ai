import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { roundsService } from '../../services/roundsService';
import { strokesGainedService } from '../../services/strokesGainedService';

export default function Dashboard() {
  const [rounds, setRounds] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roundToDelete, setRoundToDelete] = useState(null);
  const [sortBy, setSortBy] = useState('date');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [strokesGainedData, setStrokesGainedData] = useState(null);
  const [timeframe, setTimeframe] = useState('all'); // 'all', 'month', '6months', 'year'
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    loadRounds();
  }, []);

  useEffect(() => {
    if (rounds.length > 0) {
      // Calculate strokes gained when rounds change
      const options = {
        timeframe: timeframe !== 'all' ? timeframe : null,
        courseId: selectedCourseId
      };
      
      const strokesGained = strokesGainedService.calculateAggregateStrokesGained(rounds, options);
      setStrokesGainedData(strokesGained);
    }
  }, [rounds, timeframe, selectedCourseId]);

  const loadRounds = async () => {
    try {
      setLoading(true);
      const loadedRounds = await roundsService.getAllRounds();
      setRounds(loadedRounds);
      setError(null);
      console.log('Rounds loaded:', loadedRounds);
    } catch (err) {
      setError('Failed to load rounds. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalScore = (holes) => {
    return Object.values(holes || {}).reduce((total, holeShots) => {
      return total + holeShots.length;
    }, 0);
  };

  const handleDeleteClick = (round) => {
    setRoundToDelete(round);
    setDeleteDialogOpen(true);
    console.log('About to delete round:', round);
  };

  const handleConfirmDelete = async () => {
    if (roundToDelete) {
      try {
        await roundsService.deleteRound(roundToDelete.id);
        setRounds(rounds.filter(round => round.id !== roundToDelete.id));
        console.log('Round deleted:', roundToDelete);
      } catch (err) {
        setError('Failed to delete round. Please try again later.');
      }
    }
    setDeleteDialogOpen(false);
    setRoundToDelete(null);
  };

  const handleEditRound = (roundId) => {
    console.log('Dashboard - Starting edit for round ID:', roundId);
    navigate(`/rounds/edit/${roundId}`);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
  };

  const handleCourseSelect = (courseId) => {
    setSelectedCourseId(courseId === selectedCourseId ? null : courseId);
  };

  // Calculate tee-to-green and overall strokes gained for a round
  const calculateExtendedStrokesGained = (round) => {
    const sg = strokesGainedService.calculateRoundStrokesGained(round);
    
    // Calculate tee-to-green (all strokes gained minus putting)
    const teeToGreen = sg.byCategory.tee + sg.byCategory.approach + sg.byCategory.around;
    
    return {
      ...sg,
      byCategory: {
        ...sg.byCategory,
        teeToGreen: parseFloat(teeToGreen.toFixed(2)),
        overall: sg.total
      }
    };
  };

  const sortedRounds = [...rounds].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.dateCreated) - new Date(a.dateCreated);
    }
    return calculateTotalScore(a.holes) - calculateTotalScore(b.holes);
  });

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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4">Dashboard</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/rounds/new')}
          >
            New Round
          </Button>
        </Box>

        {rounds.length > 0 && (
          <Box sx={{ width: '100%', mb: 4 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="dashboard tabs"
              centered
            >
              <Tab label="Rounds" />
              <Tab label="Strokes Gained" />
            </Tabs>
          </Box>
        )}

        {tabValue === 0 ? (
          // Rounds Tab
          <>
            {rounds.length > 0 && (
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button
                  variant={sortBy === 'date' ? 'contained' : 'outlined'}
                  onClick={() => setSortBy('date')}
                >
                  Sort by Date
                </Button>
                <Button
                  variant={sortBy === 'score' ? 'contained' : 'outlined'}
                  onClick={() => setSortBy('score')}
                >
                  Sort by Score
                </Button>
              </Box>
            )}

            <Typography variant="h5" sx={{ mb: 3 }}>Recent Rounds</Typography>
            <Grid container spacing={3}>
              {sortedRounds.length === 0 ? (
                <Grid item xs={12}>
                  <Card sx={{ textAlign: 'center', py: 4 }}>
                    <CardContent>
                      <Typography variant="h6" color="text.secondary">
                        No rounds recorded yet
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/rounds/new')}
                        sx={{ mt: 2 }}
                      >
                        Record Your First Round
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ) : (
                sortedRounds.map((round) => (
                  <Grid item xs={12} md={6} lg={4} key={round.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {round.courseName}
                        </Typography>
                        <Typography color="text.secondary" gutterBottom>
                          {new Date(round.dateCreated).toLocaleDateString()} at {round.selectedTee} tees
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ mt: 2 }}>
                          <Typography>
                            Holes Played: {Object.keys(round.holes || {}).length}
                          </Typography>
                          <Typography>
                            Total Score: {calculateTotalScore(round.holes)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Shots by Category:
                          </Typography>
                          <Box sx={{ pl: 2 }}>
                            <Typography variant="body2">
                              • Off the Tee: {Object.values(round.holes || {}).flat().filter(shot => shot.lieType === 'tee').length}
                            </Typography>
                            <Typography variant="body2">
                              • Putts: {Object.values(round.holes || {}).flat().filter(shot => shot.lieType === 'green').length}
                            </Typography>
                            {Object.values(round.holes || {}).flat().filter(shot => shot.lieType === 'recovery').length > 0 && (
                              <Typography variant="body2">
                                • Recovery: {Object.values(round.holes || {}).flat().filter(shot => shot.lieType === 'recovery').length}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleEditRound(round.id)}
                        >
                          Edit Round
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeleteClick(round)}
                        >
                          Delete
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          </>
        ) : (
          // Strokes Gained Tab
          rounds.length > 0 ? (
            <>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button
                  variant={timeframe === 'all' ? 'contained' : 'outlined'}
                  onClick={() => handleTimeframeChange('all')}
                >
                  All Time
                </Button>
                <Button
                  variant={timeframe === 'month' ? 'contained' : 'outlined'}
                  onClick={() => handleTimeframeChange('month')}
                >
                  Last Month
                </Button>
                <Button
                  variant={timeframe === '6months' ? 'contained' : 'outlined'}
                  onClick={() => handleTimeframeChange('6months')}
                >
                  Last 6 Months
                </Button>
                <Button
                  variant={timeframe === 'year' ? 'contained' : 'outlined'}
                  onClick={() => handleTimeframeChange('year')}
                >
                  Last Year
                </Button>
              </Box>
              
              {/* Course filter */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Filter by Course:</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {Array.from(new Set(rounds.map(r => r.courseId))).map(courseId => {
                    const courseName = rounds.find(r => r.courseId === courseId)?.courseName || courseId;
                    return (
                      <Chip
                        key={courseId}
                        label={courseName}
                        onClick={() => handleCourseSelect(courseId)}
                        color={selectedCourseId === courseId ? 'primary' : 'default'}
                        variant={selectedCourseId === courseId ? 'filled' : 'outlined'}
                      />
                    );
                  })}
                </Box>
              </Box>
              
              {strokesGainedData && (
                <Grid container spacing={3}>
                  {/* Total Strokes Gained */}
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>Total Strokes Gained</Typography>
                        <Typography variant="h3" color={strokesGainedData.average?.total > 0 ? 'success.main' : 'error.main'}>
                          {strokesGainedData.average?.total > 0 ? '+' : ''}{strokesGainedData.average?.total || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Based on {strokesGainedData.rounds} rounds
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Tee to Green Strokes Gained */}
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>Tee to Green</Typography>
                        <Typography variant="h3" color={(strokesGainedData.average?.byCategory.tee + 
                                                       strokesGainedData.average?.byCategory.approach + 
                                                       strokesGainedData.average?.byCategory.around) > 0 ? 'success.main' : 'error.main'}>
                          {(strokesGainedData.average?.byCategory.tee + 
                            strokesGainedData.average?.byCategory.approach + 
                            strokesGainedData.average?.byCategory.around) > 0 ? '+' : ''}
                          {parseFloat((strokesGainedData.average?.byCategory.tee + 
                                     strokesGainedData.average?.byCategory.approach + 
                                     strokesGainedData.average?.byCategory.around).toFixed(2)) || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          All shots except putting
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Strokes Gained by Category */}
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>Strokes Gained by Category</Typography>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2">Off the Tee</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Box sx={{ 
                              width: '100%', 
                              height: 10, 
                              bgcolor: 'grey.300', 
                              borderRadius: 5,
                              position: 'relative',
                              overflow: 'hidden'
                            }}>
                              <Box sx={{ 
                                position: 'absolute',
                                left: '50%',
                                height: '100%',
                                width: `${Math.min(Math.abs(strokesGainedData.average?.byCategory.tee || 0) * 20, 100)}%`,
                                bgcolor: (strokesGainedData.average?.byCategory.tee || 0) > 0 ? 'success.main' : 'error.main',
                                transform: `translateX(${(strokesGainedData.average?.byCategory.tee || 0) > 0 ? '0%' : '-100%'})`,
                              }}/>
                            </Box>
                            <Typography variant="body2" sx={{ ml: 1, minWidth: 50, textAlign: 'right' }}>
                              {(strokesGainedData.average?.byCategory.tee || 0) > 0 ? '+' : ''}
                              {strokesGainedData.average?.byCategory.tee || 0}
                            </Typography>
                          </Box>
                          
                          <Typography variant="body2">Approach</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Box sx={{ 
                              width: '100%', 
                              height: 10, 
                              bgcolor: 'grey.300', 
                              borderRadius: 5,
                              position: 'relative',
                              overflow: 'hidden'
                            }}>
                              <Box sx={{ 
                                position: 'absolute',
                                left: '50%',
                                height: '100%',
                                width: `${Math.min(Math.abs(strokesGainedData.average?.byCategory.approach || 0) * 20, 100)}%`,
                                bgcolor: (strokesGainedData.average?.byCategory.approach || 0) > 0 ? 'success.main' : 'error.main',
                                transform: `translateX(${(strokesGainedData.average?.byCategory.approach || 0) > 0 ? '0%' : '-100%'})`,
                              }}/>
                            </Box>
                            <Typography variant="body2" sx={{ ml: 1, minWidth: 50, textAlign: 'right' }}>
                              {(strokesGainedData.average?.byCategory.approach || 0) > 0 ? '+' : ''}
                              {strokesGainedData.average?.byCategory.approach || 0}
                            </Typography>
                          </Box>
                          
                          <Typography variant="body2">Around the Green</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Box sx={{ 
                              width: '100%', 
                              height: 10, 
                              bgcolor: 'grey.300', 
                              borderRadius: 5,
                              position: 'relative',
                              overflow: 'hidden'
                            }}>
                              <Box sx={{ 
                                position: 'absolute',
                                left: '50%',
                                height: '100%',
                                width: `${Math.min(Math.abs(strokesGainedData.average?.byCategory.around || 0) * 20, 100)}%`,
                                bgcolor: (strokesGainedData.average?.byCategory.around || 0) > 0 ? 'success.main' : 'error.main',
                                transform: `translateX(${(strokesGainedData.average?.byCategory.around || 0) > 0 ? '0%' : '-100%'})`,
                              }}/>
                            </Box>
                            <Typography variant="body2" sx={{ ml: 1, minWidth: 50, textAlign: 'right' }}>
                              {(strokesGainedData.average?.byCategory.around || 0) > 0 ? '+' : ''}
                              {strokesGainedData.average?.byCategory.around || 0}
                            </Typography>
                          </Box>
                          
                          <Typography variant="body2">Putting</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Box sx={{ 
                              width: '100%', 
                              height: 10, 
                              bgcolor: 'grey.300', 
                              borderRadius: 5,
                              position: 'relative',
                              overflow: 'hidden'
                            }}>
                              <Box sx={{ 
                                position: 'absolute',
                                left: '50%',
                                height: '100%',
                                width: `${Math.min(Math.abs(strokesGainedData.average?.byCategory.putting || 0) * 20, 100)}%`,
                                bgcolor: (strokesGainedData.average?.byCategory.putting || 0) > 0 ? 'success.main' : 'error.main',
                                transform: `translateX(${(strokesGainedData.average?.byCategory.putting || 0) > 0 ? '0%' : '-100%'})`,
                              }}/>
                            </Box>
                            <Typography variant="body2" sx={{ ml: 1, minWidth: 50, textAlign: 'right' }}>
                              {(strokesGainedData.average?.byCategory.putting || 0) > 0 ? '+' : ''}
                              {strokesGainedData.average?.byCategory.putting || 0}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Individual Round Strokes Gained */}
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>Strokes Gained by Round</Typography>
                        <TableContainer component={Paper} variant="outlined">
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Course</TableCell>
                                <TableCell align="right">Overall</TableCell>
                                <TableCell align="right">Tee to Green</TableCell>
                                <TableCell align="right">Off Tee</TableCell>
                                <TableCell align="right">Approach</TableCell>
                                <TableCell align="right">Around</TableCell>
                                <TableCell align="right">Putting</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {rounds.map(round => {
                                const sg = calculateExtendedStrokesGained(round);
                                return (
                                  <TableRow key={round.id}>
                                    <TableCell>{new Date(round.dateCreated).toLocaleDateString()}</TableCell>
                                    <TableCell>{round.courseName}</TableCell>
                                    <TableCell align="right" sx={{ 
                                      color: sg.total > 0 ? 'success.main' : 'error.main',
                                      fontWeight: 'bold'
                                    }}>
                                      {sg.total > 0 ? '+' : ''}{sg.total}
                                    </TableCell>
                                    <TableCell align="right" sx={{ 
                                      color: sg.byCategory.teeToGreen > 0 ? 'success.main' : 'error.main' 
                                    }}>
                                      {sg.byCategory.teeToGreen > 0 ? '+' : ''}{sg.byCategory.teeToGreen}
                                    </TableCell>
                                    <TableCell align="right" sx={{ 
                                      color: sg.byCategory.tee > 0 ? 'success.main' : 'error.main' 
                                    }}>
                                      {sg.byCategory.tee > 0 ? '+' : ''}{sg.byCategory.tee}
                                    </TableCell>
                                    <TableCell align="right" sx={{ 
                                      color: sg.byCategory.approach > 0 ? 'success.main' : 'error.main' 
                                    }}>
                                      {sg.byCategory.approach > 0 ? '+' : ''}{sg.byCategory.approach}
                                    </TableCell>
                                    <TableCell align="right" sx={{ 
                                      color: sg.byCategory.around > 0 ? 'success.main' : 'error.main' 
                                    }}>
                                      {sg.byCategory.around > 0 ? '+' : ''}{sg.byCategory.around}
                                    </TableCell>
                                    <TableCell align="right" sx={{ 
                                      color: sg.byCategory.putting > 0 ? 'success.main' : 'error.main' 
                                    }}>
                                      {sg.byCategory.putting > 0 ? '+' : ''}{sg.byCategory.putting}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}
            </>
          ) : (
            <Grid item xs={12}>
              <Card sx={{ textAlign: 'center', py: 4 }}>
                <CardContent>
                  <Typography variant="h6" color="text.secondary">
                    No rounds recorded yet
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/rounds/new')}
                    sx={{ mt: 2 }}
                  >
                    Record Your First Round
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          )
        )}

        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Delete Round</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this round at {roundToDelete?.courseName}? 
              This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </MainLayout>
  );
}