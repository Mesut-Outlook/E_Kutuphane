import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  LibraryBooks,
  People,
  AutoStories,
  PictureAsPdf,
  BarChart,
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import axios from 'axios';

const COLORS = ['#1976d2', '#dc004e', '#2e7d32', '#ed6c02', '#9c27b0'];

const Stats = () => {
  const [stats, setStats] = useState({});
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsResponse, authorsResponse] = await Promise.all([
        axios.get('/api/stats'),
        axios.get('/api/authors'),
      ]);
      
      setStats(statsResponse.data);
      setAuthors(authorsResponse.data.slice(0, 10)); // İlk 10 yazarı al
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    }
    setLoading(false);
  };

  const getFileTypeData = () => {
    if (!stats.fileTypes) return [];
    
    return stats.fileTypes.map(ft => ({
      name: ft.fileExtension.toUpperCase(),
      value: ft.count,
      fullName: ft.fileExtension === 'epub' ? 'EPUB Dosyaları' : 'PDF Dosyaları'
    }));
  };

  const getTopAuthorsData = () => {
    return authors.slice(0, 10).map(author => ({
      name: author.author.length > 15 ? author.author.substring(0, 15) + '...' : author.author,
      fullName: author.author,
      kitapSayisi: author.bookCount
    }));
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 2 }}>
          <Typography variant="body2">
            {payload[0].payload.fullName || label}
          </Typography>
          <Typography variant="body2" color="primary">
            {`Kitap Sayısı: ${payload[0].value.toLocaleString()}`}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 2 }}>
          <Typography variant="body2">
            {payload[0].payload.fullName}
          </Typography>
          <Typography variant="body2" color="primary">
            {`${payload[0].value.toLocaleString()} dosya`}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {`%${((payload[0].value / stats.totalBooks) * 100).toFixed(1)}`}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>İstatistikler yükleniyor...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Kütüphane İstatistikleri
      </Typography>

      {/* Genel İstatistikler */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <LibraryBooks sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                {stats.totalBooks?.toLocaleString()}
              </Typography>
              <Typography color="text.secondary">Toplam Kitap</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <People sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                {stats.totalAuthors?.toLocaleString()}
              </Typography>
              <Typography color="text.secondary">Toplam Yazar</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AutoStories sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                {stats.fileTypes?.find(ft => ft.fileExtension === 'epub')?.count?.toLocaleString() || 0}
              </Typography>
              <Typography color="text.secondary">EPUB Dosyaları</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PictureAsPdf sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h4" component="div">
                {stats.fileTypes?.find(ft => ft.fileExtension === 'pdf')?.count?.toLocaleString() || 0}
              </Typography>
              <Typography color="text.secondary">PDF Dosyaları</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Grafikler */}
      <Grid container spacing={3}>
        {/* Dosya Türü Dağılımı */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <BarChart sx={{ mr: 1 }} />
                Dosya Türü Dağılımı
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getFileTypeData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getFileTypeData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* En Çok Kitabı Olan Yazarlar */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <People sx={{ mr: 1 }} />
                En Çok Kitabı Olan Yazarlar (İlk 10)
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={getTopAuthorsData()}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="kitapSayisi" fill="#1976d2" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detaylı İstatistikler */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Detaylı Bilgiler
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" color="primary">
                      {stats.totalAuthors && stats.totalBooks ? 
                        (stats.totalBooks / stats.totalAuthors).toFixed(1) : 0
                      }
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Yazar Başına Ortalama Kitap
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" color="secondary">
                      {stats.fileTypes ? 
                        Math.max(...stats.fileTypes.map(ft => ft.count)).toLocaleString() : 0
                      }
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      En Fazla Dosya Türü
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" color="success.main">
                      {authors.length > 0 ? authors[0].bookCount.toLocaleString() : 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      En Çok Kitaplı Yazar
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" color="warning.main">
                      {stats.fileTypes?.length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Desteklenen Dosya Türü
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Stats;
