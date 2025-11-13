import React, { useState, useEffect, useRef } from 'react';
import axios from '../api/axios';
import Layout from './Layout';
import { useReactToPrint } from 'react-to-print';
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
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PrintIcon from '@mui/icons-material/Print';

const Reports = () => {
  const [reportType, setReportType] = useState('financial_summary');
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [residents, setResidents] = useState([]);
  const [selectedResident, setSelectedResident] = useState('');
  const [reportData, setReportData] = useState(null);

  // 1. Ref attached to a stable div
  const componentRef = useRef(null);

  // 2. Print Hook - UPDATED FOR V3+
  // The error you saw specifically asked for "contentRef"
  const handlePrint = useReactToPrint({
    contentRef: componentRef, // Pass the ref object directly
    documentTitle: `Report_${reportType}`,
  });

  useEffect(() => {
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
    fetchResidents();
  }, []);

  const handleChange = (e) => {
    setDateRange({ ...dateRange, [e.target.name]: e.target.value });
  };

  const generateReport = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      const payload = {
        type: reportType,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        residentId: selectedResident
      };

      const { data } = await axios.post('/api/reports/generate', payload, config);
      setReportData(data);
    } catch (error) {
      console.error(error);
      alert('Error generating report');
    }
  };

  // Safety Helper for Numbers
  const formatCurrency = (amount) => {
    const num = Number(amount);
    return isNaN(num) ? '0.00' : num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Render Logic Inline
  const renderTableHead = () => {
    switch (reportType) {
      case 'collection_report':
        return (
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Resident</TableCell>
            <TableCell>Details</TableCell>
            <TableCell>Method</TableCell>
            <TableCell align="right">Amount</TableCell>
          </TableRow>
        );
      case 'expense_report':
        return (
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Particulars</TableCell>
            <TableCell align="right">Amount</TableCell>
          </TableRow>
        );
      case 'customer_ledger':
        return (
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Ref No.</TableCell>
            <TableCell align="right">Debit</TableCell>
            <TableCell align="right">Credit</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Balance</TableCell>
          </TableRow>
        );
      default:
        return <TableRow><TableCell>Summary View Only</TableCell></TableRow>;
    }
  };

  const renderTableBody = () => {
    if (!reportData || !reportData.details) return null;

    return reportData.details.map((row, index) => {
      if (reportType === 'collection_report') {
        return (
          <TableRow key={index}>
            <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
            <TableCell>
              <Typography variant="body2" fontWeight="bold">{row.resident}</Typography>
              <Typography variant="caption">{row.blockLot}</Typography>
            </TableCell>
            <TableCell>{row.description}</TableCell>
            <TableCell sx={{ textTransform: 'capitalize' }}>{row.method}</TableCell>
            <TableCell align="right">₱{formatCurrency(row.amount)}</TableCell>
          </TableRow>
        );
      }
      if (reportType === 'expense_report') {
        return (
          <TableRow key={index}>
            <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
            <TableCell>{row.title}</TableCell>
            <TableCell sx={{ textTransform: 'capitalize' }}>{row.category}</TableCell>
            <TableCell>{row.particulars}</TableCell>
            <TableCell align="right">₱{formatCurrency(row.amount)}</TableCell>
          </TableRow>
        );
      }
      if (reportType === 'customer_ledger') {
        return (
          <TableRow key={index}>
            <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
            <TableCell>{row.description}</TableCell>
            <TableCell>{row.ref}</TableCell>
            <TableCell align="right">{row.debit > 0 ? `₱${formatCurrency(row.debit)}` : '-'}</TableCell>
            <TableCell align="right">{row.credit > 0 ? `₱${formatCurrency(row.credit)}` : '-'}</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>₱{formatCurrency(row.balance)}</TableCell>
          </TableRow>
        );
      }
      return null;
    });
  };

  return (
    <Layout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Reports Generator</Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Report Type</InputLabel>
              <Select 
                value={reportType} 
                label="Report Type" 
                onChange={(e) => {
                  setReportType(e.target.value);
                  setReportData(null);
                }}
              >
                <MenuItem value="financial_summary">Financial Summary</MenuItem>
                <MenuItem value="collection_report">Daily/Period Collection</MenuItem>
                <MenuItem value="expense_report">Expense Report</MenuItem>
                <MenuItem value="customer_ledger">Customer Ledger</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {reportType === 'customer_ledger' && (
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Select Resident</InputLabel>
                <Select 
                  value={selectedResident} 
                  label="Select Resident" 
                  onChange={(e) => setSelectedResident(e.target.value)}
                >
                  {residents.map(res => (
                    <MenuItem key={res._id} value={res._id}>
                      {res.lastName}, {res.firstName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          <Grid item xs={6} md={2}>
            <TextField 
              label="Start Date" 
              name="startDate" 
              type="date" 
              fullWidth 
              InputLabelProps={{ shrink: true }} 
              value={dateRange.startDate}
              onChange={handleChange} 
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField 
              label="End Date" 
              name="endDate" 
              type="date" 
              fullWidth 
              InputLabelProps={{ shrink: true }}
              value={dateRange.endDate} 
              onChange={handleChange} 
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Button variant="contained" fullWidth startIcon={<AssessmentIcon />} onClick={generateReport}>
              Generate
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Print Button */}
      {reportData && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>
            Print Report
          </Button>
        </Box>
      )}

      {/* IMPORTANT FIX: 
         We moved the "printable area" logic slightly. 
         We verify reportData exists before rendering the content inside the div,
         but the DIV with the REF is always rendered (even if empty).
         This ensures react-to-print always finds the DOM node.
      */}
      <div style={{ display: reportData ? 'block' : 'none' }}>
        <div ref={componentRef} style={{ padding: '20px' }}>
          {reportData && (
            <Paper elevation={0} sx={{ p: 5 }} id="printable-area">
              {/* Report Header */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>BANCOM LIFE HOMEOWNERS ASSOCIATION, INC.</Typography>
                <Typography variant="body2">San Mateo, Rizal</Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>{reportData.title}</Typography>
                <Typography variant="caption">
                  Period: {new Date(dateRange.startDate).toLocaleDateString()} - {new Date(dateRange.endDate).toLocaleDateString()}
                </Typography>
              </Box>

              {/* Financial Summary View */}
              {reportType === 'financial_summary' ? (
                <Grid container spacing={3} sx={{ mb: 4, mt: 2 }}>
                  <Grid item xs={4}>
                    <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', bgcolor: '#f1f8e9' }}>
                      <Typography variant="subtitle2">Total Collections</Typography>
                      <Typography variant="h5" color="success.main">₱{formatCurrency(reportData.totalCollections)}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', bgcolor: '#ffebee' }}>
                      <Typography variant="subtitle2">Total Expenses</Typography>
                      <Typography variant="h5" color="error.main">₱{formatCurrency(reportData.totalExpenses)}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', bgcolor: '#e3f2fd' }}>
                      <Typography variant="subtitle2">Net Balance</Typography>
                      <Typography variant="h5" color="primary.main">₱{formatCurrency(reportData.netBalance)}</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              ) : (
                <>
                  {reportType === 'customer_ledger' && reportData.residentDetails && (
                    <Box sx={{ mb: 3 }}>
                      <Typography><strong>Resident:</strong> {reportData.residentDetails.lastName}, {reportData.residentDetails.firstName}</Typography>
                      <Typography><strong>Address:</strong> Blk {reportData.residentDetails.address.block} Lot {reportData.residentDetails.address.lot}</Typography>
                    </Box>
                  )}

                  <TableContainer sx={{ border: '1px solid #eee' }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: '#eeeeee' }}>
                        {renderTableHead()}
                      </TableHead>
                      <TableBody>
                        {renderTableBody()}
                        {(reportType === 'collection_report' || reportType === 'expense_report') && (
                          <TableRow>
                            <TableCell colSpan={reportType === 'collection_report' ? 4 : 3} sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                              TOTAL:
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                              ₱{formatCurrency(reportData.total)}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}

              <Box sx={{ mt: 8, display: 'flex', justifyContent: 'space-between', px: 4 }}>
                <Box sx={{ textAlign: 'center', width: 200 }}>
                  <Divider />
                  <Typography variant="subtitle2" sx={{ mt: 1 }}>Prepared By</Typography>
                </Box>
                <Box sx={{ textAlign: 'center', width: 200 }}>
                  <Divider />
                  <Typography variant="subtitle2" sx={{ mt: 1 }}>Approved By</Typography>
                </Box>
              </Box>
            </Paper>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Reports;