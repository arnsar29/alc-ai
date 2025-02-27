import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  ButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';

export default function DriveStats({ rounds, timeframe, onTimeframeChange }) {
  // Calculate driving statistics
  
  // 1. Fairway hit percentage
  let totalDrives = 0;
  let fairwayHits = 0;
  let leftMisses = 0;
  let rightMisses = 0;
  
  // 2. Club usage for tee shots
  const clubUsage = {};
  
  // Process all rounds
  rounds.forEach(round => {
    Object.values(round.holes || {}).forEach(holeShots => {
      if (holeShots.length > 0 && holeShots[0].lieType === 'tee') {
        // Count this as a drive
        totalDrives++;
        
        // Track club usage
        const club = holeShots[0].club;
        if (club) {
          clubUsage[club] = (clubUsage[club] || 0) + 1;
        }
        
        // Check next shot for fairway hit
        if (holeShots.length > 1) {
          if (holeShots[1].lieType === 'fairway') {
            fairwayHits++;
          } else if (holeShots[1].lieType === 'rough') {
            // Simplistic assumption: left/right misses based on even/odd holes
            // In a real app, you'd track this information more precisely
            const holeNumber = parseInt(Object.keys(round.holes).find(key => round.holes[key] === holeShots));
            if (holeNumber % 2 === 0) {
              rightMisses++;
            } else {
              leftMisses++;
            }
          }
        }
      }
    });
  });
  
  // Calculate percentages
  const fairwayHitPercentage = totalDrives > 0 ? Math.round((fairwayHits / totalDrives) * 100) : 0;
  const leftMissPercentage = totalDrives > 0 ? Math.round((leftMisses / totalDrives) * 100) : 0;
  const rightMissPercentage = totalDrives > 0 ? Math.round((rightMisses / totalDrives) * 100) : 0;
  const otherMissPercentage = 100 - fairwayHitPercentage - leftMissPercentage - rightMissPercentage;
  
  // Sort clubs by usage
  const sortedClubs = Object.entries(clubUsage)
    .sort((a, b) => b[1] - a[1])
    .map(([club, count]) => ({
      club,
      count,
      percentage: Math.round((count / totalDrives) * 100)
    }));

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Off the Tee</Typography>
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
        {/* Fairway Accuracy */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Fairway Accuracy</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Fairways Hit</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Box
                      sx={{
                        width: `${fairwayHitPercentage}%`,
                        height: 24,
                        bgcolor: 'success.main',
                        borderRadius: '4px 0 0 4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        minWidth: 30
                      }}
                    >
                      {fairwayHitPercentage > 15 && `${fairwayHitPercentage}%`}
                    </Box>
                    <Box
                      sx={{
                        width: `${100 - fairwayHitPercentage}%`,
                        height: 24,
                        bgcolor: 'grey.200',
                        borderRadius: '0 4px 4px 0',
                        display: 'flex',
                        alignItems: 'center',
                        pl: 1
                      }}
                    >
                      {fairwayHitPercentage <= 15 && `${fairwayHitPercentage}%`}
                    </Box>
                  </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary" mt={2}>
                  Miss Tendency
                </Typography>
                
                <Box>
                  <Typography variant="body2">Left: {leftMissPercentage}%</Typography>
                  <Box
                    sx={{
                      width: `${leftMissPercentage}%`,
                      height: 12,
                      bgcolor: 'warning.main',
                      borderRadius: 1,
                      mb: 1
                    }}
                  />
                </Box>
                
                <Box>
                  <Typography variant="body2">Right: {rightMissPercentage}%</Typography>
                  <Box
                    sx={{
                      width: `${rightMissPercentage}%`,
                      height: 12,
                      bgcolor: 'error.main',
                      borderRadius: 1,
                      mb: 1
                    }}
                  />
                </Box>
                
                <Box>
                  <Typography variant="body2">Other: {otherMissPercentage}%</Typography>
                  <Box
                    sx={{
                      width: `${otherMissPercentage}%`,
                      height: 12,
                      bgcolor: 'grey.400',
                      borderRadius: 1
                    }}
                  />
                </Box>
              </Box>
              
              <Typography variant="body2" color="text.secondary" mt={3}>
                Based on {totalDrives} tee shots
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Club Usage */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Club Selection</Typography>
              
              {sortedClubs.length > 0 ? (
                <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Club</TableCell>
                        <TableCell align="right">Usage</TableCell>
                        <TableCell align="right">% of Tee Shots</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sortedClubs.map((club) => (
                        <TableRow key={club.club}>
                          <TableCell component="th" scope="row">
                            {club.club}
                          </TableCell>
                          <TableCell align="right">{club.count}</TableCell>
                          <TableCell align="right">{club.percentage}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body1" sx={{ mt: 2 }}>
                  No club data recorded yet. Make sure to select your club when entering shots.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Performance Analysis */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Performance Analysis</Typography>
              
              <Box sx={{ mt: 2 }}>
                {fairwayHitPercentage < 50 ? (
                  <Typography paragraph>
                    Your current fairway hit percentage is {fairwayHitPercentage}%, which is below average. 
                    Consider working on your driving accuracy or choosing more conservative clubs off the tee.
                  </Typography>
                ) : (
                  <Typography paragraph>
                    Your fairway hit percentage of {fairwayHitPercentage}% is solid. 
                    This gives you a good foundation for approach shots.
                  </Typography>
                )}
                
                {leftMissPercentage > rightMissPercentage + 10 && (
                  <Typography paragraph>
                    You have a tendency to miss left ({leftMissPercentage}% of misses). 
                    Consider addressing this pattern with your swing coach.
                  </Typography>
                )}
                
                {rightMissPercentage > leftMissPercentage + 10 && (
                  <Typography paragraph>
                    You have a tendency to miss right ({rightMissPercentage}% of misses). 
                    Consider addressing this pattern with your swing coach.
                  </Typography>
                )}
                
                {sortedClubs.length > 0 && (
                  <Typography>
                    Your most frequently used club off the tee is {sortedClubs[0].club} ({sortedClubs[0].percentage}% of tee shots).
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