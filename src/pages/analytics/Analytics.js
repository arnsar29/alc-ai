import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';
import MainLayout from '../../layouts/MainLayout';
import { roundsService } from '../../services/roundsService';
import StatsOverview from './components/StatsOverview';
import DriveStats from './components/DriveStats';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`stats-tabpanel-${index}`}
      aria-labelledby={`stats-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `stats-tab-${index}`,
    'aria-controls': `stats-tabpanel-${index}`,
  };
}

export default function Analytics() {
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [timeframe, setTimeframe] = useState('all'); // 'all', 'month', 'year'

  useEffect(() => {
    loadRounds();
  }, []);

  const loadRounds = async () => {
    try {
      setLoading(true);
      const loadedRounds = await roundsService.getAllRounds();
      setRounds(loadedRounds);
      setError(null);
    } catch (err) {
      setError('Failed to load analytics data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
  };

  const filteredRounds = rounds.filter(round => {
    if (timeframe === 'all') return true;
    
    const roundDate = new Date(round.dateCreated);
    const now = new Date();
    
    if (timeframe === 'month') {
      // Filter for current month
      return roundDate.getMonth() === now.getMonth() && 
             roundDate.getFullYear() === now.getFullYear();
    } else if (timeframe === 'year') {
      // Filter for current year
      return roundDate.getFullYear() === now.getFullYear();
    }
    
    return true;
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

  if (rounds.length === 0) {
    return (
      <MainLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography variant="h4" gutterBottom>Analytics</Typography>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No round data available yet
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              Play and record some rounds to see your analytics here.
            </Typography>
          </Paper>
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

        <Typography variant="h4" gutterBottom>Analytics</Typography>
        
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="golf stats tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Overview" {...a11yProps(0)} />
              <Tab label="Off the Tee" {...a11yProps(1)} />
              <Tab label="Approach" {...a11yProps(2)} />
              <Tab label="Short Game" {...a11yProps(3)} />
              <Tab label="Putting" {...a11yProps(4)} />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            <StatsOverview 
              rounds={filteredRounds} 
              timeframe={timeframe} 
              onTimeframeChange={handleTimeframeChange} 
            />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <DriveStats 
              rounds={filteredRounds} 
              timeframe={timeframe} 
              onTimeframeChange={handleTimeframeChange} 
            />
          </TabPanel>
        </Box>
      </Container>
    </MainLayout>
  );
}