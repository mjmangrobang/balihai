import React, { useState } from 'react';
import axios from 'axios';
import Layout from './Layout';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PrintIcon from '@mui/icons-material/Print';

const Reports = () => {
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [reportData, setReportData] = useState(null);

  const handleChange = (e) => {
    setDateRange({ ...dateRange, [e.target.name]: e.target.value });
  };

  const generateReport = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      alert('Please select both start and end dates');
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      const { data } = await axios.post('/api/reports/financial', dateRange, config);
      setReportData(data);
    } catch (error) {
      console.error(error);
      alert('Error generating report');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Layout>
      {/* This section is visible on screen but hidden when printing if you use CSS media queries, 
          but for simplicity we print everything inside Layout */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, '@media print': { display: 'none' } }}>
        <Typography variant="h4">Financial Reports</Typography>
      </Box>

      {/* Controls (Hidden when printing) */}
      <Paper sx={{ p: 3, mb: 3, '@media print': { display: 'none' } }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField 
              label="Start Date" 
              name="startDate" 
              type="date" 
              fullWidth 
              InputLabelProps={{ shrink: true }} 
              onChange={handleChange} 
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField 
              label="End Date" 
              name="endDate" 
              type="date" 
              fullWidth 
              InputLabelProps={{ shrink: true }} 
              onChange={handleChange} 
            />
          </Grid>
          <Grid item xs={12} md={4} sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" fullWidth startIcon={<AssessmentIcon />} onClick={generateReport}>
              Generate
            </Button>
            {reportData && (
              <Button variant="outlined" fullWidth startIcon={<PrintIcon />} onClick={handlePrint}>
                Print
              </Button>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Report Display */}
      {reportData && (
        <Paper sx={{ p: 4 }} id="printable-area">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>BANCOM LIFE HOMEOWNERS ASSOCIATION, INC.</Typography>
            <Typography variant="subtitle1">Financial Statement Summary</Typography>
            <Typography variant="caption">
              Period: {new Date(reportData.startDate).toLocaleDateString()} - {new Date(reportData.endDate).toLocaleDateString()}
            </Typography>
          </Box>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={4}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
                <Typography variant="subtitle2">Total Collections</Typography>
                <Typography variant="h6" color="success.main">₱{reportData.totalCollections.toLocaleString()}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: '#ffebee' }}>
                <Typography variant="subtitle2">Total Expenses</Typography>
                <Typography variant="h6" color="error.main">₱{reportData.totalExpenses.toLocaleString()}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
                <Typography variant="subtitle2">Net Balance</Typography>
                <Typography variant="h6" color="primary.main">₱{reportData.netBalance.toLocaleString()}</Typography>
              </Paper>
            </Grid>
          </Grid>

          <Divider sx={{ mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>Income Breakdown</Typography>
          <TableContainer sx={{ mb: 4 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Resident</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.transactions.map((t) => (
                  <TableRow key={t._id}>
                    <TableCell>{new Date(t.paymentDate).toLocaleDateString()}</TableCell>
                    <TableCell>{t.resident ? `${t.resident.lastName}, ${t.resident.firstName}` : 'Unknown'}</TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>{t.paymentMethod.replace('_', ' ')}</TableCell>
                    <TableCell align="right">₱{t.amountPaid.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={{ mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>Expense Breakdown</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.expenses.map((e) => (
                  <TableRow key={e._id}>
                    <TableCell>{new Date(e.date).toLocaleDateString()}</TableCell>
                    <TableCell>{e.title}</TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>{e.category}</TableCell>
                    <TableCell align="right">₱{e.amount.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 8, display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ textAlign: 'center', minWidth: 200 }}>
              <Divider />
              <Typography variant="subtitle2" sx={{ mt: 1 }}>Prepared By</Typography>
            </Box>
            <Box sx={{ textAlign: 'center', minWidth: 200 }}>
              <Divider />
              <Typography variant="subtitle2" sx={{ mt: 1 }}>Approved By (President)</Typography>
            </Box>
          </Box>
        </Paper>
      )}
    </Layout>
  );
};

export default Reports;