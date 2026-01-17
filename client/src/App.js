import React, { useState, useMemo, createContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import BookList from './pages/BookList';
import BookDetail from './pages/BookDetail';
import Authors from './pages/Authors';
import Stats from './pages/Stats';
import './App.css';

export const ColorModeContext = createContext({ toggleColorMode: () => { } });

function App() {
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    return savedMode || 'dark';
  });

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem('themeMode', newMode);
          return newMode;
        });
      },
    }),
    []
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#6366f1',
            dark: '#4f46e5',
            light: '#818cf8',
          },
          secondary: {
            main: '#f43f5e',
          },
          background: {
            default: mode === 'dark' ? '#0f172a' : '#f8fafc',
            paper: mode === 'dark' ? '#1e293b' : '#ffffff',
          },
          divider: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
        },
        shape: {
          borderRadius: 16,
        },
        typography: {
          fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: { fontWeight: 900, letterSpacing: '-0.04em' },
          h2: { fontWeight: 800, letterSpacing: '-0.03em' },
          h3: { fontWeight: 800, letterSpacing: '-0.02em' },
          h4: { fontWeight: 800, letterSpacing: '-0.02em' },
          h5: { fontWeight: 700, letterSpacing: '-0.01em' },
          h6: { fontWeight: 700 },
          subtitle1: { fontWeight: 600 },
          button: { textTransform: 'none', fontWeight: 600 },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                padding: '10px 20px',
              },
              contained: {
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: mode === 'dark'
                    ? '0 0 20px rgba(99, 102, 241, 0.4)'
                    : '0 4px 12px rgba(99, 102, 241, 0.2)',
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
                backgroundColor: mode === 'dark' ? '#1e293b' : '#ffffff',
                border: mode === 'dark'
                  ? '1px solid rgba(255, 255, 255, 0.08)'
                  : '1px solid rgba(0, 0, 0, 0.08)',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <div className="App">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/books" element={<BookList />} />
              <Route path="/books/:id" element={<BookDetail />} />
              <Route path="/authors" element={<Authors />} />
              <Route path="/stats" element={<Stats />} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
