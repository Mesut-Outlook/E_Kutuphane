import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  ButtonBase,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  AutoStories,
  BarChart,
  Category,
  LibraryBooks,
  People,
  PictureAsPdf,
  Search,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import axios from 'axios';

const palette = {
  midnight: '#0f172a',
  ocean: '#0b6fa4',
  teal: '#0f9d58',
  coral: '#ff6f61',
  sand: '#f6f7fb',
};

const statisticCards = (stats) => {
  const fileTypeCount = (ext) =>
    stats.fileTypes?.find((item) => item.fileExtension === ext)?.count ?? 0;

  return [
    {
      label: 'Toplam Kitap',
      value: stats.totalBooks?.toLocaleString() || '0',
      icon: <LibraryBooks sx={{ fontSize: 42, color: palette.ocean }} />,
      to: '/books',
    },
    {
      label: 'Toplam Yazar',
      value: stats.totalAuthors?.toLocaleString() || '0',
      icon: <People sx={{ fontSize: 42, color: palette.teal }} />,
      to: '/authors',
    },
    {
      label: 'EPUB',
      value: fileTypeCount('epub').toLocaleString(),
      icon: <AutoStories sx={{ fontSize: 42, color: palette.teal }} />,
      to: '/books?fileType=epub',
    },
    {
      label: 'PDF',
      value: fileTypeCount('pdf').toLocaleString(),
      icon: <PictureAsPdf sx={{ fontSize: 42, color: palette.coral }} />,
      to: '/books?fileType=pdf',
    },
  ];
};

const Home = () => {
  const [stats, setStats] = useState({});
  const [recentBooks, setRecentBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [statsRes, booksRes, genresRes] = await Promise.all([
          axios.get('/api/stats'),
          axios.get('/api/books?limit=8'),
          axios.get('/api/genres'),
        ]);
        setStats(statsRes.data);
        setRecentBooks(booksRes.data.books ?? []);
        setGenres(genresRes.data ?? []);
      } catch (error) {
        console.error('Ana sayfa verileri alınamadı:', error);
      }
    };

    bootstrap();
  }, []);

  const heroStats = useMemo(
    () => [
      {
        label: 'Toplam Kitap',
        value: stats.totalBooks?.toLocaleString() || '0',
        sub: 'Katalogdaki kayıtlar',
        href: '/books',
      },
      {
        label: 'Toplam Yazar',
        value: stats.totalAuthors?.toLocaleString() || '0',
        sub: 'Farklı yazar sayısı',
        href: '/authors',
      },
      {
        label: 'Son Eklenenler',
        value: recentBooks.length.toLocaleString(),
        sub: 'Bu hafta gelenler',
        href: '/books?sort=newest',
      },
    ],
    [stats.totalBooks, stats.totalAuthors, recentBooks.length]
  );

  const featuredBooks = recentBooks.slice(0, 4);
  const genreList = genres
    .filter((g) => g.genre)
    .slice(0, 18)
    .map((item) => ({
      ...item,
      displayCount: item.bookCount?.toLocaleString() ?? '0',
    }));

  const handleHeroSearch = () => {
    const query = searchTerm.trim();
    const href = query ? `/books?search=${encodeURIComponent(query)}` : '/books';
    window.location.href = href;
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 0)',
        backgroundSize: '32px 32px',
        pb: 5,
      }}
    >
      <Container maxWidth="xl" sx={{ pt: 3 }}>
        {/* Compact Hero Section */}
        <Box
          sx={{
            borderRadius: 4,
            p: { xs: 3, md: 4 },
            background: 'linear-gradient(135deg, #0f172a 0%, #0b6fa4 100%)',
            color: 'white',
            boxShadow: '0 10px 40px rgba(15, 37, 73, 0.2)',
            mb: 4,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'radial-gradient(circle at 100% 0%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            }}
          />

          <Grid container alignItems="center" spacing={3}>
            <Grid item xs={12} md={7}>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                Hoş geldin!
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600 }}>
                {stats.totalBooks?.toLocaleString()} kitaplık arşivinde keşfe çık.
              </Typography>
            </Grid>
            <Grid item xs={12} md={5}>
              <Stack direction="row" spacing={1}>
                <TextField
                  size="small"
                  placeholder="Hızlı arama..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: 'white' }} />
                      </InputAdornment>
                    ),
                    sx: {
                      bgcolor: 'rgba(255,255,255,0.15)',
                      color: 'white',
                      borderRadius: 2,
                      '& fieldset': { border: 'none' }
                    }
                  }}
                  sx={{ flex: 1 }}
                />
                <Button
                  variant="contained"
                  onClick={handleHeroSearch}
                  sx={{ bgcolor: 'white', color: '#0b6fa4', fontWeight: 'bold', '&:hover': { bgcolor: '#f1f5f9' } }}
                >
                  Ara
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>

        {/* Stats Row - Top Dashboard */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {statisticCards(stats).map((card) => (
            <Grid item xs={6} md={3} key={card.label}>
              <Card
                component={Link}
                to={card.to}
                sx={{
                  textDecoration: 'none',
                  borderRadius: 3,
                  boxShadow: 'none',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    borderColor: '#cbd5e1',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                  }
                }}
              >
                <CardContent sx={{ p: '20px !important' }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: '#f1f5f9',
                        display: 'flex',
                        color: typeof card.icon.props.sx.color === 'string' ? card.icon.props.sx.color : 'inherit'
                      }}
                    >
                      {React.cloneElement(card.icon, { sx: { fontSize: 24 } })}
                    </Box>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>
                        {card.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {card.label}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Stack Layout - Full Width Rows */}
        <Stack spacing={4}>

          {/* Row 1: Quick Actions & Filters */}
          <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid #e2e8f0', p: 1 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" spacing={2} sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
                <Category color="primary" /> Kütüphane:
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flex: 1, overflowX: 'auto', pb: { xs: 1, md: 0 }, width: '100%' }}>
                <Button component={Link} to="/books?fileType=epub" variant="outlined" size="small" sx={{ borderRadius: 2, borderColor: '#cbd5e1', color: '#475569' }}>
                  EPUB Kitaplar
                </Button>
                <Button component={Link} to="/books?fileType=pdf" variant="outlined" size="small" sx={{ borderRadius: 2, borderColor: '#cbd5e1', color: '#475569' }}>
                  PDF Dokümanlar
                </Button>
                <Button component={Link} to="/books?sort=newest" variant="outlined" size="small" sx={{ borderRadius: 2, borderColor: '#cbd5e1', color: '#475569' }}>
                  Son Eklenenler
                </Button>
                <Button component={Link} to="/authors" variant="outlined" size="small" sx={{ borderRadius: 2, borderColor: '#cbd5e1', color: '#475569' }}>
                  Tüm Yazarlar
                </Button>
              </Stack>
            </Stack>
          </Card>

          {/* Row 2: Categories (Horizontal Scroll) */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Kategorilere Göz At
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ overflowX: 'auto', pb: 2, '::-webkit-scrollbar': { height: 6 } }}>
              {genreList.map((genre) => (
                <Chip
                  key={genre.genre}
                  label={`${genre.genre} (${genre.displayCount})`}
                  component={Link}
                  to={`/books?genre=${encodeURIComponent(genre.genre)}`}
                  clickable
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    borderColor: '#cbd5e1',
                    bgcolor: 'white',
                    fontWeight: 500,
                    '&:hover': { bgcolor: '#f1f5f9', borderColor: '#0b6fa4', color: '#0b6fa4' },
                    flexShrink: 0
                  }}
                />
              ))}
            </Stack>
          </Box>

          {/* Row 3: Recent Books (Full Grid) */}
          <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Son Eklenenler
              </Typography>
              <Button component={Link} to="/books" endIcon={<AutoStories />}>
                Tüm Kitapları İncele
              </Button>
            </Stack>

            <Grid container spacing={3}>
              {recentBooks.slice(0, 12).map((book) => (
                <Grid item xs={12} sm={6} md={3} lg={3} key={book.id}>
                  <Card
                    component={Link}
                    to={`/books/${book.id}`}
                    sx={{
                      height: '100%',
                      textDecoration: 'none',
                      borderRadius: 3,
                      boxShadow: 'none',
                      border: '1px solid #e2e8f0',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }
                    }}
                  >
                    <Box sx={{ height: 160, bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                      <AutoStories sx={{ fontSize: 56 }} />
                    </Box>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, lineHeight: 1.3 }} noWrap>
                        {book.title}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary" noWrap sx={{ mb: 1 }}>
                        {book.author}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Chip
                          label={book.fileExtension?.toUpperCase()}
                          size="small"
                          sx={{ height: 20, fontSize: '0.65rem', borderRadius: 1, bgcolor: '#e2e8f0' }}
                        />
                        {book.genre && (
                          <Chip
                            label={book.genre}
                            size="small"
                            sx={{ height: 20, fontSize: '0.65rem', borderRadius: 1, maxWidth: 100 }}
                          />
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

        </Stack>

      </Container>
    </Box>
  );
};

export default Home;
