import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from './Layout';
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Menu
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [residents, setResidents] = useState([]);
  const [open, setOpen] = useState(false);
  
  // For Status Menu
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const [formData, setFormData] = useState({
    residentId: '',
    type: 'complaint',
    subject: '',
    description: ''
  });

  useEffect(() => {
    fetchComplaints();
    fetchResidents();
  }, []);

  const fetchComplaints = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('/api/complaints', config);
      setComplaints(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchResidents = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('/api/residents', config);
      setResidents(data);
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
      await axios.post('/api/complaints', formData, config);
      setOpen(false);
      setFormData({ residentId: '', type: 'complaint', subject: '', description: '' });
      fetchComplaints();
    } catch (error) {
      alert('Error creating ticket');
    }
  };

  // Status Update Handlers
  const handleMenuClick = (event, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedId(null);
  };

  const handleStatusChange = async (status) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/complaints/${selectedId}`, { status }, config);
      fetchComplaints();
      handleMenuClose();
    } catch (error) {
      alert('Error updating status');
    }
  };

  const getStatusColor = (status) => {
    if (status === 'resolved') return 'success';
    if (status === 'rejected') return 'error';
    if (status === 'in_progress') return 'warning';
    return 'default'; // pending
  };

  return (
    <Layout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Complaints & Requests</Typography>
        <Button 
          variant="contained" 
          color="warning"
          startIcon={<AddIcon />} 
          onClick={() => setOpen(true)}
        >
          Log Ticket
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Resident</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {complaints.map((ticket) => (
              <TableRow key={ticket._id}>
                <TableCell>{new Date(ticket.dateFiled).toLocaleDateString()}</TableCell>
                <TableCell>
                  {ticket.resident ? `${ticket.resident.lastName}, ${ticket.resident.firstName}` : 'Unknown'}
                </TableCell>
                <TableCell sx={{ textTransform: 'capitalize' }}>{ticket.type.replace('_', ' ')}</TableCell>
                <TableCell>{ticket.subject}</TableCell>
                <TableCell>
                  <Chip 
                    label={ticket.status.replace('_', ' ').toUpperCase()} 
                    color={getStatusColor(ticket.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Button 
                    size="small" 
                    endIcon={<MoreVertIcon />}
                    onClick={(e) => handleMenuClick(e, ticket._id)}
                  >
                    Update
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {complaints.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">No tickets found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Status Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleStatusChange('pending')}>Mark as Pending</MenuItem>
        <MenuItem onClick={() => handleStatusChange('in_progress')}>Mark as In Progress</MenuItem>
        <MenuItem onClick={() => handleStatusChange('resolved')}>Mark as Resolved</MenuItem>
        <MenuItem onClick={() => handleStatusChange('rejected')}>Mark as Rejected</MenuItem>
      </Menu>

      {/* Add Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>Log New Ticket</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Resident</InputLabel>
              <Select name="residentId" value={formData.residentId} label="Resident" onChange={handleChange}>
                {residents.map((res) => (
                  <MenuItem key={res._id} value={res._id}>
                    {res.lastName}, {res.firstName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select name="type" value={formData.type} label="Type" onChange={handleChange}>
                <MenuItem value="complaint">Complaint</MenuItem>
                <MenuItem value="service_request">Service Request</MenuItem>
                <MenuItem value="incident_report">Incident Report</MenuItem>
              </Select>
            </FormControl>

            <TextField label="Subject" name="subject" fullWidth value={formData.subject} onChange={handleChange} />
            
            <TextField 
              label="Description" 
              name="description" 
              multiline 
              rows={4} 
              fullWidth 
              value={formData.description} 
              onChange={handleChange} 
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" color="warning" onClick={handleSubmit}>Submit</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default Complaints;