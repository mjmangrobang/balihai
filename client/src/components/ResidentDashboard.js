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
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import HistoryIcon from '@mui/icons-material/History';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';

const ResidentDashboard = () => {
  const [invoices, setInvoices] = useState([]);
  const [user, setUser] = useState({});
  
  const [openPayDialog, setOpenPayDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: 'gcash',
    referenceNumber: ''
  });
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [historyData, setHistoryData] = useState([]);

  // --- NEW: Image Preview State ---
  const [imagePreview, setImagePreview] = useState(null);

  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUser(userData);
      fetchMyInvoices(userData);
    }
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

  const handleCloseToast = () => setToast({ ...toast, open: false });

  const showToast = (message, severity) => {
    setToast({ open: true, message, severity });
  };

  const handlePayClick = (invoice) => {
    setSelectedInvoice(invoice);
    setOpenPayDialog(true);
  };

  const handleViewHistory = async (invoice) => {
    setSelectedInvoice(invoice);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`/api/billing/history/${invoice._id}`, config);
      setHistoryData(data);
      setOpenHistoryDialog(true);
    } catch (error) {
      showToast("Could not fetch history", "error");
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 3) {
      showToast("You can only upload up to 3 images.", "error");
      return;
    }
    setSelectedFiles(files);
  };

  const handleInputChange = (e) => {
    setPaymentForm({ ...paymentForm, [e.target.name]: e.target.value });
  };

  const handleSubmitPayment = async () => {
    if (selectedFiles.length === 0) {
      showToast("Please upload at least one screenshot.", "warning");
      return;
    }

    try {
      const config = { 
        headers: { 
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data'
        } 
      };

      const formData = new FormData();
      formData.append('invoiceId', selectedInvoice._id);
      formData.append('paymentMethod', paymentForm.paymentMethod);
      formData.append('referenceNumber', paymentForm.referenceNumber);
      
      selectedFiles.forEach((file) => {
        formData.append('receiptImages', file);
      });

      await axios.post('/api/billing/pay/online', formData, config);

      showToast("Payment submitted! Waiting for Admin approval.", "success");
      
      setOpenPayDialog(false);
      setPaymentForm({ paymentMethod: 'gcash', referenceNumber: '' });
      setSelectedFiles([]);
      fetchMyInvoices(user); 

    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || "Error submitting payment.", "error");
    }
  };

  const getSafeTotal = (inv) => inv?.totalAmount || inv?.amount || 0;
  const getSafePaid = (inv) => inv?.amountPaid || 0;

  const allInvoices = invoices;

  const totalUnpaid = allInvoices.reduce((acc, curr) => {
    if (curr.status !== 'paid') {
        return acc + (getSafeTotal(curr) - getSafePaid(curr));
    }
    return acc;
  }, 0);

  // Calculate Total History Paid
  const totalHistoryAmount = historyData.reduce((acc, curr) => acc + (curr.status === 'completed' ? curr.amountPaid : 0), 0);

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user.name}
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

      {/* INVOICE LIST */}
      <Box sx={{ mb: 5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <ReceiptLongIcon color="primary" />
          <Typography variant="h5" fontWeight="bold">My Invoices</Typography>
        </Box>
        
        <Grid container spacing={2}>
          {allInvoices.map((invoice) => (
            <Grid item xs={12} md={6} key={invoice._id}>
              <Paper elevation={2} sx={{ p: 3, borderLeft: invoice.status === 'paid' ? '6px solid #2e7d32' : '6px solid #d32f2f' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <Box>
                    <Typography variant="h6">{invoice.description}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Due: {new Date(invoice.dueDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Chip 
                    label={invoice.status === 'pending_approval' ? 'VERIFYING' : invoice.status.toUpperCase()} 
                    color={
                        invoice.status === 'paid' ? 'success' : 
                        invoice.status === 'pending_approval' ? 'warning' : 'error'
                    } 
                    size="small" 
                  />
                </Box>
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Total Amount:</Typography>
                  <Typography variant="h6">₱{getSafeTotal(invoice).toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Paid so far:</Typography>
                  <Typography variant="body2" color="success.main">₱{getSafePaid(invoice).toLocaleString()}</Typography>
                </Box>
                
                {invoice.status !== 'paid' && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Typography variant="body2" fontWeight="bold">Remaining:</Typography>
                        <Typography variant="h5" fontWeight="bold" color="error.main">
                        ₱{(getSafeTotal(invoice) - getSafePaid(invoice)).toLocaleString()}
                        </Typography>
                    </Box>
                )}

                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    {invoice.status !== 'paid' && invoice.status !== 'pending_approval' && (
                        <Button 
                            variant="contained" 
                            color="primary" 
                            fullWidth 
                            onClick={() => handlePayClick(invoice)}
                        >
                            Pay Online
                        </Button>
                    )}
                    
                    <Button 
                        variant="outlined" 
                        color="info" 
                        fullWidth 
                        startIcon={<HistoryIcon />}
                        onClick={() => handleViewHistory(invoice)}
                    >
                        History
                    </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ONLINE PAYMENT DIALOG */}
      <Dialog open={openPayDialog} onClose={() => setOpenPayDialog(false)} fullWidth>
        <DialogTitle>Upload Payment Proof</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="info">
              Please transfer <strong>₱{(getSafeTotal(selectedInvoice) - getSafePaid(selectedInvoice)).toLocaleString()}</strong> to the Association Bank/GCash.
            </Alert>

            <FormControl fullWidth>
              <InputLabel>Payment Method</InputLabel>
              <Select
                name="paymentMethod"
                value={paymentForm.paymentMethod}
                label="Payment Method"
                onChange={handleInputChange}
              >
                <MenuItem value="gcash">GCash</MenuItem>
                <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Reference Number (Ref No.)"
              name="referenceNumber"
              fullWidth
              value={paymentForm.referenceNumber}
              onChange={handleInputChange}
            />

            <Typography variant="subtitle2">Upload Screenshots (Max 3):</Typography>
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              sx={{ height: 50, borderStyle: 'dashed' }}
            >
              Select Images
              <input type="file" hidden multiple accept="image/*" onChange={handleFileChange} />
            </Button>

            {selectedFiles.length > 0 && (
              <List dense>
                {selectedFiles.map((file, index) => (
                  <ListItem key={index}>
                    <ListItemIcon><ImageIcon /></ListItemIcon>
                    <ListItemText primary={file.name} />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPayDialog(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSubmitPayment}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* HISTORY DIALOG */}
      <Dialog open={openHistoryDialog} onClose={() => setOpenHistoryDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Payment History</DialogTitle>
        <DialogContent>
            <Typography variant="subtitle1" gutterBottom>
                Invoice: {selectedInvoice?.description}
            </Typography>
            <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Method</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Proof</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {historyData.length === 0 ? (
                            <TableRow><TableCell colSpan={5} align="center">No transactions found</TableCell></TableRow>
                        ) : (
                            historyData.map((tx) => (
                                <TableRow key={tx._id}>
                                    <TableCell>{new Date(tx.paymentDate).toLocaleDateString()}</TableCell>
                                    <TableCell>₱{tx.amountPaid.toLocaleString()}</TableCell>
                                    <TableCell sx={{ textTransform: 'capitalize' }}>{tx.paymentMethod}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={tx.status} 
                                            color={tx.status === 'completed' ? 'success' : tx.status === 'rejected' ? 'error' : 'warning'} 
                                            size="small" 
                                        />
                                        {tx.status === 'rejected' && (
                                            <Typography variant="caption" display="block" color="error">
                                                Reason: {tx.rejectionReason}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            {tx.receiptImages && tx.receiptImages.length > 0 ? (
                                                tx.receiptImages.map((img, i) => (
                                                    <img 
                                                        key={i} 
                                                        src={img} 
                                                        alt="proof" 
                                                        style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4, border: '1px solid #ddd', cursor: 'pointer' }} 
                                                        onClick={() => setImagePreview(img)}
                                                    />
                                                ))
                                            ) : tx.receiptImage ? (
                                                <img 
                                                    src={tx.receiptImage} 
                                                    alt="proof" 
                                                    style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4, cursor: 'pointer' }} 
                                                    onClick={() => setImagePreview(tx.receiptImage)}
                                                />
                                            ) : '-'}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                        {/* TOTAL ROW */}
                        {historyData.length > 0 && (
                            <TableRow sx={{ bgcolor: '#f0f0f0' }}>
                                <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>TOTAL PAID:</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>₱{totalHistoryAmount.toLocaleString()}</TableCell>
                                <TableCell colSpan={3}></TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpenHistoryDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* IMAGE PREVIEW DIALOG */}
      <Dialog 
        open={!!imagePreview} 
        onClose={() => setImagePreview(null)} 
        maxWidth="lg"
        PaperProps={{
            style: { backgroundColor: 'transparent', boxShadow: 'none' }
        }}
      >
        <Box sx={{ position: 'relative' }}>
            <IconButton 
                onClick={() => setImagePreview(null)} 
                sx={{ 
                    position: 'absolute', 
                    right: -10, 
                    top: -10, 
                    color: 'white', 
                    bgcolor: 'rgba(0,0,0,0.7)',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.9)' }
                }}
            >
                <CloseIcon />
            </IconButton>
            <img 
                src={imagePreview} 
                alt="Preview" 
                style={{ 
                    maxWidth: '90vw', 
                    maxHeight: '90vh', 
                    borderRadius: 8, 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.5)' 
                }} 
            />
        </Box>
      </Dialog>

      <Snackbar 
        open={toast.open} 
        autoHideDuration={6000} 
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>

    </Layout>
  );
};

export default ResidentDashboard;