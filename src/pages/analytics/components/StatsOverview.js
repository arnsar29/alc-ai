import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  ButtonGroup,
  Divider
} from '@mui/material';

export default function StatsOverview({ rounds, timeframe, onTimeframeChange }) {
  // Calculate overview statistics
  const totalRounds = rounds.length;
  
  // Calculate average score
  const totalScore = rounds.reduce((sum, round) => {
    const roundScore = Object.values(round.holes || {}).reduce((holeSum, shots) => {
      return holeSum + shots.length;
    }, 0);
    return sum + roundScore;
  }, 0);
  
  const averageScore = totalRounds > 0 ? Math.round((totalScore / totalRounds) * 10) / 10 : 0;
  
  // Calculate total holes played
  const totalHoles = rounds.reduce((sum, round) => {
    return sum + Object.keys(round.holes || {}).length;
  }, 0);
  
  // Calculate shots by category
  const shotsByCategory = rounds.reduce((categories, round) => {
    Object.values(round.holes || {}).forEach(holeShots => {
      holeShots.forEach(shot => {
        if (shot.lieType === 'tee') {
          categories.tee += 1;
        } else if (shot.lieType === 'fairway') {
          categories.fairway += 1;
        } else if (shot.lieType === 'rough') {
          categories.rough += 1;
        } else if (shot.lieType === 'bunker') {
          categories.bunker += 1;
        } else if (shot.lieType === 'green') {
          categories.green += 1;
        }
      });
    });
    return categories;
  }, { tee: 0, fairway: 0, rough: 0, bunker: 0, green: 0 });
  
  // Calculate fairway hit percentage
  const totalDrives = shotsByCategory.tee;
  const fairwayHits = rounds.reduce((sum, round) => {
    let fairwayHitsInRound = 0;
    
    // For each hole, check if the second shot was from the fairway
    Object.values(round.holes || {}).forEach(holeShots => {
      if (holeShots.length >= 2 && holeShots[0].lieType === 'tee' && holeShots[1].lieType === 'fairway') {
        fairwayHitsInRound += 1;
      }
    });
    
    return sum + fairwayHitsInRound;
  }, 0);
  
  const fairwayHitPercentage = totalDrives > 0 ? Math.round((fairwayHits / totalDrives) * 100) : 0;
  
  // Calculate average putts per hole
  const totalPutts = shotsByCategory.green;
  const puttsPerHole = totalHoles > 0 ? Math.round((totalPutts / totalHoles) * 10) / 10 : 0;

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Your Golf Stats</Typography>
        <ButtonGroup variant="outlined" size="small">
          <Button 
            onClick={() => onTimeframeChange('all')}
            variant={timeframe === 'all' ? 'contained' : 'outlined'}
          >
            All Time
          </Button>
          <Button 
            onClick={() => onTimeframeChange('year')}
            variant={timeframe === 'year' ? 'contained' : 'outlined'}
          >
            This Year
          </Button>
          <Button 
            onClick={() => onTimeframeChange('month')}
            variant={timeframe === 'month' ? 'contained' : 'outlined'}
          >
            This Month
          </Button>
        </ButtonGroup>
      </Box>

      <Grid container spacing={3}>
        {/* Key stats */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Rounds</Typography>
              <Typography variant="h3">{totalRounds}</Typography>
              <Typography variant="body2" color="text.secondary">
                Total holes: {totalHoles}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Average Score</Typography>
              <Typography variant="h3">{averageScore}</Typography>
              <Typography variant="body2" color="text.secondary">
                Total strokes: {totalScore}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Fairways Hit</Typography>
              <Typography variant="h3">{fairwayHitPercentage}%</Typography>
              <Typography variant="body2" color="text.secondary">
                {fairwayHits} of {totalDrives} fairways
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Shots distribution */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Shot Distribution</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 2 }}>
                <Box>
                  <Typography variant="body1" fontWeight="bold">Tee Shots</Typography>
                  <Typography variant="h5">{shotsByCategory.tee}</Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                
                <Box>
                  <Typography variant="body1" fontWeight="bold">Fairway Shots</Typography>
                  <Typography variant="h5">{shotsByCategory.fairway}</Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                
                <Box>
                  <Typography variant="body1" fontWeight="bold">Rough Shots</Typography>
                  <Typography variant="h5">{shotsByCategory.rough}</Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                
                <Box>
                  <Typography variant="body1" fontWeight="bold">Bunker Shots</Typography>
                  <Typography variant="h5">{shotsByCategory.bunker}</Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                
                <Box>
                  <Typography variant="body1" fontWeight="bold">Putts</Typography>
                  <Typography variant="h5">{shotsByCategory.green}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {puttsPerHole} per hole
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Recommendations */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Areas for Improvement</Typography>
              <Box sx={{ mt: 1 }}>
                {fairwayHitPercentage < 50 && (
                  <Typography paragraph>
                    <strong>Off the Tee:</strong> Your fairway hit percentage is below 50%. 
                    Consider working on your driving accuracy to improve overall performance.
                  </Typography>
                )}
                
                {puttsPerHole > 2 && (
                  <Typography paragraph>
                    <strong>Putting:</strong> You're averaging {puttsPerHole} putts per hole. 
                    Focusing on putting practice could quickly lower your scores.
                  </Typography>
                )}
                
                {shotsByCategory.bunker > (totalHoles * 0.2) && (
                  <Typography paragraph>
                    <strong>Bunker Play:</strong> You're finding the sand frequently. 
                    Work on your bunker shots or focus on avoiding bunkers with better approach play.
                  </Typography>
                )}
                
                {(fairwayHitPercentage >= 50 && puttsPerHole <= 2 && shotsByCategory.bunker <= (totalHoles * 0.2)) && (
                  <Typography>
                    You're showing good consistency across your game. Keep tracking your stats to identify more specific areas to improve.
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}