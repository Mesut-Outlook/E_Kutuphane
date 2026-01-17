import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  Grid,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  AutoAwesome,
  Speed,
  CloudDone,
  Security,
  LibraryBooks,
  Person,
  BarChart,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const handleSearch = () => {
    const query = searchTerm.trim();
    if (query) {
      window.location.href = `/books?search=${encodeURIComponent(query)}`;
    } else {
      window.location.href = '/books';
    }
  };

  const features = [
    { title: 'Işık Hızında', desc: 'Binlerce kitap arasından saniyeler içinde arama yapın.', icon: <Speed sx={{ fontSize: 32, color: theme.palette.primary.main }} /> },
    { title: 'Yerel Erişim', desc: 'Bulut gerekmez. Kendi yerel arşivinize doğrudan erişin.', icon: <CloudDone sx={{ fontSize: 32, color: theme.palette.primary.main }} /> },
    { title: 'Güvenli ve Özel', desc: 'Verileriniz her zaman kendi cihazınızda kalır.', icon: <Security sx={{ fontSize: 32, color: theme.palette.primary.main }} /> },
  ];

  const quickLinks = [
    { label: 'Kitaplar', icon: <LibraryBooks />, path: '/books' },
    { label: 'Yazarlar', icon: <Person />, path: '/authors' },
    { label: 'İstatistikler', icon: <BarChart />, path: '/stats' },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        color: 'text.primary',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'background-color 0.3s ease'
      }}
    >
      {/* Dynamic Background Elements */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '100vh',
        background: isDark
          ? 'radial-gradient(circle at 10% 20%, rgba(37, 99, 235, 0.1) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(168, 85, 247, 0.05) 0%, transparent 40%)'
          : 'radial-gradient(circle at 10% 20%, rgba(37, 99, 235, 0.05) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(168, 85, 247, 0.03) 0%, transparent 40%)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <Container maxWidth="xl" sx={{ pt: { xs: 4, md: 10 }, pb: 10, zIndex: 1, position: 'relative' }}>
        {/* Responsive Hero Card */}
        <Box
          sx={{
            width: '100%',
            minHeight: { xs: 400, md: 480, lg: 520 },
            borderRadius: { xs: '24px', md: '48px' },
            background: isDark
              ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.8) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(241, 245, 249, 0.9) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
            boxShadow: isDark
              ? '0 40px 100px rgba(0, 0, 0, 0.7)'
              : '0 20px 60px rgba(15, 23, 42, 0.1)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            px: { xs: 3, md: 8, lg: 12 },
            mb: { xs: 8, md: 15 }
          }}
        >
          {/* Subtle Ambient Glow inside card */}
          {isDark && (
            <Box sx={{
              position: 'absolute',
              bottom: '-20%',
              left: '-10%',
              width: '60%',
              height: '60%',
              background: 'radial-gradient(circle, rgba(37, 99, 235, 0.2) 0%, transparent 60%)',
              filter: 'blur(100px)',
              pointerEvents: 'none',
            }} />
          )}

          {/* Responsive Adorable Cat Hero Image */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: { xs: -100, md: -50, lg: 0 },
              bottom: 0,
              width: { xs: '100%', md: '55%', lg: '50%' },
              backgroundImage: 'url("/assets/cat_hero.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: isDark ? 0.7 : 0.8,
              filter: 'blur(3px)',
              maskImage: {
                xs: 'linear-gradient(to bottom, transparent 0%, black 100%)',
                md: 'linear-gradient(to right, transparent 0%, black 40%)'
              },
              pointerEvents: 'none',
              zIndex: 1
            }}
          />

          {/* Hero Content */}
          <Box sx={{ maxWidth: 700, position: 'relative', zIndex: 2, textAlign: 'center', mx: 'auto', py: { xs: 4, md: 6 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 3 }}>
              <AutoAwesome sx={{ color: theme.palette.primary.main, fontSize: 24 }} />
              <Typography variant="overline" sx={{ letterSpacing: '0.3em', fontWeight: 800, color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>
                YEREL MOTOR İLE GÜÇLENDİRİLDİ
              </Typography>
            </Box>
            <Typography
              variant="h1"
              sx={{
                fontWeight: 900,
                letterSpacing: '-0.04em',
                mb: 3,
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '5rem' },
                lineHeight: 1,
                color: 'text.primary',
                background: isDark ? 'linear-gradient(to bottom, #fff 60%, rgba(255,255,255,0.7) 100%)' : 'none',
                WebkitBackgroundClip: isDark ? 'text' : 'none',
                WebkitTextFillColor: isDark ? 'transparent' : 'inherit'
              }}
            >
              Kitaplarınızı <br /> anında bulun
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                fontSize: { xs: '1rem', md: '1.25rem' },
                lineHeight: 1.6,
                mb: 5,
                maxWidth: 520,
                mx: 'auto',
                fontWeight: 500
              }}
            >
              E-Kütüphane, PDF ve EPUB koleksiyonunuzu yönetmek için en gelişmiş araçtır. Anında arama, yerel erişim ve inanılmaz hız.
            </Typography>


            {/* Premium Search Bar */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                p: 1,
                maxWidth: 600,
                mx: 'auto',
                boxShadow: isDark ? '0 20px 50px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.05)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:focus-within': {
                  borderColor: theme.palette.primary.main,
                  background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#fff',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <TextField
                fullWidth
                variant="standard"
                placeholder="Kütüphanenizde arama yapın..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  disableUnderline: true,
                  startAdornment: (
                    <InputAdornment position="start" sx={{ pl: 2, pr: 1.5 }}>
                      <SearchIcon sx={{ color: theme.palette.text.secondary, fontSize: 24 }} />
                    </InputAdornment>
                  ),
                  sx: {
                    color: 'text.primary',
                    fontSize: '1.1rem',
                    fontWeight: 500,
                    height: 48
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={handleSearch}
                sx={{
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                  textTransform: 'none',
                  fontWeight: 800,
                  px: { xs: 3, sm: 5 },
                  height: 52,
                  fontSize: '1rem',
                  boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4)',
                  '&:hover': {
                    background: '#1d4ed8',
                    transform: 'scale(1.02)'
                  },
                  transition: 'all 0.2s'
                }}
              >
                Ara
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Features Section */}
        <Grid container spacing={4} sx={{ mb: { xs: 8, md: 15 } }}>
          {features.map((f, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Box
                sx={{
                  p: 5,
                  borderRadius: '32px',
                  background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  height: '100%',
                  transition: 'all 0.3s',
                  '&:hover': {
                    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                    borderColor: theme.palette.primary.main,
                    transform: 'translateY(-10px)'
                  }
                }}
              >
                <Box sx={{ mb: 3 }}>{f.icon}</Box>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 2, color: 'text.primary' }}>{f.title}</Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>{f.desc}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Quick Access Area */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 6, color: 'text.primary' }}>Hızlı Erişim</Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} justifyContent="center" alignItems="center">
            {quickLinks.map((link) => (
              <Button
                key={link.label}
                component={Link}
                to={link.path}
                startIcon={link.icon}
                sx={{
                  borderRadius: '20px',
                  px: 5,
                  py: 2,
                  bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                  color: 'text.primary',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                  width: { xs: '100%', sm: 'auto' },
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
                    borderColor: theme.palette.primary.main
                  },
                  transition: 'all 0.2s'
                }}
              >
                {link.label}
              </Button>
            ))}
          </Stack>
        </Box>
      </Container>

      {/* Footer */}
      <Box
        sx={{
          mt: 'auto',
          py: 10,
          px: 4,
          borderTop: '1px solid',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
          background: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6
        }}
      >
        <Stack direction="row" spacing={6} sx={{ flexWrap: 'wrap', justifyContent: 'center', gap: 4 }}>
          {['Gizlilik Politikası', 'Kullanım Koşulları', 'İletişim', 'Destek'].map((label) => (
            <Typography
              key={label}
              component={Link}
              to="#"
              sx={{
                textDecoration: 'none',
                color: 'text.secondary',
                fontSize: '0.95rem',
                fontWeight: 600,
                '&:hover': { color: 'text.primary' }
              }}
            >
              {label}
            </Typography>
          ))}
        </Stack>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.05em' }}>
          © 2024 E-KÜTÜPHANE. TÜM HAKLARI SAKLIDIR.
        </Typography>
      </Box>
    </Box>
  );
};

export default Home;
