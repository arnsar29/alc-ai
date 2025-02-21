import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getTheme } from './theme/theme';
import MainLayout from './layouts/MainLayout';
import MarketingPage from './pages/marketing-page/MarketingPage';

// Create a theme context
export const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

// Other page components
const Features = () => (
  <MainLayout>
    <h1>Features</h1>
    <p>Discover the powerful features of our LLM platform:</p>
  </MainLayout>
);

const Pricing = () => (
  <MainLayout>
    <h1>Pricing</h1>
    <p>Choose the perfect plan for your needs:</p>
  </MainLayout>
);

const Documentation = () => (
  <MainLayout>
    <h1>Documentation</h1>
    <p>Learn how to integrate and use our LLM services:</p>
  </MainLayout>
);

const Blog = () => (
  <MainLayout>
    <h1>Blog</h1>
    <p>Latest updates and insights about our LLM technology:</p>
  </MainLayout>
);

const SignIn = () => (
  <MainLayout>
    <h1>Sign In</h1>
  </MainLayout>
);

const SignUp = () => (
  <MainLayout>
    <h1>Sign Up</h1>
  </MainLayout>
);

function App() {
  const [mode, setMode] = useState('dark');
  
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
    <ColorModeContext.Provider value={colorMode}>
      <Router>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Routes>
            <Route path="/" element={<MarketingPage />} />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/docs" element={<Documentation />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
          </Routes>
        </ThemeProvider>
      </Router>
    </ColorModeContext.Provider>
  );
}

export default App;