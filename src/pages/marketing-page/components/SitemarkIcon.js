import * as React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

export default function SitemarkIcon() {
  const theme = useTheme();
  const color = theme.palette.mode === 'dark' ? '#fff' : '#000';

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center',
      minWidth: '200px', // Ensure enough space for the full logo
      mr: 3  // More margin on the right
    }}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        style={{ marginRight: '12px' }}
      >
        <circle 
          cx="16" 
          cy="16" 
          r="14" 
          stroke={theme.palette.primary.main} 
          strokeWidth="2"
        />
        <path
          d="M16 8V24M8 16H24"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        whiteSpace: 'nowrap'  // Prevent text wrapping
      }}>
        <Typography
          variant="h5"  // Slightly larger
          component="div"
          sx={{
            fontWeight: 700,
            color: theme.palette.primary.main,
            letterSpacing: '.02em',
            fontFamily: '"Roboto", sans-serif',
            marginRight: '4px'  // Space between "Stroke" and "IQ"
          }}
        >
          Stroke
        </Typography>
        <Typography
          variant="h5"
          component="div"
          sx={{
            fontWeight: 700,
            color: color,
            fontStyle: 'italic',
            fontFamily: '"Roboto", sans-serif',
            paddingRight: '8px'  // Extra padding to prevent cropping
          }}
        >
          IQ
        </Typography>
      </Box>
    </Box>
  );
}