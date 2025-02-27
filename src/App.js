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
import Analytics from './pages/analytics/Analytics';
import EditRound from './pages/rounds/EditRound';
import Dashboard from './pages/dashboard/Dashboard';
import FirebaseTest from './components/FirebaseTest';
import { useNavigate } from 'react-router-dom';

// Create a theme context
export const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

// Protected page components (remove EnterRound from here since we're importing it)

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
              <Route 
                path="/rounds/edit/:id" 
                element={
                  <ProtectedRoute>
                    <EditRound />
                  </ProtectedRoute>
                } 
              />
              <Route path="/firebase-test" element={<FirebaseTest />} />
            </Routes>
          </ThemeProvider>
        </Router>
      </ColorModeContext.Provider>
    </AuthProvider>
  );
}

export default App;