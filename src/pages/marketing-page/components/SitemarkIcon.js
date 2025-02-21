import * as React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

export default function SitemarkIcon() {
  const theme = useTheme();
  const color = theme.palette.mode === 'dark' ? '#fff' : '#000';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
      <Typography
        variant="h5"
        component="div"
        sx={{
          fontWeight: 700,
          color: color,
          letterSpacing: '.05em',
          textDecoration: 'none',
          fontFamily: 'monospace',
        }}
      >
        <span style={{ color: theme.palette.primary.main }}>ALC</span>
        <span style={{ opacity: 0.9 }}>.AI</span>
      </Typography>
    </Box>
  );
}