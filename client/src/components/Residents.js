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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  InputAdornment,
  Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';

const Residents = () => {
  const [residents, setResidents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  
  // Document Modal State
  const [docOpen, setDocOpen] = useState(false);
  const [selectedResidentName, setSelectedResidentName] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    contactNumber: '',
    email: '',
    block: '',
    lot: '',
    street: '',
    type: 'homeowner',
    status: 'good_standing'
  });

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('/api/residents', config);
      setResidents(data);
    } catch (error) {
      console.error('Error fetching residents:', error);
    }
  };

  // UPDATED: Filter Logic includes Street
  const filteredResidents = residents.filter((resident) => 
    resident.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resident.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resident.address.block.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resident.address.street.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOpen = (resident = null) => {
    if (resident) {
      setIsEdit(true);
      setCurrentId(resident._id);
      setFormData({
        firstName: resident.firstName,
        lastName: resident.lastName,
        contactNumber: resident.contactNumber,
        email: resident.email || '',
        block: resident.address.block,
        lot: resident.address.lot,
        street: resident.address.street,
        type: resident.type,
        status: resident.status
      });
    } else {
      setIsEdit(false);
      setFormData({
        firstName: '',
        lastName: '',
        contactNumber: '',
        email: '',
        block: '',
        lot: '',
        street: '',
        type: 'homeowner',
        status: 'good_standing'
      });
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  // Handle Documents Modal
  const handleOpenDocs = (resident) => {
    setSelectedResidentName(`${resident.firstName} ${resident.lastName}`);
    setDocOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        contactNumber: formData.contactNumber,
        email: formData.email,
        address: {
          block: formData.block,
          lot: formData.lot,
          street: formData.street
        },
        type: formData.type,
        status: formData.status
      };

      if (isEdit) {
        await axios.put(`/api/residents/${currentId}`, payload, config);
      } else {
        await axios.post('/api/residents', payload, config);
        alert('Resident added! Account generated with default password: Balihai@123');
      }

      fetchResidents();
      handleClose();
    } catch (error) {
      alert(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure? This will also delete their User Account.')) {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`/api/residents/${id}`, config);
        fetchResidents();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <Layout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Resident Management</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => handleOpen()}
        >
          Add Resident
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by Name, Block, or Street..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Block/Lot</TableCell>
              <TableCell>Street</TableCell> {/* ADDED STREET COLUMN */}
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredResidents.map((resident) => (
              <TableRow key={resident._id}>
                <TableCell>Blk {resident.address.block} Lot {resident.address.lot}</TableCell>
                <TableCell>{resident.address.street}</TableCell>
                <TableCell>{resident.lastName}, {resident.firstName}</TableCell>
                <TableCell sx={{ textTransform: 'capitalize' }}>{resident.type.replace('_', ' ')}</TableCell>
                <TableCell>
                  <Chip 
                    label={resident.status === 'good_standing' ? 'Good Standing' : 'Delinquent'} 
                    color={resident.status === 'good_standing' ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="View Documents">
                    <IconButton color="secondary" onClick={() => handleOpenDocs(resident)}>
                      <FolderIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton color="primary" onClick={() => handleOpen(resident)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton color="error" onClick={() => handleDelete(resident._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {filteredResidents.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">No residents found matching "{searchTerm}".</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Resident Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{isEdit ? 'Edit Resident' : 'Add New Resident'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField fullWidth label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
              </Grid>
              <Grid item xs={4}>
                <TextField fullWidth label="Block" name="block" value={formData.block} onChange={handleChange} />
              </Grid>
              <Grid item xs={4}>
                <TextField fullWidth label="Lot" name="lot" value={formData.lot} onChange={handleChange} />
              </Grid>
              <Grid item xs={4}>
                <TextField fullWidth label="Street" name="street" value={formData.street} onChange={handleChange} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Contact Number" name="contactNumber" value={formData.contactNumber} onChange={handleChange} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Email (Optional)" name="email" value={formData.email} onChange={handleChange} />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select name="type" value={formData.type} label="Type" onChange={handleChange}>
                    <MenuItem value="homeowner">Homeowner</MenuItem>
                    <MenuItem value="tenant">Tenant</MenuItem>
                    <MenuItem value="lot_owner">Lot Owner</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select name="status" value={formData.status} label="Status" onChange={handleChange}>
                    <MenuItem value="good_standing">Good Standing</MenuItem>
                    <MenuItem value="delinquent">Delinquent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Documents Modal */}
      <Dialog open={docOpen} onClose={() => setDocOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Documents for {selectedResidentName}</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <DescriptionIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="textSecondary">
              No documents uploaded for this resident yet.
            </Typography>
            {/* Future feature: List invoices/receipts here */}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDocOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default Residents;