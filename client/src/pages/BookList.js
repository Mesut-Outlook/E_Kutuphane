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
  Pagination,
  Chip,
  Button,
  CircularProgress,
  Paper,
  Autocomplete,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  LinearProgress,
  Alert,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
} from '@mui/material';
import {
  Search,
  Settings,
  FolderOpen,
  AutoStories,
  FilterAltOff,
  ViewModule,
  ViewList,
} from '@mui/icons-material';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = '/api';

const BookList = () => {
  const theme = useTheme();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [authors, setAuthors] = useState([]);
  const [genres, setGenres] = useState([]);
  const [viewMode, setViewMode] = useState('grid');

  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    author: searchParams.get('author') || '',
    fileType: searchParams.get('fileType') || '',
    genre: searchParams.get('genre') || '',
    page: parseInt(searchParams.get('page')) || 1,
  });

  // Tarama Dialog State
  const [openScanDialog, setOpenScanDialog] = useState(false);
  const [scanPath, setScanPath] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => {
    fetchBooks();
    fetchAuthors();
    fetchGenres();
  }, [filters]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const response = await axios.get(`${API_URL}/books?${params.toString()}`);
      setBooks(response.data.books);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Kitap yükleme hatası:', error);
    }
    setLoading(false);
  };

  const fetchAuthors = async () => {
    try {
      const response = await axios.get(`${API_URL}/authors`);
      setAuthors(response.data);
    } catch (error) {
      console.error('Yazar yükleme hatası:', error);
    }
  };

  const fetchGenres = async () => {
    try {
      const response = await axios.get(`${API_URL}/genres`);
      setGenres(response.data);
    } catch (error) {
      console.error('Tür yükleme hatası:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    const newParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== 1) newParams.set(k, v);
    });
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setFilters({ search: '', author: '', fileType: '', genre: '', page: 1 });
    setSearchParams({});
  };

  const handleScan = async () => {
    if (!scanPath) return;
    setScanning(true);
    setScanResult(null);
    try {
      const response = await axios.post(`${API_URL}/scan`, { dirPath: scanPath });
      setScanResult(response.data);
      if (response.data.addedCount > 0 || response.data.removedCount > 0) {
        fetchBooks();
      }
    } catch (error) {
      console.error('Tarama hatası:', error);
      setScanResult({ error: error.response?.data?.error || 'Tarama hatası' });
    }
    setScanning(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: { xs: 4, md: 8 }, color: 'text.primary', transition: 'background-color 0.3s ease' }}>
      <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 6 } }}>
        {/* Header Section */}
        <Box sx={{ mb: { xs: 4, md: 6 }, textAlign: 'center', position: 'relative' }}>
          <Box sx={{ position: 'absolute', right: 0, top: 0 }}>
            <IconButton onClick={() => setOpenScanDialog(true)} sx={{ color: 'text.secondary' }}>
              <Settings />
            </IconButton>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em', fontSize: { xs: '2rem', md: '3rem' } }}>
            Kitap Koleksiyonu
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {pagination.total?.toLocaleString() || '0'} kitap arasından seçim yapın
          </Typography>
        </Box>

        {/* Filter Area */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 4 },
            borderRadius: '24px',
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            mb: 4,
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block', fontWeight: 600 }}>
                Kitap adı, yazar veya ID
              </Typography>
              <TextField
                fullWidth
                placeholder="Kitap adı, yazar veya ID"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  sx: { bgcolor: 'action.hover', borderRadius: '12px', border: '1px solid', borderColor: 'divider', color: 'text.primary', '& fieldset': { border: 'none' } }
                }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block', fontWeight: 600 }}>
                Yazar
              </Typography>
              <Autocomplete
                options={authors}
                getOptionLabel={(o) => o.author}
                value={authors.find(a => a.author === filters.author) || null}
                onChange={(e, v) => handleFilterChange('author', v?.author || '')}
                slotProps={{
                  paper: {
                    sx: {
                      minWidth: 350,
                      maxHeight: 400,
                    }
                  },
                  listbox: {
                    sx: {
                      '& .MuiAutocomplete-option': {
                        whiteSpace: 'nowrap',
                        overflow: 'visible',
                        padding: '10px 16px',
                        fontSize: '0.95rem',
                      }
                    }
                  }
                }}
                sx={{
                  minWidth: 200,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'action.hover',
                    borderRadius: '12px',
                    '& fieldset': { border: 'none' }
                  },
                  '& .MuiInputBase-input': {
                    minWidth: '150px !important',
                  }
                }}
                renderInput={(params) => <TextField {...params} placeholder="Yazar Seçiniz" />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block', fontWeight: 600 }}>
                Tür
              </Typography>
              <Autocomplete
                options={genres}
                getOptionLabel={(o) => o.genre}
                value={genres.find(g => g.genre === filters.genre) || null}
                onChange={(e, v) => handleFilterChange('genre', v?.genre || '')}
                slotProps={{
                  paper: {
                    sx: {
                      minWidth: 300,
                      maxHeight: 400,
                    }
                  },
                  listbox: {
                    sx: {
                      '& .MuiAutocomplete-option': {
                        whiteSpace: 'nowrap',
                        overflow: 'visible',
                        padding: '10px 16px',
                        fontSize: '0.95rem',
                      }
                    }
                  }
                }}
                sx={{
                  minWidth: 180,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'action.hover',
                    borderRadius: '12px',
                    '& fieldset': { border: 'none' }
                  },
                  '& .MuiInputBase-input': {
                    minWidth: '120px !important',
                  }
                }}
                renderInput={(params) => <TextField {...params} placeholder="Tür Seçiniz" />}
              />
            </Grid>


            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Dosya Türü:</Typography>
                <ToggleButtonGroup
                  value={filters.fileType}
                  exclusive
                  onChange={(e, v) => handleFilterChange('fileType', v)}
                  sx={{
                    bgcolor: 'action.selected',
                    borderRadius: '12px',
                    p: 0.5,
                    '& .MuiToggleButton-root': {
                      border: 'none',
                      color: 'text.secondary',
                      px: { xs: 2, sm: 3 },
                      height: 36,
                      borderRadius: '8px !important',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      '&.Mui-selected': { bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' } },
                      '&:hover': { bgcolor: 'action.hover' }
                    }
                  }}
                >
                  <ToggleButton value="">TÜMÜ</ToggleButton>
                  <ToggleButton value="epub">EPUB</ToggleButton>
                  <ToggleButton value="pdf">PDF</ToggleButton>
                </ToggleButtonGroup>
              </Box>
              <Button
                startIcon={<FilterAltOff />}
                onClick={clearFilters}
                sx={{
                  textTransform: 'none',
                  color: 'text.secondary',
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: 'divider',
                  px: 3,
                  fontWeight: 600,
                  '&:hover': { borderColor: 'error.main', color: 'error.main' }
                }}
              >
                Filtreleri Temizle
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Results Info and View Toggle */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {pagination.total} kitaptan {((filters.page - 1) * (pagination.limit || 20)) + 1}-{Math.min(filters.page * (pagination.limit || 20), pagination.total)} arası gösteriliyor
          </Typography>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, v) => v && setViewMode(v)}
            size="small"
            sx={{ bgcolor: 'action.selected', borderRadius: '10px', p: 0.5 }}
          >
            <ToggleButton value="grid" sx={{ border: 'none', color: 'text.secondary', borderRadius: '8px !important', '&.Mui-selected': { bgcolor: 'background.paper', color: 'text.primary', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' } }}>
              <ViewModule sx={{ mr: 1, fontSize: 18 }} /> Kart
            </ToggleButton>
            <ToggleButton value="list" sx={{ border: 'none', color: 'text.secondary', borderRadius: '8px !important', '&.Mui-selected': { bgcolor: 'background.paper', color: 'text.primary', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' } }}>
              <ViewList sx={{ mr: 1, fontSize: 18 }} /> Liste
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Book Grid */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress sx={{ color: '#6366f1' }} />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {books.map((book) => {
              const isPdf = book.fileExtension?.toLowerCase() === 'pdf';
              const isEpub = book.fileExtension?.toLowerCase() === 'epub';
              const accentColor = isPdf ? '#f43f5e' : (isEpub ? '#3b82f6' : '#6366f1');

              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: '16px',
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: theme.palette.mode === 'dark'
                          ? `0 10px 30px rgba(0, 0, 0, 0.5), 0 0 1px ${accentColor}`
                          : `0 10px 30px rgba(0, 0, 0, 0.1), 0 0 1px ${accentColor}`,
                        borderColor: accentColor
                      }
                    }}
                  >
                    <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                      <Chip
                        label={book.fileExtension?.toUpperCase()}
                        size="small"
                        sx={{
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          bgcolor: accentColor,
                          color: 'white',
                          borderRadius: '6px'
                        }}
                      />
                    </Box>
                    <CardContent sx={{ p: 3, flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, mt: 1, color: 'text.primary', lineHeight: 1.3, minHeight: '3.4em', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: '1.1rem' }}>
                        {book.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, fontWeight: 500 }}>
                        {book.author || 'Bilinmiyor'}
                      </Typography>
                      {book.genre && (
                        <Chip
                          label={book.genre}
                          size="small"
                          sx={{
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(244, 63, 94, 0.1)' : 'rgba(244, 63, 94, 0.05)',
                            color: '#f43f5e',
                            borderRadius: '8px',
                            fontSize: '0.7rem',
                            fontWeight: 600
                          }}
                        />
                      )}
                      <Typography variant="caption" sx={{ display: 'block', mt: 2.5, color: 'text.disabled', wordBreak: 'break-all', fontSize: '0.65rem' }}>
                        {book.fileName}
                      </Typography>
                    </CardContent>
                    <Button
                      component={Link}
                      to={`/books/${book.id}`}
                      fullWidth
                      sx={{
                        py: 2,
                        bgcolor: accentColor,
                        color: '#fff',
                        fontWeight: 700,
                        borderRadius: 0,
                        textTransform: 'none',
                        fontSize: '1rem',
                        '&:hover': {
                          bgcolor: accentColor,
                          filter: 'brightness(1.1)'
                        }
                      }}
                    >
                      Detayları Gör
                    </Button>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <Pagination
              count={pagination.totalPages}
              page={filters.page}
              onChange={(e, p) => handleFilterChange('page', p)}
              sx={{
                '& .MuiPaginationItem-root': { color: 'text.secondary', fontWeight: 600 },
                '& .Mui-selected': { bgcolor: 'primary.main !important', color: 'primary.contrastText' }
              }}
            />
          </Box>
        )}
      </Container>

      {/* Scan Dialog */}
      <Dialog
        open={openScanDialog}
        onClose={() => !scanning && setOpenScanDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: '24px',
            bgcolor: 'background.paper',
            color: 'text.primary',
            p: 1,
            border: '1px solid',
            borderColor: 'divider',
            backgroundImage: 'none'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Tarama ve Ayarlar</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.secondary', mb: 3 }}>
            Kitap koleksiyonunuzu taramak için klasör yolu belirtin. Yeni kitaplar eklenecek, silinenler kaldırılacaktır.
          </DialogContentText>
          <TextField
            fullWidth
            label="Klasör Yolu"
            value={scanPath}
            onChange={(e) => setScanPath(e.target.value)}
            disabled={scanning}
            placeholder="/Volumes/Disk/Books"
            sx={{
              '& .MuiInputBase-root': { color: 'text.primary', borderRadius: '12px', bgcolor: 'action.hover' },
              '& label': { color: 'text.secondary' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' }
            }}
          />
          {scanning && <LinearProgress sx={{ mt: 3, borderRadius: '4px', height: 6 }} />}
          {scanResult && !scanning && (
            <Alert sx={{ mt: 3, borderRadius: '12px' }} severity={scanResult.error ? "error" : "success"}>
              {scanResult.error || `Tarama tamamlandı: ${scanResult.addedCount} yeni kitap eklendi, ${scanResult.removedCount} kitap kaldırıldı.`}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenScanDialog(false)} sx={{ color: 'text.secondary', fontWeight: 600 }}>Kapat</Button>
          <Button onClick={handleScan} variant="contained" disabled={scanning || !scanPath} sx={{ borderRadius: '12px', px: 4, fontWeight: 700 }}>Taramayı Başlat</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookList;
