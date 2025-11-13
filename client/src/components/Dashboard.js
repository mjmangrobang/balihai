import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import Layout from './Layout';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  CircularProgress, 
  List, 
  ListItem, 
  ListItemText, 
  Divider, 
  Chip 
} from '@mui/material';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import WarningIcon from '@mui/icons-material/Warning';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CampaignIcon from '@mui/icons-material/Campaign';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

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
    monthlyCollection: 0,
    incomeHistory: [],
    announcements: []
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

  const getPriorityColor = (priority) => {
    if (priority === 'urgent') return 'error';
    if (priority === 'high') return 'warning';
    return 'primary';
  };

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
      
      {/* STAT CARDS */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
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
            value={`₱${stats.monthlyCollection.toLocaleString()}`} 
            icon={<MonetizationOnIcon fontSize="large" />}
            color="#2e7d32"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* CHART SECTION */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Income Overview (Last 6 Months)
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={stats.incomeHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
                <Bar dataKey="income" fill="#2e7d32" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* ANNOUNCEMENTS SECTION */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: '400px', overflow: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
              <CampaignIcon color="primary" />
              <Typography variant="h6">Recent Announcements</Typography>
            </Box>
            <List>
              {stats.announcements.length > 0 ? (
                stats.announcements.map((announcement, index) => (
                  <React.Fragment key={announcement._id}>
                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {announcement.title}
                            </Typography>
                            <Chip 
                              label={announcement.priority} 
                              size="small" 
                              color={getPriorityColor(announcement.priority)} 
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="text.primary" sx={{ mt: 0.5 }}>
                              {announcement.details.substring(0, 80)}...
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                              {new Date(announcement.createdAt).toLocaleDateString()}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < stats.announcements.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              ) : (
                <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 4 }}>
                  No recent announcements.
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default Dashboard;