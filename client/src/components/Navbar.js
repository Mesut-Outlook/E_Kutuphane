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
  Home,
  LibraryBooks,
  People,
  BarChart,
  MenuBook,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Ana Sayfa', icon: <Home /> },
    { path: '/books', label: 'Kitaplar', icon: <LibraryBooks /> },
    { path: '/authors', label: 'Yazarlar', icon: <People /> },
    { path: '/stats', label: 'İstatistikler', icon: <BarChart /> },
  ];

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <Toolbar sx={{ py: 1 }}>
        {/* Logo and Title */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mr: 4,
          }}
        >
          <IconButton
            edge="start"
            color="inherit"
            aria-label="logo"
            sx={{
              mr: 1.5,
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                background: 'rgba(255,255,255,0.25)',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s',
            }}
          >
            <MenuBook />
          </IconButton>

          <Typography
            variant="h5"
            component="div"
            sx={{
              fontWeight: 800,
              letterSpacing: '-0.5px',
              textShadow: '0 2px 10px rgba(0,0,0,0.2)',
            }}
          >
            E-Kütüphane
          </Typography>
        </Box>

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Navigation Items */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Button
                key={item.path}
                color="inherit"
                component={Link}
                to={item.path}
                startIcon={item.icon}
                sx={{
                  px: 2.5,
                  py: 1,
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  background: isActive
                    ? 'rgba(255,255,255,0.25)'
                    : 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid',
                  borderColor: isActive
                    ? 'rgba(255,255,255,0.3)'
                    : 'rgba(255,255,255,0.15)',
                  boxShadow: isActive
                    ? '0 4px 12px rgba(0,0,0,0.15)'
                    : 'none',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.25)',
                    borderColor: 'rgba(255,255,255,0.4)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
