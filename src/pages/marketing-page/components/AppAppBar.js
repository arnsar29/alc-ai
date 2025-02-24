import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Drawer from '@mui/material/Drawer';
import MenuIcon from '@mui/icons-material/Menu';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ColorModeIconDropdown from '../../shared-theme/ColorModeIconDropdown';
import Sitemark from './SitemarkIcon';
import { useAuth } from '../../../context/AuthContext';

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexShrink: 0,
  borderRadius: `calc(${theme.shape.borderRadius}px + 8px)`,
  backdropFilter: 'blur(24px)',
  border: '1px solid',
  borderColor: (theme.vars || theme).palette.divider,
  backgroundColor: theme.vars
    ? `rgba(${theme.vars.palette.background.defaultChannel} / 0.4)`
    : alpha(theme.palette.background.default, 0.4),
  boxShadow: (theme.vars || theme).shadows[1],
  padding: '8px 12px',
}));

export default function AppAppBar() {
  const [open, setOpen] = React.useState(false);
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  const navigationItems = [
    { name: 'Home', path: '/', public: true },
    { name: 'Dashboard', path: '/dashboard', public: false },
    { name: 'Enter Round', path: '/rounds/new', public: false },
    { name: 'Analytics', path: '/analytics', public: false }
  ];

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const handleDevLogin = () => {
    login({ email: 'dev@test.com', name: 'Dev User' });
    navigate('/dashboard');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <AppBar
      position="fixed"
      enableColorOnDark
      sx={{
        boxShadow: 0,
        bgcolor: 'transparent',
        backgroundImage: 'none',
        mt: 'calc(var(--template-frame-height, 0px) + 28px)',
      }}
    >
      <Container maxWidth="lg">
        <StyledToolbar variant="dense" disableGutters>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', px: 0 }}>
            <RouterLink to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Sitemark />
            </RouterLink>
            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
              {navigationItems
                .filter(item => item.public || user)
                .map((item) => (
                  <Button
                    key={item.name}
                    component={RouterLink}
                    to={item.path}
                    variant="text"
                    color="info"
                    size="small"
                  >
                    {item.name}
                  </Button>
                ))}
            </Box>
          </Box>
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              gap: 1,
              alignItems: 'center',
            }}
          >
            {!user ? (
              <>
                <Button
                  component={RouterLink}
                  to="/signin"
                  color="primary"
                  variant="text"
                  size="small"
                >
                  Sign in
                </Button>
                <Button
                  component={RouterLink}
                  to="/signup"
                  color="primary"
                  variant="contained"
                  size="small"
                >
                  Sign up
                </Button>
                {process.env.NODE_ENV === 'development' && (
                  <Button
                    color="secondary"
                    variant="outlined"
                    size="small"
                    onClick={handleDevLogin}
                  >
                    Dev Login
                  </Button>
                )}
              </>
            ) : (
              <Button
                color="primary"
                variant="outlined"
                size="small"
                onClick={handleLogout}
              >
                Logout
              </Button>
            )}
            <ColorModeIconDropdown />
          </Box>

          {/* Mobile menu - update similar changes here */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1 }}>
            <ColorModeIconDropdown size="medium" />
            <IconButton aria-label="Menu button" onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="top"
              open={open}
              onClose={toggleDrawer(false)}
              PaperProps={{
                sx: {
                  top: 'var(--template-frame-height, 0px)',
                },
              }}
            >
              {/* Update mobile menu content similarly */}
              <Box sx={{ p: 2, backgroundColor: 'background.default' }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <IconButton onClick={toggleDrawer(false)}>
                    <CloseRoundedIcon />
                  </IconButton>
                </Box>

                {navigationItems
                  .filter(item => item.public || user)
                  .map((item) => (
                    <MenuItem
                      key={item.name}
                      component={RouterLink}
                      to={item.path}
                      onClick={toggleDrawer(false)}
                    >
                      {item.name}
                    </MenuItem>
                  ))}
                <Divider sx={{ my: 3 }} />
                {!user ? (
                  <>
                    <MenuItem component={RouterLink} to="/signup" onClick={toggleDrawer(false)}>
                      <Button color="primary" variant="contained" fullWidth>
                        Sign up
                      </Button>
                    </MenuItem>
                    <MenuItem component={RouterLink} to="/signin" onClick={toggleDrawer(false)}>
                      <Button color="primary" variant="outlined" fullWidth>
                        Sign in
                      </Button>
                    </MenuItem>
                    {process.env.NODE_ENV === 'development' && (
                      <MenuItem onClick={() => { handleDevLogin(); toggleDrawer(false)(); }}>
                        <Button color="secondary" variant="outlined" fullWidth>
                          Dev Login
                        </Button>
                      </MenuItem>
                    )}
                  </>
                ) : (
                  <MenuItem onClick={() => { handleLogout(); toggleDrawer(false)(); }}>
                    <Button color="primary" variant="outlined" fullWidth>
                      Logout
                    </Button>
                  </MenuItem>
                )}
              </Box>
            </Drawer>
          </Box>
        </StyledToolbar>
      </Container>
    </AppBar>
  );
}