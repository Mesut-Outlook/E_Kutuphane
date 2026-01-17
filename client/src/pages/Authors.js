import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Divider,
  Chip,
  Button,
  CircularProgress,
  Stack,
  Paper,
  Alert,
  useTheme,
} from '@mui/material';
import {
  Search,
  Person,
  LibraryBooks,
  AutoStories,
  Group,
  EmojiEvents,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = '/api';

const Authors = () => {
  const theme = useTheme();
  const [authors, setAuthors] = useState([]);
  const [filteredAuthors, setFilteredAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAuthors();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = authors.filter(author =>
        author.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAuthors(filtered);
    } else {
      setFilteredAuthors(authors);
    }
  }, [searchTerm, authors]);

  const fetchAuthors = async () => {
    try {
      const response = await axios.get(`${API_URL}/authors`);
      setAuthors(response.data);
      setFilteredAuthors(response.data);
    } catch (error) {
      console.error('Yazar yükleme hatası:', error);
    }
    setLoading(false);
  };

  const getAuthorStats = () => {
    if (authors.length === 0) return { total: 0, totalBooks: 0, avgBooks: 0 };
    const totalBooks = authors.reduce((sum, author) => sum + author.bookCount, 0);
    const avgBooks = (totalBooks / authors.length).toFixed(1);
    return {
      total: authors.length,
      totalBooks,
      avgBooks
    };
  };

  const stats = getAuthorStats();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', bgcolor: 'background.default' }}>
        <CircularProgress sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: { xs: 4, md: 8 }, color: 'text.primary', transition: 'background-color 0.3s ease' }}>
      <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 6 } }}>
        {/* Modern Header */}
        <Box sx={{ mb: { xs: 4, md: 6 }, textAlign: 'center' }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              letterSpacing: '-0.03em',
              background: theme.palette.mode === 'dark' ? 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)' : 'none',
              WebkitBackgroundClip: theme.palette.mode === 'dark' ? 'text' : 'none',
              WebkitTextFillColor: theme.palette.mode === 'dark' ? 'transparent' : 'inherit',
              mb: 1,
              fontSize: { xs: '2.5rem', md: '3.75rem' }
            }}
          >
            Yazarlar
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Koleksiyonunuzdaki değerli yazar ve eserleri keşfedin
          </Typography>
        </Box>

        {/* Search and Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '20px',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <TextField
                fullWidth
                placeholder="Yazar ismine göre ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: 'text.secondary', ml: 1 }} />
                    </InputAdornment>
                  ),
                  sx: { bgcolor: 'action.hover', borderRadius: '14px', '& fieldset': { border: 'none' } }
                }}
                variant="outlined"
              />
            </Paper>
          </Grid>
          {[
            { label: 'Toplam Yazar', value: stats.total, icon: <Group /> },
            { label: 'Toplam Eser', value: stats.totalBooks, icon: <LibraryBooks /> },
            { label: 'Yazar Başına Eser', value: stats.avgBooks, icon: <EmojiEvents /> },
          ].map((card, index) => (
            <Grid item xs={12} md={4} key={card.label} sx={{ display: index === 0 ? { xs: 'block', md: 'none' } : 'block' }}>
              <Card sx={{
                borderRadius: '20px',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2.5} alignItems="center">
                    <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)', color: 'primary.main', display: 'flex' }}>
                      {React.cloneElement(card.icon, { sx: { fontSize: 24 } })}
                    </Box>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>{card.value}</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>{card.label}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Authors List */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 4 },
            borderRadius: '24px',
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: theme.palette.mode === 'dark' ? '0 20px 40px rgba(0,0,0,0.2)' : '0 10px 30px rgba(0,0,0,0.05)',
          }}
        >
          <Grid container spacing={2}>
            {filteredAuthors.map((author) => (
              <Grid item xs={12} md={6} key={author.author}>
                <Card
                  sx={{
                    borderRadius: '16px',
                    bgcolor: 'action.hover',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: 'action.selected',
                      borderColor: 'primary.main',
                      transform: 'translateX(8px)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 2, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{ p: 1, borderRadius: '10px', bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', color: 'text.secondary' }}>
                        <Person />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>{author.author}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>{author.bookCount} kitap</Typography>
                      </Box>
                    </Stack>
                    <Button
                      component={Link}
                      to={`/books?author=${encodeURIComponent(author.author)}`}
                      variant="text"
                      sx={{ color: 'primary.main', fontWeight: 600 }}
                      endIcon={<AutoStories />}
                    >
                      Eserleri Gör
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {filteredAuthors.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Person sx={{ fontSize: 64, color: 'text.disabled', mb: 2, opacity: 0.2 }} />
              <Typography variant="h6" color="text.secondary">Aradığınız yazar bulunamadı.</Typography>
              <Button onClick={() => setSearchTerm('')} sx={{ mt: 2, color: 'primary.main' }}>Aramayı Temizle</Button>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default Authors;
