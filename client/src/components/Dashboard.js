import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from './Layout';
import { Grid, Paper, Typography, Box, CircularProgress } from '@mui/material';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import WarningIcon from '@mui/icons-material/Warning';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

const StatCard = ({ title, value, icon, color }) => (
  <Paper elevation={3} sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
    <Box>
      <Typography variant="subtitle2" color="textSecondary">
        {title}
      </Typography>
      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: color }}>
        {value}
      </Typography>
    </Box>
    <Box sx={{ color: color, opacity: 0.8 }}>
      {icon}
    </Box>
  </Paper>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalResidents: 0,
    delinquentResidents: 0,
    delinquencyRate: 0,
    monthlyCollection: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const config = {
          headers: { Authorization: `Bearer ${user.token}` },
        };
        
        const { data } = await axios.get('/api/dashboard', config);
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Dashboard Overview
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Residents" 
            value={stats.totalResidents} 
            icon={<PeopleAltIcon fontSize="large" />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Delinquent Accounts" 
            value={stats.delinquentResidents} 
            icon={<WarningIcon fontSize="large" />}
            color="#d32f2f"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Delinquency Rate" 
            value={`${stats.delinquencyRate}%`} 
            icon={<WarningIcon fontSize="large" />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Monthly Collection" 
            value={`₱${stats.monthlyCollection}`} 
            icon={<MonetizationOnIcon fontSize="large" />}
            color="#2e7d32"
          />
        </Grid>
      </Grid>

      {/* Placeholder for future Charts/Recent Activities */}
      <Box sx={{ mt: 5 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            System Announcements
          </Typography>
          <Typography variant="body2">
            Welcome to the new Bancom Life Web-Based System. Use the sidebar to manage residents.
          </Typography>
        </Paper>
      </Box>
    </Layout>
  );
};

export default Dashboard;