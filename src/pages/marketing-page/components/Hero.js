import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import GolfCourseIcon from '@mui/icons-material/GolfCourse'; // Add this import

export default function Hero() {
  return (
    <Box
      id="hero"
      sx={(theme) => ({
        width: '100%',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundImage:
          'radial-gradient(ellipse 80% 50% at 50% -20%, hsl(140, 100%, 90%), transparent)', // Changed to a golf-green tint
        ...theme.applyStyles('dark', {
          backgroundImage:
            'radial-gradient(ellipse 80% 50% at 50% -20%, hsl(140, 100%, 16%), transparent)',
        }),
      })}
    >
      <Container
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: { xs: 14, sm: 20 },
          pb: { xs: 8, sm: 12 },
        }}
      >
        <Stack
          spacing={3}
          useFlexGap
          sx={{ alignItems: 'center', width: { xs: '100%', sm: '80%' } }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <GolfCourseIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography
              variant="h1"
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',
                textAlign: 'center',
                fontSize: 'clamp(3rem, 10vw, 4rem)',
              }}
            >
              Track Your&nbsp;
              <Typography
                component="span"
                variant="h1"
                sx={(theme) => ({
                  fontSize: 'inherit',
                  color: 'primary.main',
                  ...theme.applyStyles('dark', {
                    color: 'primary.light',
                  }),
                })}
              >
                Game
              </Typography>
            </Typography>
          </Box>
          <Typography
            variant="h2"
            sx={{
              textAlign: 'center',
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              color: 'text.secondary',
              width: { sm: '100%', md: '90%' },
            }}
          >
            Understand your golf performance like the pros
          </Typography>
          <Typography
            sx={{
              textAlign: 'center',
              color: 'text.secondary',
              width: { sm: '100%', md: '80%' },
              fontSize: '1.25rem',
            }}
          >
            Track your strokes gained in four key areas: Off the Tee, Approach, Around the Green, 
            and Putting. Get detailed insights into your game and identify areas for improvement.
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            useFlexGap
            sx={{ pt: 4, width: { xs: '100%', sm: '400px' } }}
          >
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              href="/signup"
              sx={{ minWidth: 'fit-content', px: 4 }}
            >
              Start Tracking Free
            </Button>
          </Stack>
          <Typography 
            sx={{ 
              textAlign: 'center', 
              color: 'text.secondary',
              mt: 2 
            }}
          >
            Join thousands of golfers improving their game with data
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}