import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import Layout from './Layout';
import {
  Box,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Tabs,
  Tab,
  Collapse,
  Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CampaignIcon from '@mui/icons-material/Campaign';
import RestoreIcon from '@mui/icons-material/Restore';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [open, setOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0); // 0=Active, 1=Archived
  const [expandedId, setExpandedId] = useState(null); // For expanding details
  
  // Reuse Modal
  const [reuseOpen, setReuseOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    details: '',
    priority: 'normal',
    durationDays: 7 // Default 1 week
  });

  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user?.role === 'admin' || user?.role === 'staff';

  useEffect(() => {
    fetchAnnouncements();
  }, [tabValue]);

  const fetchAnnouncements = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const endpoint = tabValue === 0 ? '/api/announcements' : '/api/announcements/archived';
      const { data } = await axios.get(endpoint, config);
      setAnnouncements(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleExpandClick = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleSubmit = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('/api/announcements', formData, config);
      setOpen(false);
      setFormData({ title: '', details: '', priority: 'normal', durationDays: 7 });
      fetchAnnouncements();
    } catch (error) {
      alert('Error posting announcement');
    }
  };

  const handleReuseClick = (id) => {
    setSelectedId(id);
    setReuseOpen(true);
  };

  const submitReuse = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/announcements/${selectedId}/reuse`, { durationDays: formData.durationDays }, config);
      setReuseOpen(false);
      setTabValue(0); // Switch back to active view
    } catch (error) {
      alert('Error reusing announcement');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this announcement permanently?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`/api/announcements/${id}`, config);
        fetchAnnouncements();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const getPriorityColor = (priority) => {
    if (priority === 'urgent') return 'error';
    if (priority === 'high') return 'warning';
    return 'primary';
  };

  return (
    <Layout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Announcements</Typography>
        {isAdmin && (
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => setOpen(true)}
          >
            Post Announcement
          </Button>
        )}
      </Box>

      {/* Tabs (Only show if Admin, or just show "Recent" for residents?) 
          Request says "Archived announcement should be reusable", implying Admin view.
          We can let residents see history if desired, or hide tabs for them. 
          For now, we show tabs to everyone but Reuse/Delete is Admin only.
      */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
          <Tab label="Active / Recent" />
          <Tab label="Archived / Past" />
        </Tabs>
      </Paper>

      <List>
        {announcements.map((announcement) => (
          <Paper key={announcement._id} sx={{ mb: 2, p: 2 }}>
            <ListItem
              alignItems="flex-start"
              secondaryAction={
                isAdmin && (
                  <Box>
                    {tabValue === 1 && (
                      <Button 
                        size="small" 
                        startIcon={<RestoreIcon />} 
                        onClick={() => handleReuseClick(announcement._id)}
                        sx={{ mr: 1 }}
                      >
                        Reuse
                      </Button>
                    )}
                    <IconButton edge="end" color="error" onClick={() => handleDelete(announcement._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                )
              }
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => handleExpandClick(announcement._id)}>
                    <CampaignIcon color="action" />
                    <Typography variant="h6">{announcement.title}</Typography>
                    <Chip 
                      label={announcement.priority.toUpperCase()} 
                      color={getPriorityColor(announcement.priority)} 
                      size="small" 
                    />
                    {expandedId === announcement._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </Box>
                }
                secondary={
                  <React.Fragment>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      Posted: {new Date(announcement.createdAt).toLocaleDateString()} | Expires: {new Date(announcement.expirationDate).toLocaleDateString()}
                    </Typography>
                    
                    <Collapse in={expandedId === announcement._id} timeout="auto" unmountOnExit>
                      <Typography component="span" variant="body1" color="text.primary" sx={{ display: 'block', mt: 2, whiteSpace: 'pre-wrap' }}>
                        {announcement.details}
                      </Typography>
                    </Collapse>
                  </React.Fragment>
                }
              />
            </ListItem>
          </Paper>
        ))}
        {announcements.length === 0 && (
          <Typography variant="body1" align="center" color="textSecondary" sx={{ mt: 4 }}>
            No announcements found in this category.
          </Typography>
        )}
      </List>

      {/* Post Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>New Announcement</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Title" name="title" fullWidth value={formData.title} onChange={handleChange} />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select name="priority" value={formData.priority} label="Priority" onChange={handleChange}>
                    <MenuItem value="normal">Normal</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField 
                  label="Duration (Days)" 
                  name="durationDays" 
                  type="number" 
                  fullWidth 
                  value={formData.durationDays} 
                  onChange={handleChange} 
                />
              </Grid>
            </Grid>

            <TextField 
              label="Details" 
              name="details" 
              multiline 
              rows={4} 
              fullWidth 
              value={formData.details} 
              onChange={handleChange} 
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>Post</Button>
        </DialogActions>
      </Dialog>

      {/* Reuse Dialog */}
      <Dialog open={reuseOpen} onClose={() => setReuseOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Reuse Announcement</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Set a new duration for this announcement. It will be moved to Active.
          </Typography>
          <TextField 
            label="New Duration (Days)" 
            name="durationDays" 
            type="number" 
            fullWidth 
            value={formData.durationDays} 
            onChange={handleChange} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReuseOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submitReuse}>Repost</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default Announcements;