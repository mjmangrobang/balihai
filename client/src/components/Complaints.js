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
  Menu,
  MenuItem,
  Tabs,
  Tab,
  IconButton,
  Tooltip
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArchiveIcon from '@mui/icons-material/Archive';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [tabValue, setTabValue] = useState(0); // 0 = Active, 1 = Archived
  
  // Menu State
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');

  // View Details Modal State
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, [tabValue]);

  const fetchComplaints = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      // Fetch Active or Archived based on Tab
      const endpoint = tabValue === 0 ? '/api/complaints' : '/api/complaints/archived';
      const { data } = await axios.get(endpoint, config);
      setComplaints(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
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
      const user = JSON.parse(localStorage.getItem('user'));
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
      const user = JSON.parse(localStorage.getItem('user'));
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/complaints/${selectedId}/archive`, {}, config);
      fetchComplaints();
      handleMenuClose();
    } catch (error) {
      alert('Error archiving ticket');
    }
  };

  // --- View Details Handlers ---
  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setViewOpen(true);
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
      </Box>

      {/* Tabs for Active vs Archived */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
          <Tab label="Active Tickets" />
          <Tab label="Archived History" />
        </Tabs>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Resident</TableCell>
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
                <TableCell align="center">
                  <Tooltip title="View Details">
                    <IconButton color="primary" onClick={() => handleViewDetails(ticket)}>
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Update Status / Archive">
                    <IconButton onClick={(e) => handleMenuClick(e, ticket)}>
                      <MoreVertIcon />
                    </IconButton>
                  </Tooltip>
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

      {/* Action Menu */}
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
        
        {/* Only show Archive option if the ticket is finished (Resolved/Rejected) AND we are in Active tab */}
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

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" display="block">Filed By:</Typography>
                  <Typography variant="body2">
                    {selectedComplaint.resident ? `${selectedComplaint.resident.firstName} ${selectedComplaint.resident.lastName}` : 'Unknown'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" display="block">Date Filed:</Typography>
                  <Typography variant="body2">{new Date(selectedComplaint.dateFiled).toLocaleDateString()}</Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default Complaints;