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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'maintenance',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0], // Today's date YYYY-MM-DD
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

  const handleSubmit = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('/api/expenses', formData, config);
      setOpen(false);
      setFormData({ 
        title: '', 
        category: 'maintenance', 
        amount: '', 
        description: '',
        date: new Date().toISOString().split('T')[0]
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

  // Calculate Total Expenses
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
              <TableCell>Category</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense._id}>
                <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                <TableCell>{expense.title}</TableCell>
                <TableCell>
                  <Chip 
                    label={expense.category.toUpperCase()} 
                    size="small" 
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{expense.description}</TableCell>
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
                <TableCell colSpan={6} align="center">No expenses recorded.</TableCell>
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
    </Layout>
  );
};

export default Expenses;