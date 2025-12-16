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
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search,
  AutoStories,
  PictureAsPdf,
  ViewModule,
  ViewList,
  Person,
  Category,
  AllInclusive,
  FilterAltOff,
  Close,
} from '@mui/icons-material';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [authors, setAuthors] = useState([]);
  const [genres, setGenres] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' veya 'list'
  const [fileTypeStats, setFileTypeStats] = useState({ total: 0, epub: 0, pdf: 0 });

  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    author: searchParams.get('author') || '',
    fileType: searchParams.get('fileType') || '',
    genre: searchParams.get('genre') || '',
    page: parseInt(searchParams.get('page')) || 1,
  });

  useEffect(() => {
    fetchBooks();
    fetchAuthors();
    fetchGenres();
  }, [filters]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await axios.get(`/api/books?${params.toString()}`);
      setBooks(response.data.books);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Kitap yükleme hatası:', error);
    }
    setLoading(false);
  };

  const fetchAuthors = async () => {
    try {
      const response = await axios.get('/api/authors');
      setAuthors(response.data.slice(0, 50)); // İlk 50 yazarı göster
    } catch (error) {
      console.error('Yazar yükleme hatası:', error);
    }
  };

  const fetchGenres = async () => {
    try {
      const response = await axios.get('/api/genres');
      setGenres(response.data);
    } catch (error) {
      console.error('Tür yükleme hatası:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/stats');
      const ft = response.data.fileTypes || [];
      const epub = ft.find((x) => x.fileExtension === 'epub')?.count || 0;
      const pdf = ft.find((x) => x.fileExtension === 'pdf')?.count || 0;
      setFileTypeStats({ total: response.data.totalBooks || epub + pdf, epub, pdf });
    } catch (error) {
      console.error('İstatistik yükleme hatası:', error);
    }
  };

  // Arama ikonu için tetikleyici
  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);

    // URL'yi güncelle
    const newParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== 1) newParams.set(k, v);
    });
    setSearchParams(newParams);
  };

  const handlePageChange = (event, value) => {
    const newFilters = { ...filters, page: value };
    setFilters(newFilters);

    const newParams = new URLSearchParams(searchParams);
    if (value > 1) {
      newParams.set('page', value);
    } else {
      newParams.delete('page');
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      author: '',
      fileType: '',
      genre: '',
      page: 1,
    });
    setSearchParams({});
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Modern Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 800,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            mb: 1,
          }}
        >
          Kitap Koleksiyonu
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ fontSize: '1.1rem', fontWeight: 500 }}
        >
          {pagination.total ? `${pagination.total.toLocaleString()} kitap arasından seçim yapın` : 'Kütüphanenizi keşfedin'}
        </Typography>
      </Box>

      {/* Filtreler */}
      <Box sx={{ mb: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            border: '2px solid',
            borderColor: 'divider',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%)',
            transition: 'all 0.3s',
            '&:hover': {
              borderColor: '#667eea',
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.1)',
            },
          }}
        >
          <Grid container spacing={2} alignItems="center">
            {/* Arama */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Kitap veya yazar ara..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                size="medium"
                sx={{
                  '& .MuiInputBase-root': { borderRadius: 2, height: 48 },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      {filters.search && (
                        <Tooltip title="Temizle">
                          <IconButton size="small" onClick={() => handleFilterChange('search', '')}>
                            <Close fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Ara">
                        <IconButton size="small" onClick={handleSearch}>
                          <Search fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Yazar */}
            <Grid item xs={12} sm={6} md={3}>
              <Autocomplete
                options={authors}
                getOptionLabel={(option) => option.author}
                value={authors.find((a) => a.author === filters.author) || null}
                onChange={(e, newVal) => handleFilterChange('author', newVal?.author || '')}
                clearOnEscape
                isOptionEqualToValue={(opt, val) => opt.author === val.author}
                noOptionsText="Yazar bulunamadı"
                ListboxProps={{
                  style: { maxHeight: '400px', fontSize: '1rem' }
                }}
                componentsProps={{
                  paper: {
                    sx: {
                      width: '500px',
                      maxWidth: '90vw',
                    }
                  }
                }}
                renderOption={(props, option) => (
                  <li {...props} style={{ padding: '12px 16px' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ fontSize: '1rem', fontWeight: 500 }}>
                        {option.author}
                      </Typography>
                      {option.bookCount != null && (
                        <Chip
                          label={option.bookCount}
                          size="small"
                          color="primary"
                          sx={{ ml: 2, minWidth: '45px', fontWeight: 600 }}
                        />
                      )}
                    </Box>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Yazar"
                    placeholder="Yazar ara veya seçin..."
                    size="medium"
                    sx={{ '& .MuiInputBase-root': { borderRadius: 2, height: 56 } }}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <Person />
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            {/* Tür */}
            <Grid item xs={12} sm={6} md={3}>
              <Autocomplete
                options={genres}
                getOptionLabel={(option) => option.genre}
                value={genres.find((g) => g.genre === filters.genre) || null}
                onChange={(e, newVal) => handleFilterChange('genre', newVal?.genre || '')}
                clearOnEscape
                isOptionEqualToValue={(opt, val) => opt.genre === val.genre}
                noOptionsText="Tür bulunamadı"
                ListboxProps={{
                  style: { maxHeight: '400px', fontSize: '1rem' }
                }}
                componentsProps={{
                  paper: {
                    sx: {
                      width: '500px',
                      maxWidth: '90vw',
                    }
                  }
                }}
                renderOption={(props, option) => (
                  <li {...props} style={{ padding: '12px 16px' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ fontSize: '1rem', fontWeight: 500 }}>
                        {option.genre}
                      </Typography>
                      {option.bookCount != null && (
                        <Chip
                          label={option.bookCount}
                          size="small"
                          color="secondary"
                          sx={{ ml: 2, minWidth: '45px', fontWeight: 600 }}
                        />
                      )}
                    </Box>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tür"
                    placeholder="Tür ara veya seçin..."
                    size="medium"
                    sx={{ '& .MuiInputBase-root': { borderRadius: 2, height: 56 } }}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <Category />
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            {/* Dosya Türü */}
            <Grid item xs={12} sm={8} md={6}>
              <Box>
                <Typography variant="caption" sx={{ ml: 0.5, color: 'text.secondary' }}>
                  Dosya Türü
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  color="primary"
                  value={filters.fileType}
                  onChange={(e, val) => handleFilterChange('fileType', val || '')}
                  size="small"
                  sx={{ mt: 0.5, flexWrap: 'wrap' }}
                >
                  <ToggleButton value="" aria-label="Tümü">
                    <AllInclusive fontSize="small" />
                    <Typography variant="caption" sx={{ ml: 0.5 }}>Tümü{fileTypeStats.total ? ` (${fileTypeStats.total.toLocaleString()})` : ''}</Typography>
                  </ToggleButton>
                  <ToggleButton value="epub" aria-label="EPUB">
                    <AutoStories fontSize="small" />
                    <Typography variant="caption" sx={{ ml: 0.5 }}>EPUB{fileTypeStats.epub ? ` (${fileTypeStats.epub.toLocaleString()})` : ''}</Typography>
                  </ToggleButton>
                  <ToggleButton value="pdf" aria-label="PDF">
                    <PictureAsPdf fontSize="small" />
                    <Typography variant="caption" sx={{ ml: 0.5 }}>PDF{fileTypeStats.pdf ? ` (${fileTypeStats.pdf.toLocaleString()})` : ''}</Typography>
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Grid>

            {/* Temizle */}
            <Grid item xs={12} sm={4} md={6}>
              <Button
                variant="outlined"
                startIcon={<FilterAltOff />}
                onClick={clearFilters}
                fullWidth
                size="large"
              >
                Temizle
              </Button>
            </Grid>

            {/* Seçili Filtreler */}
            <Grid item xs={12}>
              <Box sx={{ mt: 0.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {filters.search && (
                  <Chip label={`Arama: ${filters.search}`} onDelete={() => handleFilterChange('search', '')} />
                )}
                {filters.author && (
                  <Chip label={`Yazar: ${filters.author}`} onDelete={() => handleFilterChange('author', '')} />
                )}
                {filters.genre && (
                  <Chip label={`Tür: ${filters.genre}`} onDelete={() => handleFilterChange('genre', '')} />
                )}
                {filters.fileType && (
                  <Chip label={`Dosya: ${filters.fileType.toUpperCase()}`} onDelete={() => handleFilterChange('fileType', '')} />
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Görünüm Değiştirme ve Sonuç Bilgisi */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        {pagination.total && (
          <Typography variant="body1">
            {pagination.total.toLocaleString()} kitaptan {((pagination.page - 1) * pagination.limit + 1).toLocaleString()}-
            {Math.min(pagination.page * pagination.limit, pagination.total).toLocaleString()} arası gösteriliyor
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 1, p: 0.5, background: '#f5f5f5', borderRadius: 3 }}>
          <Button
            onClick={() => setViewMode('grid')}
            startIcon={<ViewModule />}
            sx={{
              borderRadius: 2.5,
              px: 3,
              textTransform: 'none',
              fontWeight: 600,
              color: viewMode === 'grid' ? 'white' : 'text.secondary',
              background: viewMode === 'grid'
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'transparent',
              boxShadow: viewMode === 'grid' ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
              '&:hover': {
                background: viewMode === 'grid'
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'rgba(0,0,0,0.05)',
              },
              transition: 'all 0.2s',
            }}
          >
            Kart
          </Button>
          <Button
            onClick={() => setViewMode('list')}
            startIcon={<ViewList />}
            sx={{
              borderRadius: 2.5,
              px: 3,
              textTransform: 'none',
              fontWeight: 600,
              color: viewMode === 'list' ? 'white' : 'text.secondary',
              background: viewMode === 'list'
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'transparent',
              boxShadow: viewMode === 'list' ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
              '&:hover': {
                background: viewMode === 'list'
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'rgba(0,0,0,0.05)',
              },
              transition: 'all 0.2s',
            }}
          >
            Liste
          </Button>
        </Box>
      </Box>

      {/* Kitap Listesi */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : viewMode === 'grid' ? (
        // Kart Görünümü
        <Grid container spacing={3}>
          {books.map((book) => {
            const isEpub = book.fileExtension === 'epub';
            const gradientColor = isEpub
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    borderRadius: 3,
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '6px',
                      background: gradientColor,
                    }
                  }}
                >
                  {/* File Type Badge */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      zIndex: 1,
                    }}
                  >
                    <Chip
                      icon={isEpub ? <AutoStories /> : <PictureAsPdf />}
                      label={book.fileExtension.toUpperCase()}
                      sx={{
                        background: gradientColor,
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        height: 32,
                        '& .MuiChip-icon': {
                          color: 'white',
                        },
                      }}
                    />
                  </Box>

                  <CardContent sx={{ flexGrow: 1, pt: 3, pb: 2, px: 3 }}>
                    {/* Title */}
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{
                        mb: 1.5,
                        mt: 1,
                        height: '3.6rem',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        lineHeight: 1.3,
                        color: 'text.primary',
                      }}
                    >
                      {book.title}
                    </Typography>

                    {/* Author */}
                    <Typography
                      color="text.secondary"
                      sx={{
                        mb: 2.5,
                        height: '1.5rem',
                        overflow: 'hidden',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                      }}
                    >
                      {book.author}
                    </Typography>

                    {/* Genre Tag */}
                    {book.genre && (
                      <Box sx={{ mb: 2 }}>
                        <Chip
                          label={book.genre}
                          size="small"
                          sx={{
                            backgroundColor: isEpub ? '#e3f2fd' : '#fce4ec',
                            color: isEpub ? '#1976d2' : '#c2185b',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            borderRadius: 2,
                          }}
                        />
                      </Box>
                    )}

                    {/* File Name */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontSize: '0.7rem',
                        opacity: 0.7,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {book.fileName}
                    </Typography>
                  </CardContent>

                  {/* Action Button */}
                  <Box sx={{ p: 3, pt: 0 }}>
                    <Button
                      component={Link}
                      to={`/books/${book.id}`}
                      variant="contained"
                      size="medium"
                      fullWidth
                      sx={{
                        background: gradientColor,
                        color: 'white',
                        fontWeight: 600,
                        py: 1.2,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '0.9rem',
                        boxShadow: 'none',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.2s',
                      }}
                    >
                      Detayları Gör
                    </Button>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        // Liste Görünümü
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {books.map((book) => {
            const isEpub = book.fileExtension === 'epub';
            const gradientColor = isEpub
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';

            return (
              <Card
                key={book.id}
                sx={{
                  borderRadius: 3,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateX(8px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    borderLeft: `6px solid ${isEpub ? '#667eea' : '#f093fb'}`,
                  },
                  borderLeft: '6px solid transparent',
                  pl: 0,
                }}
              >
                <CardContent sx={{ py: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={5}>
                      <Typography
                        variant="h6"
                        component="div"
                        noWrap
                        sx={{ fontWeight: 600 }}
                      >
                        {book.title}
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        {book.author}
                      </Typography>
                    </Grid>

                    <Grid item xs={6} sm={3} md={2}>
                      <Chip
                        icon={book.fileExtension === 'epub' ? <AutoStories /> : <PictureAsPdf />}
                        label={book.fileExtension.toUpperCase()}
                        sx={{
                          background: gradientColor,
                          color: 'white',
                          fontWeight: 700,
                          height: 28,
                          '& .MuiChip-icon': { color: 'white' },
                        }}
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={6} sm={3} md={3}>
                      {book.genre && (
                        <Chip
                          label={book.genre}
                          variant="outlined"
                          size="small"
                          sx={{
                            borderColor: isEpub ? '#667eea' : '#f5576c',
                            color: isEpub ? '#667eea' : '#f5576c',
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </Grid>

                    <Grid item xs={12} md={2} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                      <Button
                        component={Link}
                        to={`/books/${book.id}`}
                        variant="outlined"
                        size="small"
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          borderColor: isEpub ? '#667eea' : '#f5576c',
                          color: isEpub ? '#667eea' : '#f5576c',
                          '&:hover': {
                            background: isEpub ? 'rgba(102, 126, 234, 0.1)' : 'rgba(245, 87, 108, 0.1)',
                            borderColor: isEpub ? '#667eea' : '#f5576c',
                          }
                        }}
                      >
                        Detayları Gör
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {/* Sayfalama */}
      {pagination.pages > 1 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 6,
            mb: 2,
          }}
        >
          <Pagination
            count={pagination.pages}
            page={pagination.page}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
            sx={{
              '& .MuiPaginationItem-root': {
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 2,
                '&.Mui-selected': {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                },
              },
            }}
          />
        </Box>
      )}

      {/* Sonuç Bulunamadı */}
      {!loading && books.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Arama kriterlerinize uygun kitap bulunamadı.
          </Typography>
          <Button onClick={clearFilters} sx={{ mt: 2 }}>
            Filtreleri Temizle
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default BookList;
