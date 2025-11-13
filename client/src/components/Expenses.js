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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import VisibilityIcon from '@mui/icons-material/Visibility';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [open, setOpen] = useState(false);
  
  // Image Preview Modal
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    particulars: '', // Added Particulars
    category: 'maintenance',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    proofImage: '' // Added Proof Image
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('/api/expenses', config);
      setExpenses(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle File Upload (Convert to Base64)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, proofImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('/api/expenses', formData, config);
      setOpen(false);
      setFormData({ 
        title: '', 
        particulars: '', 
        category: 'maintenance', 
        amount: '', 
        description: '',
        date: new Date().toISOString().split('T')[0],
        proofImage: ''
      });
      fetchExpenses();
    } catch (error) {
      alert('Error adding expense');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this expense record?')) {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`/api/expenses/${id}`, config);
        fetchExpenses();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleViewProof = (image) => {
    setPreviewImage(image);
    setPreviewOpen(true);
  };

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <Layout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Expense Tracking</Typography>
        <Button 
          variant="contained" 
          color="secondary"
          startIcon={<AddIcon />} 
          onClick={() => setOpen(true)}
        >
          Log Expense
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#ffebee' }}>
        <AttachMoneyIcon color="error" fontSize="large" />
        <Box>
          <Typography variant="subtitle2" color="textSecondary">Total Expenditures</Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
            ₱{totalExpenses.toLocaleString()}
          </Typography>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Particulars</TableCell> {/* Added Column */}
              <TableCell>Category</TableCell>
              <TableCell>Proof</TableCell> {/* Added Column */}
              <TableCell align="right">Amount</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense._id}>
                <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                <TableCell>{expense.title}</TableCell>
                <TableCell>{expense.particulars || '-'}</TableCell>
                <TableCell>
                  <Chip 
                    label={expense.category.toUpperCase()} 
                    size="small" 
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  {expense.proofImage ? (
                    <Tooltip title="View Receipt">
                      <IconButton size="small" onClick={() => handleViewProof(expense.proofImage)}>
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Typography variant="caption" color="textSecondary">No Image</Typography>
                  )}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
                  -₱{expense.amount.toLocaleString()}
                </TableCell>
                <TableCell align="center">
                  <IconButton color="error" onClick={() => handleDelete(expense._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {expenses.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">No expenses recorded.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Log New Expense</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Expense Title" name="title" fullWidth value={formData.title} onChange={handleChange} />
            
            <TextField label="Particulars (e.g., 5 sacks of cement)" name="particulars" fullWidth value={formData.particulars} onChange={handleChange} />

            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select name="category" value={formData.category} label="Category" onChange={handleChange}>
                <MenuItem value="maintenance">Maintenance & Repairs</MenuItem>
                <MenuItem value="utilities">Utilities (Water/Electricity)</MenuItem>
                <MenuItem value="salaries">Staff Salaries</MenuItem>
                <MenuItem value="supplies">Office Supplies</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>

            <TextField 
              label="Amount" 
              name="amount" 
              type="number" 
              fullWidth 
              value={formData.amount} 
              onChange={handleChange} 
            />

            <TextField 
              label="Date" 
              name="date" 
              type="date" 
              fullWidth 
              InputLabelProps={{ shrink: true }}
              value={formData.date} 
              onChange={handleChange} 
            />

            {/* File Upload Button */}
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
            >
              Upload Receipt/Proof
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileChange}
              />
            </Button>
            {formData.proofImage && <Typography variant="caption" color="success.main">Image Selected</Typography>}

            <TextField 
              label="Description / Remarks" 
              name="description" 
              multiline 
              rows={2} 
              fullWidth 
              value={formData.description} 
              onChange={handleChange} 
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" color="secondary" onClick={handleSubmit}>Save Record</Button>
        </DialogActions>
      </Dialog>

      {/* Image Preview Modal */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md">
        <DialogContent>
          <img src={previewImage} alt="Proof" style={{ width: '100%', height: 'auto' }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default Expenses;