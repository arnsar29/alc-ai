import { createTheme } from '@mui/material/styles';
import { deepmerge } from '@mui/utils';

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Light mode colors
          primary: {
            main: '#2196f3',
            light: '#64b5f6',
            dark: '#1976d2',
          },
          secondary: {
            main: '#f50057',
            light: '#ff4081',
            dark: '#c51162',
          },
          info: {
            main: '#000000',
          },
        }
      : {
          // Dark mode colors
          primary: {
            main: '#90caf9',
            light: '#e3f2fd',
            dark: '#42a5f5',
          },
          secondary: {
            main: '#f48fb1',
            light: '#f8bbd0',
            dark: '#ec407a',
          },
          info: {
            main: '#ffffff',
          },
        }),
  },
});

const sharedTheme = {
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 500,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'transparent',
        },
      },
    },
  },
};

export const getTheme = (mode) => {
  const tokens = getDesignTokens(mode);
  return createTheme(deepmerge(tokens, sharedTheme));
};

export default getTheme('dark'); // Set default theme to dark