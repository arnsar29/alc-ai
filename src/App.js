import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getTheme } from './theme/theme';
import MainLayout from './layouts/MainLayout';
import MarketingPage from './pages/marketing-page/MarketingPage';
import SignIn from './pages/auth/components/SignIn';
import SignUp from './pages/auth/components/SignUp';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import EnterRound from './pages/rounds/EnterRound';

// Create a theme context
export const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

// Protected page components (remove EnterRound from here since we're importing it)
const Dashboard = () => (
  <MainLayout>
    <h1>Dashboard</h1>
    <p>Your golf stats overview</p>
  </MainLayout>
);

const Analytics = () => (
  <MainLayout>
    <h1>Analytics</h1>
    <p>Your detailed stats and analysis</p>
  </MainLayout>
);

function App() {
  const [mode, setMode] = useState('light');
  
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <AuthProvider>
      <ColorModeContext.Provider value={colorMode}>
        <Router>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Routes>
              <Route path="/" element={<MarketingPage />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/rounds/new" 
                element={
                  <ProtectedRoute>
                    <EnterRound />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/analytics" 
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </ThemeProvider>
        </Router>
      </ColorModeContext.Provider>
    </AuthProvider>
  );
}

export default App;