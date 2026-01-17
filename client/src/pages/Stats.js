import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Stack,
  useTheme,
  Paper,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  AutoStories,
  Category,
  Storage,
  People,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = '/api';

const Stats = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [authors, setAuthors] = useState([]);

  const CHART_COLORS = isDark
    ? ['#6366f1', '#a855f7', '#f43f5e', '#fb923c', '#10b981', '#06b6d4']
    : ['#4f46e5', '#9333ea', '#e11d48', '#ea580c', '#059669', '#0891b2'];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [statsRes, authorsRes] = await Promise.all([
          axios.get(`${API_URL}/stats`),
          axios.get(`${API_URL}/authors`),
        ]);
        setStats(statsRes.data);
        setAuthors(authorsRes.data);
      } catch (err) {
        console.error('İstatistik getirme hatası:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getFileTypeData = () => {
    if (!stats.fileTypes) return [];
    return stats.fileTypes.map((ft) => ({
      name: ft.fileExtension.toUpperCase(),
      value: ft.count,
    }));
  };

  const getTopAuthorsData = () => {
    return authors.slice(0, 10).map(a => ({
      name: a.author,
      kitap: a.bookCount
    }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', bgcolor: 'background.default' }}>
        <CircularProgress sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  const statCards = [
    { label: 'Toplam Kitap', value: stats.totalBooks || 0, icon: <AutoStories /> },
    { label: 'Toplam Yazar', value: stats.totalAuthors || 0, icon: <People /> },
    { label: 'Dosya Formatları', value: stats.fileTypes?.length || 0, icon: <Storage /> },
    { label: 'En Çok Kitap', value: authors[0]?.bookCount || 0, icon: <Category /> },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: { xs: 4, md: 8 }, color: 'text.primary', transition: 'background-color 0.3s ease' }}>
      <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 6 } }}>
        <Box sx={{ mb: { xs: 4, md: 6 }, textAlign: 'center' }}>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.02em', fontSize: { xs: '2rem', md: '3rem' } }}>
            Kütüphane İstatistikleri
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Koleksiyonunuzun sayısal analizi ve dağılımı
          </Typography>
        </Box>

        {/* Top Cards */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {statCards.map((card) => (
            <Grid item xs={12} sm={6} md={3} key={card.label}>
              <Card sx={{ borderRadius: '20px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2.5} alignItems="center">
                    <Box sx={{
                      p: 1.5,
                      borderRadius: '12px',
                      bgcolor: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)',
                      color: 'primary.main',
                      display: 'flex'
                    }}>
                      {React.cloneElement(card.icon, { sx: { fontSize: 24 } })}
                    </Box>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 800 }}>{card.value.toLocaleString()}</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>{card.label}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          {/* File Types Chart */}
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 4, borderRadius: '24px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <PieChartIcon sx={{ color: 'primary.main' }} /> Dosya Format Dağılımı
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getFileTypeData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {getFileTypeData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        backgroundColor: isDark ? '#1e293b' : '#fff',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                        color: isDark ? '#fff' : '#000'
                      }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Top Authors Chart */}
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 4, borderRadius: '24px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <BarChartIcon sx={{ color: 'primary.main' }} /> En Çok Eseri Bulunan Yazarlar
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart data={getTopAuthorsData()} layout="vertical" margin={{ left: 40, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={100}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: theme.palette.text.secondary, fontSize: 12, fontWeight: 500 }}
                    />
                    <Tooltip
                      cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        backgroundColor: isDark ? '#1e293b' : '#fff',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                        color: isDark ? '#fff' : '#000'
                      }}
                    />
                    <Bar
                      dataKey="kitap"
                      fill={theme.palette.primary.main}
                      radius={[0, 10, 10, 0]}
                      barSize={12}
                    />
                  </ReBarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Stats;
