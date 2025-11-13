import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
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
  Menu,
  Tabs,
  Tab,
  IconButton,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArchiveIcon from '@mui/icons-material/Archive';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [open, setOpen] = useState(false);
  
  // User Role Check
  const user = JSON.parse(localStorage.getItem('user'));
  const isResident = user?.role === 'resident';

  // Menu State
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');

  // View Details
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // Form Data
  const [formData, setFormData] = useState({
    type: 'complaint',
    subject: '',
    description: ''
  });

  useEffect(() => {
    fetchComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabValue]);

  const fetchComplaints = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      let endpoint;
      if (isResident) {
        // Residents only see their own tickets
        endpoint = '/api/complaints/my-complaints';
      } else {
        // Admins see based on tab
        endpoint = tabValue === 0 ? '/api/complaints' : '/api/complaints/archived';
      }

      const { data } = await axios.get(endpoint, config);
      setComplaints(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('/api/complaints', formData, config);
      setOpen(false);
      setFormData({ type: 'complaint', subject: '', description: '' });
      fetchComplaints();
    } catch (error) {
      alert('Error creating ticket');
    }
  };

  // --- Menu Handlers ---
  const handleMenuClick = (event, complaint) => {
    setAnchorEl(event.currentTarget);
    setSelectedId(complaint._id);
    setSelectedStatus(complaint.status);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedId(null);
  };

  const handleStatusChange = async (status) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/complaints/${selectedId}`, { status }, config);
      fetchComplaints();
      handleMenuClose();
    } catch (error) {
      alert('Error updating status');
    }
  };

  const handleArchive = async () => {
    if (!window.confirm('Are you sure you want to archive this ticket?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/complaints/${selectedId}/archive`, {}, config);
      fetchComplaints();
      handleMenuClose();
    } catch (error) {
      alert('Error archiving ticket');
    }
  };

  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setViewOpen(true);
  };

  const getStatusColor = (status) => {
    if (status === 'resolved') return 'success';
    if (status === 'rejected') return 'error';
    if (status === 'in_progress') return 'warning';
    return 'default';
  };

  return (
    <Layout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Complaints & Requests</Typography>
        
        {/* Only Residents can create tickets */}
        {isResident && (
          <Button 
            variant="contained" 
            color="warning"
            startIcon={<AddIcon />} 
            onClick={() => setOpen(true)}
          >
            Log Ticket
          </Button>
        )}
      </Box>

      {/* Tabs only visible for Admin */}
      {!isResident && (
        <Paper sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
            <Tab label="Active Tickets" />
            <Tab label="Archived History" />
          </Tabs>
        </Paper>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Date</TableCell>
              {!isResident && <TableCell>Resident</TableCell>} {/* Residents know it's them */}
              <TableCell>Type</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {complaints.map((ticket) => (
              <TableRow key={ticket._id}>
                <TableCell>{new Date(ticket.dateFiled).toLocaleDateString()}</TableCell>
                {!isResident && (
                  <TableCell>
                    {ticket.resident ? `${ticket.resident.lastName}, ${ticket.resident.firstName}` : 'Unknown'}
                  </TableCell>
                )}
                <TableCell sx={{ textTransform: 'capitalize' }}>{ticket.type.replace('_', ' ')}</TableCell>
                <TableCell>{ticket.subject}</TableCell>
                <TableCell>
                  <Chip 
                    label={ticket.status.replace('_', ' ').toUpperCase()} 
                    color={getStatusColor(ticket.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="View Details">
                    <IconButton color="primary" onClick={() => handleViewDetails(ticket)}>
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  {/* Only Admins can update status/archive */}
                  {!isResident && (
                    <Tooltip title="Update Status">
                      <IconButton onClick={(e) => handleMenuClick(e, ticket)}>
                        <MoreVertIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {complaints.length === 0 && (
              <TableRow>
                <TableCell colSpan={isResident ? 5 : 6} align="center">No tickets found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Menu (Admin Only) */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem disabled>Update Status:</MenuItem>
        <MenuItem onClick={() => handleStatusChange('pending')}>Pending</MenuItem>
        <MenuItem onClick={() => handleStatusChange('in_progress')}>In Progress</MenuItem>
        <MenuItem onClick={() => handleStatusChange('resolved')}>Resolved</MenuItem>
        <MenuItem onClick={() => handleStatusChange('rejected')}>Rejected</MenuItem>
        
        {(selectedStatus === 'resolved' || selectedStatus === 'rejected') && tabValue === 0 && (
          <div>
            <hr style={{ margin: '5px 0' }} />
            <MenuItem onClick={handleArchive} sx={{ color: 'text.secondary' }}>
              <ArchiveIcon fontSize="small" sx={{ mr: 1 }} /> Archive Ticket
            </MenuItem>
          </div>
        )}
      </Menu>

      {/* View Details Dialog */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Ticket Details</DialogTitle>
        <DialogContent dividers>
          {selectedComplaint && (
            <Box>
              <Typography variant="subtitle2" color="textSecondary">Subject</Typography>
              <Typography variant="h6" gutterBottom>{selectedComplaint.subject}</Typography>
              
              <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>Description</Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', bgcolor: '#f9f9f9', p: 2, borderRadius: 1 }}>
                {selectedComplaint.description}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Create Ticket Dialog (Resident Only) */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Log New Ticket</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
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