import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
} from '@mui/material';
import {
  AutoAwesome,
  Star,
  Brightness4,
  Brightness7,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { ColorModeContext } from '../App';

const Navbar = () => {
  const location = useLocation();
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);

  const navItems = [
    { path: '/', label: 'Ana Sayfa' },
    { path: '/books', label: 'Kitaplar' },
    { path: '/authors', label: 'Yazarlar' },
    { path: '/stats', label: 'İstatistikler' },
  ];

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid',
        borderColor: theme.palette.divider,
        top: 0,
        zIndex: 1100,
      }}
    >
      <Toolbar sx={{ py: 1, px: { xs: 2, md: 8 } }}>
        <Box
          component={Link}
          to="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'white',
            gap: 1.5
          }}
        >
          <AutoAwesome sx={{ color: theme.palette.primary.main, fontSize: 24 }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              fontSize: '1.25rem',
              letterSpacing: '-0.02em',
              color: theme.palette.text.primary,
            }}
          >
            E-Kütüphane
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 4, alignItems: 'center' }}>
          {navItems.map((item) => (
            <Typography
              key={item.label}
              component={Link}
              to={item.path}
              sx={{
                textDecoration: 'none',
                color: location.pathname === item.path
                  ? theme.palette.primary.main
                  : theme.palette.text.secondary,
                fontSize: '0.9rem',
                fontWeight: location.pathname === item.path ? 700 : 500,
                '&:hover': { color: theme.palette.primary.main },
                transition: 'color 0.2s'
              }}
            >
              {item.label}
            </Typography>
          ))}

          <IconButton
            onClick={colorMode.toggleColorMode}
            color="inherit"
            sx={{ ml: 1, color: theme.palette.text.secondary }}
          >
            {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>

          <Button
            variant="contained"
            sx={{
              ml: 2,
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 700,
              px: 3,
              background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
              '&:hover': { background: '#1d4ed8' }
            }}
          >
            Giriş Yap
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
