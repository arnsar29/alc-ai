import React from 'react';
import AppAppBar from '../pages/marketing-page/components/AppAppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

export default function MainLayout({ children }) {
  return (
    <Box>
      <AppAppBar />
      <Box
        component="main"
        sx={{
          minHeight: '100vh',
          pt: { xs: 12, sm: 14 } // Padding top to account for the fixed AppBar
        }}
      >
        <Container maxWidth="lg">
          {children}
        </Container>
      </Box>
    </Box>
  );
}