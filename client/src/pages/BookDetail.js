import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  Chip,
  CircularProgress,
  Stack,
  useTheme,
  Divider,
} from '@mui/material';
import {
  ArrowBack,
  PictureAsPdf,
  AutoStories,
  FolderOpen,
  Schedule,
  Person,
  LocalOffer,
  Download,
  Folder,
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = '/api';

const BookDetail = () => {
  const { id } = useParams();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/books/${id}`);
        setBook(response.data);
        setError(null);
      } catch (err) {
        console.error('Kitap getirme hatası:', err);
        setError('Kitap bilgileri yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', bgcolor: 'background.default' }}>
        <CircularProgress sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  if (error || !book) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>{error || 'Kitap bulunamadı.'}</Typography>
          <Button component={Link} to="/books" startIcon={<ArrowBack />} sx={{ mt: 2, color: 'primary.main' }}>Listeye Dön</Button>
        </Container>
      </Box>
    );
  }

  const isEpub = book.fileExtension?.toLowerCase() === 'epub';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: { xs: 4, md: 10 }, color: 'text.primary', transition: 'background-color 0.3s ease' }}>
      <Container maxWidth="lg" sx={{ pt: 4 }}>
        {/* Back Button */}
        <Button
          component={Link}
          to="/books"
          startIcon={<ArrowBack />}
          sx={{
            mb: 4,
            color: 'text.secondary',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.9rem',
            '&:hover': { color: 'text.primary' }
          }}
        >
          GERİ DÖN
        </Button>

        {/* Hero Card */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: '24px',
            background: isDark
              ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(241, 245, 249, 0.9) 100%)',
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 4,
            mb: 4
          }}
        >
          {/* Icon Container */}
          <Box
            sx={{
              width: 140,
              height: 180,
              bgcolor: isDark ? '#fff' : 'action.selected',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              mx: { xs: 'auto', sm: 0 },
              boxShadow: isDark ? 'none' : 'inset 0 0 20px rgba(0,0,0,0.05)'
            }}
          >
            {isEpub ? (
              <AutoStories sx={{ fontSize: 60, color: '#3b82f6' }} />
            ) : (
              <PictureAsPdf sx={{ fontSize: 60, color: '#f43f5e' }} />
            )}
            <Typography sx={{ fontWeight: 900, color: isDark ? '#000' : 'text.primary', mt: 1 }}>
              {book.fileExtension?.toUpperCase()}
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, lineHeight: 1.2, fontSize: { xs: '1.75rem', md: '2.125rem' } }}>
              {book.title}
            </Typography>
            <Stack direction="row" spacing={3} alignItems="center" sx={{ flexWrap: 'wrap', gap: 2, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                <Person sx={{ fontSize: 20 }} />
                <Typography variant="body2">{book.author || 'Bilinmiyor'}</Typography>
              </Box>
              {book.genre && (
                <Chip
                  icon={<LocalOffer sx={{ fontSize: '16px !important', color: 'inherit !important' }} />}
                  label={book.genre}
                  size="small"
                  sx={{
                    bgcolor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                    color: '#3b82f6',
                    fontWeight: 600,
                    borderRadius: '8px',
                    px: 0.5
                  }}
                />
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                <Schedule sx={{ fontSize: 20 }} />
                <Typography variant="body2">Ekleme: {new Date(book.createdAt).toLocaleDateString('tr-TR')}</Typography>
              </Box>
            </Stack>
          </Box>
        </Paper>

        <Grid container spacing={3}>
          {/* File Info */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                height: '100%',
                borderRadius: '24px',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Folder sx={{ color: 'primary.main' }} /> Dosya Bilgileri
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600 }}>Dosya Adı:</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, wordBreak: 'break-all' }}>{book.fileName}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600 }}>Dosya Türü:</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>{book.fileExtension?.toUpperCase()}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600 }}>Eklenme Tarihi:</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>{new Date(book.createdAt).toLocaleString('tr-TR')}</Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* Location Info */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                height: '100%',
                borderRadius: '24px',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <FolderOpen sx={{ color: 'primary.main' }} /> Konum Bilgileri
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600 }}>Klasör Yolu:</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>...</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600 }}>Tam Yol:</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, wordBreak: 'break-all' }}>{book.filePath}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<FolderOpen />}
                    sx={{
                      bgcolor: 'action.selected',
                      color: 'text.primary',
                      textTransform: 'none',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    Konuma Aç
                  </Button>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ mt: 6, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: { xs: 'center', md: 'flex-start' } }}>
          <Button
            variant="contained"
            startIcon={<Download />}
            sx={{
              bgcolor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(15, 23, 42, 0.05)',
              color: 'text.primary',
              borderRadius: '12px',
              px: 3,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              gap: 1,
              '&:hover': { bgcolor: isDark ? '#1e293b' : 'action.hover' }
            }}
          >
            Dosyayı İndir
          </Button>
          <Button
            variant="contained"
            sx={{
              bgcolor: 'rgba(37, 99, 235, 0.2)',
              color: '#3b82f6',
              borderRadius: '12px',
              px: 3,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.3)' }
            }}
          >
            Yazarın Diğer Kitapları
          </Button>
          <Button
            variant="contained"
            sx={{
              bgcolor: 'rgba(37, 99, 235, 0.1)',
              color: '#3b82f6',
              borderRadius: '12px',
              px: 3,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.2)' }
            }}
          >
            Aynı Türdeki Kitaplar
          </Button>
          <Button
            variant="contained"
            sx={{
              bgcolor: 'action.selected',
              color: 'text.secondary',
              borderRadius: '12px',
              px: 3,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            Aynı Formattaki Kitaplar
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default BookDetail;
