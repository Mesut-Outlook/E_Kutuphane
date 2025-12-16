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
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  Search,
  Person,
  LibraryBooks,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Authors = () => {
  const [authors, setAuthors] = useState([]);
  const [filteredAuthors, setFilteredAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAuthors();
  }, []);

  useEffect(() => {
    // Yazarları filtrele
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
      const response = await axios.get('/api/authors');
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
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Yazarlar yükleniyor...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Yazarlar
      </Typography>

      {/* İstatistikler */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Person sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                {stats.total.toLocaleString()}
              </Typography>
              <Typography color="text.secondary">Toplam Yazar</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <LibraryBooks sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                {stats.totalBooks.toLocaleString()}
              </Typography>
              <Typography color="text.secondary">Toplam Kitap</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" component="div" color="success.main">
                {stats.avgBooks}
              </Typography>
              <Typography color="text.secondary">Yazar Başı Ortalama Kitap</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Arama */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Yazar ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Sonuç Bilgisi */}
      <Typography variant="body1" sx={{ mb: 2 }}>
        {filteredAuthors.length.toLocaleString()} yazar gösteriliyor
      </Typography>

      {/* Yazar Listesi */}
      <Card>
        <List>
          {filteredAuthors.map((author, index) => (
            <React.Fragment key={author.author}>
              <ListItem
                sx={{
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="h6" component="div">
                        {author.author}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip
                          label={`${author.bookCount} kitap`}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                        <Button
                          component={Link}
                          to={`/books?author=${encodeURIComponent(author.author)}`}
                          variant="outlined"
                          size="small"
                        >
                          Kitapları Gör
                        </Button>
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
              {index < filteredAuthors.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Card>

      {/* Sonuç Bulunamadı */}
      {filteredAuthors.length === 0 && searchTerm && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            "{searchTerm}" aramasına uygun yazar bulunamadı.
          </Typography>
          <Button onClick={() => setSearchTerm('')} sx={{ mt: 2 }}>
            Aramayı Temizle
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default Authors;
