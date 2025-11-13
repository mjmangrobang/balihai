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
  InputAdornment
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

const Residents = () => {
  const [residents, setResidents] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // State for Search
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);

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

  // Search Logic
  const filteredResidents = residents.filter((resident) => 
    resident.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resident.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resident.address.block.toLowerCase().includes(searchTerm.toLowerCase())
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
      }

      fetchResidents();
      handleClose();
    } catch (error) {
      alert(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resident?')) {
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

      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by Name or Block..."
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
                  <IconButton color="primary" onClick={() => handleOpen(resident)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(resident._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filteredResidents.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">No residents found matching "{searchTerm}".</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

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
              <Grid item xs={6}>
                <TextField fullWidth label="Block" name="block" value={formData.block} onChange={handleChange} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Lot" name="lot" value={formData.lot} onChange={handleChange} />
              </Grid>
              <Grid item xs={12}>
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
    </Layout>
  );
};

export default Residents;