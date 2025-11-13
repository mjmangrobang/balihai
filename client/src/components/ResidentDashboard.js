import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from './Layout';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Grid,
  Alert
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const ResidentDashboard = () => {
  const [invoices, setInvoices] = useState([]);
  const [user, setUser] = useState({});

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
    fetchMyInvoices(userData);
  }, []);

  const fetchMyInvoices = async (userData) => {
    try {
      const config = { headers: { Authorization: `Bearer ${userData.token}` } };
      const { data } = await axios.get('/api/billing/my-invoices', config);
      setInvoices(data);
    } catch (error) {
      console.error(error);
    }
  };

  const totalUnpaid = invoices
    .filter(inv => inv.status !== 'paid')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user.name}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Here is your account summary and billing history.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={3} 
            sx={{ p: 3, bgcolor: totalUnpaid > 0 ? '#ffebee' : '#e8f5e9', display: 'flex', alignItems: 'center', gap: 2 }}
          >
            <AccountBalanceWalletIcon color={totalUnpaid > 0 ? 'error' : 'success'} fontSize="large" />
            <Box>
              <Typography variant="subtitle2">Total Outstanding Balance</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: totalUnpaid > 0 ? '#d32f2f' : '#2e7d32' }}>
                ₱{totalUnpaid.toLocaleString()}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom>
        My Billing History
      </Typography>
      
      {invoices.length === 0 ? (
        <Alert severity="info">You have no billing records yet.</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice._id}>
                  <TableCell>{invoice.description}</TableCell>
                  <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>₱{invoice.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip 
                      label={invoice.status.toUpperCase()} 
                      color={invoice.status === 'paid' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Layout>
  );
};

export default ResidentDashboard;