import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
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
  Alert,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import HistoryIcon from '@mui/icons-material/History';

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

  // Separate Pending vs History
  const pendingInvoices = invoices.filter(inv => inv.status !== 'paid');
  const historyInvoices = invoices.filter(inv => inv.status === 'paid');

  const totalUnpaid = pendingInvoices.reduce((acc, curr) => acc + (curr.totalAmount || curr.amount), 0);

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user.name}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Bancom Life Homeowners' Association
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ bgcolor: '#d32f2f', color: 'white' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AccountBalanceWalletIcon fontSize="large" />
              <Box>
                <Typography variant="subtitle2">Total Outstanding Balance</Typography>
                <Typography variant="h3" fontWeight="bold">
                  ₱{totalUnpaid.toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* PENDING BILLS SECTION */}
      <Box sx={{ mb: 5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <ReceiptLongIcon color="error" />
          <Typography variant="h5" fontWeight="bold">Pending Dues</Typography>
        </Box>
        
        {pendingInvoices.length === 0 ? (
          <Alert severity="success">You have no pending dues. Good standing!</Alert>
        ) : (
          <Grid container spacing={2}>
            {pendingInvoices.map((invoice) => (
              <Grid item xs={12} md={6} key={invoice._id}>
                <Paper elevation={2} sx={{ p: 3, borderLeft: '6px solid #d32f2f' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <Box>
                      <Typography variant="h6">{invoice.description}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Due: {new Date(invoice.dueDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Chip label={invoice.status.toUpperCase()} color="error" size="small" />
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Amount Due:</Typography>
                    <Typography variant="h5" fontWeight="bold" color="error.main">
                      ₱{(invoice.totalAmount || invoice.amount).toLocaleString()}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* BILLING HISTORY SECTION */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <HistoryIcon color="primary" />
          <Typography variant="h5" fontWeight="bold">Billing History</Typography>
        </Box>

        {historyInvoices.length === 0 ? (
          <Alert severity="info">No payment history found.</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Amount Paid</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {historyInvoices.map((invoice) => (
                  <TableRow key={invoice._id}>
                    <TableCell>{invoice.description}</TableCell>
                    <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>₱{(invoice.totalAmount || invoice.amount).toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip label="PAID" color="success" size="small" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Layout>
  );
};

export default ResidentDashboard;