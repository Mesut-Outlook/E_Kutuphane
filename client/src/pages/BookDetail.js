import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Chip,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  AutoStories,
  PictureAsPdf,
  Person,
  Folder,
  CalendarToday,
  Download,
  ArrowBack,
  Launch,
} from '@mui/icons-material';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookDetail();
  }, [id]);

  const fetchBookDetail = async () => {
    try {
      const response = await axios.get(`/api/books/${id}`);
      setBook(response.data);
    } catch (error) {
      console.error('Kitap detayı yükleme hatası:', error);
      setError('Kitap bulunamadı');
    }
    setLoading(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const getFileIcon = (extension) => {
    return extension === 'epub' ? <AutoStories /> : <PictureAsPdf />;
  };

  const getFileColor = (extension) => {
    return extension === 'epub' ? 'primary' : 'secondary';
  };

  const extractPath = (fullPath) => {
    // Windows path formatını parse et
    const parts = fullPath.split('\\');
    return parts.slice(0, -1).join('\\');
  };

  const handleOpenFolder = async () => {
    try {
      await axios.post('/api/open-folder', { filePath: book.filePath });
    } catch (error) {
      console.error('Klasör açma hatası:', error);
      alert('Klasör açılırken bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Kitap yükleniyor...</Typography>
      </Container>
    );
  }

  if (error || !book) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Kitap bulunamadı'}
        </Alert>
        <Button onClick={() => navigate('/books')} startIcon={<ArrowBack />}>
          Kitap Listesine Dön
        </Button>
      </Container>
    );
  }

  const isEpub = book.fileExtension === 'epub';
  const gradientColor = isEpub
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Geri Dönüş Butonu */}
      <Button
        onClick={() => navigate(-1)}
        startIcon={<ArrowBack />}
        sx={{
          mb: 3,
          fontWeight: 600,
          '&:hover': {
            transform: 'translateX(-4px)',
          },
          transition: 'transform 0.2s',
        }}
      >
        Geri Dön
      </Button>

      {/* Hero Section */}
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          borderRadius: 4,
          overflow: 'hidden',
          background: gradientColor,
          position: 'relative',
        }}
      >
        <Box sx={{ p: 6, position: 'relative' }}>
          <Grid container spacing={4} alignItems="center">
            {/* Book Cover Visual */}
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  aspectRatio: '3/4',
                  borderRadius: 3,
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  p: 4,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                }}
              >
                {getFileIcon(book.fileExtension)}
                <Typography
                  variant="h3"
                  sx={{
                    color: 'white',
                    fontWeight: 700,
                    mt: 2,
                    textAlign: 'center',
                  }}
                >
                  {book.fileExtension.toUpperCase()}
                </Typography>
              </Box>
            </Grid>

            {/* Book Info */}
            <Grid item xs={12} md={8}>
              <Box sx={{ color: 'white' }}>
                <Typography
                  variant="h3"
                  component="h1"
                  sx={{
                    fontWeight: 800,
                    mb: 2,
                    textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                  }}
                >
                  {book.title}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Person sx={{ mr: 1, fontSize: 28 }} />
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {book.author}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                  <Chip
                    icon={getFileIcon(book.fileExtension)}
                    label={`${book.fileExtension.toUpperCase()} Dosyası`}
                    sx={{
                      background: 'rgba(255,255,255,0.25)',
                      backdropFilter: 'blur(10px)',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '1rem',
                      height: 40,
                      border: '2px solid rgba(255,255,255,0.3)',
                      '& .MuiChip-icon': {
                        color: 'white',
                        fontSize: 24,
                      },
                    }}
                  />
                  {book.genre && (
                    <Chip
                      label={book.genre}
                      sx={{
                        background: 'rgba(255,255,255,0.25)',
                        backdropFilter: 'blur(10px)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '1rem',
                        height: 40,
                        border: '2px solid rgba(255,255,255,0.3)',
                      }}
                    />
                  )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarToday sx={{ fontSize: 20 }} />
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Eklenme Tarihi: {formatDate(book.addedDate)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Detay Bilgileri */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Dosya Bilgileri */}
        <Grid item xs={12} md={6}>
          <Card
            variant="outlined"
            sx={{
              height: '100%',
              borderRadius: 3,
              border: '2px solid',
              borderColor: 'divider',
              transition: 'all 0.3s',
              '&:hover': {
                borderColor: isEpub ? '#667eea' : '#f5576c',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  pb: 2,
                  borderBottom: '3px solid',
                  borderImage: gradientColor,
                  borderImageSlice: 1,
                }}
              >
                📄 Dosya Bilgileri
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 600 }}>
                  Dosya Adı:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {book.fileName}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 600 }}>
                  Dosya Türü:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {book.fileExtension.toUpperCase()}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 600 }}>
                  Eklenme Tarihi:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarToday sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {formatDate(book.addedDate)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Konum Bilgileri */}
        <Grid item xs={12} md={6}>
          <Card
            variant="outlined"
            sx={{
              height: '100%',
              borderRadius: 3,
              border: '2px solid',
              borderColor: 'divider',
              transition: 'all 0.3s',
              '&:hover': {
                borderColor: isEpub ? '#667eea' : '#f5576c',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  pb: 2,
                  borderBottom: '3px solid',
                  borderImage: gradientColor,
                  borderImageSlice: 1,
                }}
              >
                📁 Konum Bilgileri
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                  Klasör Yolu:
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'grey.50',
                  }}
                >
                  <Folder sx={{ mr: 1, fontSize: 20, mt: 0.5, color: 'text.secondary' }} />
                  <Typography
                    variant="body2"
                    sx={{
                      wordBreak: 'break-all',
                      fontSize: '0.85rem',
                      fontFamily: 'monospace',
                      lineHeight: 1.6,
                    }}
                  >
                    {extractPath(book.filePath)}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Tam Yol:
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<Launch />}
                    onClick={handleOpenFolder}
                    sx={{
                      background: gradientColor,
                      color: 'white',
                      fontWeight: 600,
                      textTransform: 'none',
                      px: 2,
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      },
                    }}
                  >
                    Konumu Aç
                  </Button>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    wordBreak: 'break-all',
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    backgroundColor: 'grey.100',
                    p: 2,
                    borderRadius: 2,
                    lineHeight: 1.6,
                  }}
                >
                  {book.filePath}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Açıklama (varsa) */}
      {book.description && (
        <Paper
          elevation={0}
          sx={{
            mb: 4,
            p: 4,
            borderRadius: 3,
            border: '2px solid',
            borderColor: 'divider',
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              fontWeight: 700,
              mb: 2,
              pb: 2,
              borderBottom: '3px solid',
              borderImage: gradientColor,
              borderImageSlice: 1,
            }}
          >
            📖 Açıklama
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
            {book.description}
          </Typography>
        </Paper>
      )}

      {/* İşlem Butonları */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<Download />}
              onClick={() => {
                alert('Dosya indirme özelliği yakında eklenecek!');
              }}
              sx={{
                background: gradientColor,
                color: 'white',
                fontWeight: 600,
                py: 1.5,
                fontSize: '0.95rem',
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s',
              }}
            >
              Dosyayı İndir
            </Button>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              component={Link}
              to={`/books?author=${encodeURIComponent(book.author)}`}
              sx={{
                borderWidth: 2,
                borderColor: isEpub ? '#667eea' : '#f5576c',
                color: isEpub ? '#667eea' : '#f5576c',
                fontWeight: 600,
                py: 1.5,
                fontSize: '0.95rem',
                textTransform: 'none',
                '&:hover': {
                  borderWidth: 2,
                  background: isEpub ? 'rgba(102, 126, 234, 0.1)' : 'rgba(245, 87, 108, 0.1)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s',
              }}
            >
              Yazarın Diğer Kitapları
            </Button>
          </Grid>

          {book.genre && (
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                component={Link}
                to={`/books?genre=${encodeURIComponent(book.genre)}`}
                sx={{
                  borderWidth: 2,
                  borderColor: isEpub ? '#667eea' : '#f5576c',
                  color: isEpub ? '#667eea' : '#f5576c',
                  fontWeight: 600,
                  py: 1.5,
                  fontSize: '0.95rem',
                  textTransform: 'none',
                  '&:hover': {
                    borderWidth: 2,
                    background: isEpub ? 'rgba(102, 126, 234, 0.1)' : 'rgba(245, 87, 108, 0.1)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                Aynı Türdeki Kitaplar
              </Button>
            </Grid>
          )}

          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              component={Link}
              to={`/books?fileType=${book.fileExtension}`}
              sx={{
                borderWidth: 2,
                borderColor: isEpub ? '#667eea' : '#f5576c',
                color: isEpub ? '#667eea' : '#f5576c',
                fontWeight: 600,
                py: 1.5,
                fontSize: '0.95rem',
                textTransform: 'none',
                '&:hover': {
                  borderWidth: 2,
                  background: isEpub ? 'rgba(102, 126, 234, 0.1)' : 'rgba(245, 87, 108, 0.1)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s',
              }}
            >
              Aynı Formattaki Kitaplar
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default BookDetail;
