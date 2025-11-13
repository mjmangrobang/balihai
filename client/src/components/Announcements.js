import React, { useState, useEffect } from 'react';
// CHANGE: Import from custom api config
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
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CampaignIcon from '@mui/icons-material/Campaign';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    details: '',
    priority: 'normal',
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('/api/announcements', config);
      setAnnouncements(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('/api/announcements', formData, config);
      setOpen(false);
      setFormData({ title: '', details: '', priority: 'normal' });
      fetchAnnouncements();
    } catch (error) {
      alert('Error posting announcement');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this announcement?')) {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
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
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => setOpen(true)}
        >
          Post Announcement
        </Button>
      </Box>

      <List>
        {announcements.map((announcement) => (
          <Paper key={announcement._id} sx={{ mb: 2, p: 2 }}>
            <ListItem
              secondaryAction={
                <IconButton edge="end" color="error" onClick={() => handleDelete(announcement._id)}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CampaignIcon color="action" />
                    <Typography variant="h6">{announcement.title}</Typography>
                    <Chip 
                      label={announcement.priority.toUpperCase()} 
                      color={getPriorityColor(announcement.priority)} 
                      size="small" 
                    />
                  </Box>
                }
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="text.primary" sx={{ display: 'block', mt: 1 }}>
                      {announcement.details}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Posted on: {new Date(announcement.createdAt).toLocaleDateString()}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          </Paper>
        ))}
        {announcements.length === 0 && (
          <Typography variant="body1" align="center" color="textSecondary">
            No announcements yet.
          </Typography>
        )}
      </List>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>New Announcement</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Title" name="title" fullWidth value={formData.title} onChange={handleChange} />
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select name="priority" value={formData.priority} label="Priority" onChange={handleChange}>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
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
    </Layout>
  );
};

export default Announcements;