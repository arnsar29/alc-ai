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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { roundsService } from '../../services/roundsService';

export default function Dashboard() {
  const [rounds, setRounds] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roundToDelete, setRoundToDelete] = useState(null);
  const [sortBy, setSortBy] = useState('date');
  const navigate = useNavigate();

  useEffect(() => {
    loadRounds();
  }, []);

  const loadRounds = () => {
    const loadedRounds = roundsService.getAllRounds();
    setRounds(loadedRounds);
  };

  const calculateTotalScore = (holes) => {
    return Object.values(holes || {}).reduce((total, holeShots) => {
      return total + holeShots.length;
    }, 0);
  };

  const handleDeleteClick = (round) => {
    setRoundToDelete(round);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (roundToDelete) {
      roundsService.deleteRound(roundToDelete.id);
      setRounds(rounds.filter(round => round.id !== roundToDelete.id));
    }
    setDeleteDialogOpen(false);
    setRoundToDelete(null);
  };

  const handleEditRound = (roundId) => {
    navigate(`/rounds/edit/${roundId}`);
  };

  const sortedRounds = [...rounds].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.dateCreated) - new Date(a.dateCreated);
    }
    return calculateTotalScore(a.holes) - calculateTotalScore(b.holes);
  });

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
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