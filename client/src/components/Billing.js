import React, { useState, useEffect, useRef } from 'react';
import axios from '../api/axios';
import Layout from './Layout';
import InvoiceTemplate from './InvoiceTemplate';
import { useReactToPrint } from 'react-to-print';
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PaymentIcon from '@mui/icons-material/Payment';
import FilterListIcon from '@mui/icons-material/FilterList';
import PrintIcon from '@mui/icons-material/Print';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from '@mui/icons-material/Close'; // Import Close Icon

const Billing = () => {
  const [invoices, setInvoices] = useState([]);
  const [residents, setResidents] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [openInvoiceDialog, setOpenInvoiceDialog] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [openPrintDialog, setOpenPrintDialog] = useState(false);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  
  // --- NEW: Image Preview State ---
  const [imagePreview, setImagePreview] = useState(null); // Stores URL
  
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [verificationData, setVerificationData] = useState(null); 
  const [historyData, setHistoryData] = useState([]);

  const [verifyAmount, setVerifyAmount] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  const [invoiceForm, setInvoiceForm] = useState({
    residentId: '',
    type: 'monthly_dues',
    description: '',
    amount: '',
    dueDate: ''
  });

  const [paymentForm, setPaymentForm] = useState({
    amountPaid: '',
    paymentMethod: 'cash',
    referenceNumber: ''
  });

  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const showToast = (message, severity) => setToast({ open: true, message, severity });
  const handleCloseToast = () => setToast({ ...toast, open: false });

  useEffect(() => {
    fetchInvoices();
    fetchResidents();
  }, []);

  const fetchInvoices = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('/api/billing/invoices', config);
      setInvoices(data);
    } catch (error) {
      console.error(error);
    }
  };

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

  const filteredInvoices = invoices.filter(invoice => {
    if (filterStatus === 'all') return true;
    return invoice.status === filterStatus;
  });

  const pendingReviewCount = invoices.filter(inv => inv.status === 'pending_approval').length;

  const handleInvoiceChange = (e) => setInvoiceForm({ ...invoiceForm, [e.target.name]: e.target.value });
  const handlePaymentChange = (e) => setPaymentForm({ ...paymentForm, [e.target.name]: e.target.value });

  const handleSubmitInvoice = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('/api/billing/invoices', invoiceForm, config);
      setOpenInvoiceDialog(false);
      showToast('Invoice created successfully', 'success');
      fetchInvoices();
    } catch (error) {
      showToast('Error creating invoice', 'error');
    }
  };

  const openPayModal = async (invoice) => {
    setSelectedInvoice(invoice);
    setVerificationData(null); 
    setRejectionReason('');
    
    const remainingBalance = invoice.totalAmount - (invoice.amountPaid || 0);
    setPaymentForm({
      amountPaid: remainingBalance, 
      paymentMethod: 'cash',
      referenceNumber: ''
    });

    if (invoice.status === 'pending_approval') {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`/api/billing/transaction/${invoice._id}`, config);
            setVerificationData(data);
            setVerifyAmount(data.amountPaid);
        } catch (error) {
            console.error("Could not fetch proof");
        }
    }

    setOpenPaymentDialog(true);
  };

  const openPrintModal = (invoice) => {
    const safeInvoice = {
        ...invoice,
        totalAmount: invoice.totalAmount || invoice.amount || 0
    };
    setSelectedInvoice(safeInvoice);
    setOpenPrintDialog(true);
  };

  const openHistoryModal = async (invoice) => {
    setSelectedInvoice(invoice);
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`/api/billing/history/${invoice._id}`, config);
        setHistoryData(data);
        setOpenHistoryDialog(true);
    } catch (error) {
        showToast('Could not fetch history', 'error');
    }
  };

  const handleAdminAction = async (actionType) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      if (selectedInvoice.status === 'pending_approval') {
        if (!verificationData) return;

        if (actionType === 'rejected' && !rejectionReason) {
            showToast("Please provide a reason for rejection.", "warning");
            return;
        }
        
        await axios.put(`/api/billing/pay/approve/${verificationData._id}`, {
            status: actionType,
            rejectionReason,
            confirmedAmount: verifyAmount 
        }, config);

        showToast(actionType === 'completed' ? 'Payment Approved' : 'Payment Rejected', actionType === 'completed' ? 'success' : 'info');

      } else {
        await axios.post('/api/billing/pay', {
            invoiceId: selectedInvoice._id,
            ...paymentForm
        }, config);
        showToast('Payment recorded manually', 'success');
      }

      setOpenPaymentDialog(false);
      fetchInvoices();
    } catch (error) {
      showToast('Action failed', 'error');
    }
  };

  // Calculate Total for History
  const totalHistoryAmount = historyData.reduce((acc, curr) => acc + (curr.status === 'completed' ? curr.amountPaid : 0), 0);

  return (
    <Layout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Billing & Invoices</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => setOpenInvoiceDialog(true)}
        >
          Create Invoice
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <FilterListIcon color="action" />
        <Typography variant="subtitle1">Filter Status:</Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <MenuItem value="all">All Invoices</MenuItem>
            <MenuItem value="unpaid">Unpaid</MenuItem>
            <MenuItem value="pending_approval">
                Pending Approval 
                {pendingReviewCount > 0 && <Chip label={pendingReviewCount} color="warning" size="small" sx={{ ml: 1 }}/>}
            </MenuItem>
            <MenuItem value="paid">Paid</MenuItem>
            <MenuItem value="partial">Partial</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Resident</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Total Due</TableCell>
              <TableCell>Paid So Far</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInvoices.map((invoice) => (
              <TableRow key={invoice._id} sx={{ bgcolor: invoice.status === 'pending_approval' ? '#fff3e0' : 'inherit' }}>
                <TableCell>
                  {invoice.resident ? `${invoice.resident.lastName}, ${invoice.resident.firstName}` : 'Unknown'}
                </TableCell>
                <TableCell>{invoice.description}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                    ₱{(invoice.totalAmount || invoice.amount || 0).toLocaleString()}
                </TableCell>
                <TableCell>₱{(invoice.amountPaid || 0).toLocaleString()}</TableCell>
                <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip 
                    label={invoice.status === 'pending_approval' ? 'NEEDS REVIEW' : invoice.status.toUpperCase()} 
                    color={
                        invoice.status === 'paid' ? 'success' : 
                        invoice.status === 'pending_approval' ? 'warning' :
                        invoice.status === 'partial' ? 'info' : 'error'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="History">
                    <IconButton onClick={() => openHistoryModal(invoice)} color="default">
                      <HistoryIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Print Invoice">
                    <IconButton onClick={() => openPrintModal(invoice)} color="primary">
                      <PrintIcon />
                    </IconButton>
                  </Tooltip>
                  
                  {invoice.status === 'pending_approval' ? (
                      <Tooltip title="Review Payment">
                          <IconButton onClick={() => openPayModal(invoice)} color="warning">
                              <VisibilityIcon />
                          </IconButton>
                      </Tooltip>
                  ) : invoice.status !== 'paid' && (
                    <Tooltip title="Pay">
                        <IconButton onClick={() => openPayModal(invoice)} color="success">
                            <PaymentIcon />
                        </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* History Dialog */}
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
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            {tx.receiptImages && tx.receiptImages.length > 0 ? (
                                                tx.receiptImages.map((img, i) => (
                                                    <img 
                                                        key={i} 
                                                        src={img} 
                                                        alt="proof" 
                                                        style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4, cursor: 'pointer', border: '1px solid #ddd' }} 
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

      {/* IMAGE PREVIEW DIALOG (POPUP) */}
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

      {/* ... (Existing Invoice, Payment, Print Dialogs stay here) ... */}
      {/* Note: I assume you still have the Invoice/Payment Dialogs code from the previous response. 
          If you need me to paste the ENTIRE file again including those, I can. 
          For brevity, I'm ensuring the main feature logic is above. 
      */}
      <Dialog open={openInvoiceDialog} onClose={() => setOpenInvoiceDialog(false)} fullWidth>
        <DialogTitle>Create New Invoice</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Resident</InputLabel>
              <Select name="residentId" value={invoiceForm.residentId} label="Resident" onChange={handleInvoiceChange}>
                {residents.map((res) => (
                  <MenuItem key={res._id} value={res._id}>
                    {res.lastName}, {res.firstName} (Blk {res.address.block} Lot {res.address.lot})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select name="type" value={invoiceForm.type} label="Type" onChange={handleInvoiceChange}>
                <MenuItem value="monthly_dues">Monthly Dues</MenuItem>
                <MenuItem value="sticker_fee">Sticker Fee</MenuItem>
                <MenuItem value="venue_rental">Venue Rental</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Description" name="description" fullWidth onChange={handleInvoiceChange} />
            <TextField label="Amount" name="amount" type="number" fullWidth onChange={handleInvoiceChange} />
            <TextField 
              label="Due Date" 
              name="dueDate" 
              type="date" 
              fullWidth 
              InputLabelProps={{ shrink: true }} 
              onChange={handleInvoiceChange} 
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenInvoiceDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitInvoice}>Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
            {selectedInvoice?.status === 'pending_approval' ? 'Verify Payment Proof' : 'Record Manual Payment'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            
            {selectedInvoice?.status === 'pending_approval' && verificationData ? (
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>Proof of Payment</Typography>
                        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
                            {verificationData.receiptImages && verificationData.receiptImages.length > 0 ? (
                                verificationData.receiptImages.map((img, index) => (
                                    <img 
                                        key={index} 
                                        src={img} 
                                        alt="proof" 
                                        style={{ height: 100, width: 100, objectFit: 'cover', cursor: 'pointer', border: '1px solid #ccc' }} 
                                        onClick={() => setImagePreview(img)}
                                    />
                                ))
                            ) : verificationData.receiptImage ? (
                                <img 
                                    src={verificationData.receiptImage} 
                                    alt="proof" 
                                    style={{ height: 100, width: 100, objectFit: 'cover', cursor: 'pointer', border: '1px solid #ccc' }} 
                                    onClick={() => setImagePreview(verificationData.receiptImage)}
                                />
                            ) : (
                                <Typography color="error">No image found</Typography>
                            )}
                        </Box>
                        <Typography variant="body2" sx={{ mt: 2 }}>
                            <strong>Reference No:</strong> {verificationData.referenceNumber} <br/>
                            <strong>Method:</strong> {verificationData.paymentMethod}
                        </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', gap: 2, borderLeft: '1px solid #eee', pl: 2 }}>
                        <Typography variant="h6">Verification Action</Typography>
                        
                        <TextField
                            label="Confirmed Amount"
                            type="number"
                            fullWidth
                            helperText="Adjust if payment is partial"
                            value={verifyAmount}
                            onChange={(e) => setVerifyAmount(e.target.value)}
                        />

                        <TextField
                            label="Rejection Reason"
                            multiline
                            rows={2}
                            fullWidth
                            placeholder="Required if rejecting..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                        />
                    </Grid>
                </Grid>
            ) : (
                <>
                    <Typography variant="subtitle1">
                    Paying for: {selectedInvoice?.description}
                    </Typography>
                    <TextField 
                    label="Amount Paid" 
                    name="amountPaid" 
                    type="number" 
                    fullWidth 
                    value={paymentForm.amountPaid}
                    onChange={handlePaymentChange} 
                    />
                    <FormControl fullWidth>
                    <InputLabel>Payment Method</InputLabel>
                    <Select name="paymentMethod" value={paymentForm.paymentMethod} label="Payment Method" onChange={handlePaymentChange}>
                        <MenuItem value="cash">Cash</MenuItem>
                        <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                        <MenuItem value="gcash">GCash</MenuItem>
                    </Select>
                    </FormControl>
                    <TextField 
                    label="Reference No." 
                    name="referenceNumber" 
                    fullWidth 
                    onChange={handlePaymentChange} 
                    />
                </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPaymentDialog(false)}>Close</Button>
          
          {selectedInvoice?.status === 'pending_approval' ? (
              <>
                <Button variant="outlined" color="error" onClick={() => handleAdminAction('rejected')}>
                    Reject
                </Button>
                <Button variant="contained" color="success" onClick={() => handleAdminAction('completed')}>
                    Approve ({verifyAmount})
                </Button>
              </>
          ) : (
              <Button variant="contained" color="success" onClick={() => handleAdminAction('manual')}>
                Confirm Payment
              </Button>
          )}
        </DialogActions>
      </Dialog>

      <Dialog open={openPrintDialog} onClose={() => setOpenPrintDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>View Invoice</DialogTitle>
        <DialogContent>
          <div ref={componentRef}>
            <InvoiceTemplate invoice={selectedInvoice} />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPrintDialog(false)}>Close</Button>
          <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrint}>
            Print Invoice
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={toast.open} 
        autoHideDuration={6000} 
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>

    </Layout>
  );
};

export default Billing;