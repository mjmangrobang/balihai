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
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PaymentIcon from '@mui/icons-material/Payment';
import FilterListIcon from '@mui/icons-material/FilterList';
import PrintIcon from '@mui/icons-material/Print';

const Billing = () => {
  const [invoices, setInvoices] = useState([]);
  const [residents, setResidents] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [openInvoiceDialog, setOpenInvoiceDialog] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [openPrintDialog, setOpenPrintDialog] = useState(false);
  
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // For Printing
  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
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

  const handleInvoiceChange = (e) => setInvoiceForm({ ...invoiceForm, [e.target.name]: e.target.value });
  const handlePaymentChange = (e) => setPaymentForm({ ...paymentForm, [e.target.name]: e.target.value });

  const handleSubmitInvoice = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      // Backend will handle penalty calculation automatically
      await axios.post('/api/billing/invoices', invoiceForm, config);
      setOpenInvoiceDialog(false);
      fetchInvoices();
    } catch (error) {
      alert('Error creating invoice');
    }
  };

  const openPayModal = (invoice) => {
    setSelectedInvoice(invoice);
    // FIX: Use fallback if totalAmount is missing
    const amountToPay = invoice.totalAmount || invoice.amount || 0;
    setPaymentForm({
      amountPaid: amountToPay, 
      paymentMethod: 'cash',
      referenceNumber: ''
    });
    setOpenPaymentDialog(true);
  };

  const openPrintModal = (invoice) => {
    // FIX: Ensure selected invoice has a totalAmount for the template
    const safeInvoice = {
        ...invoice,
        totalAmount: invoice.totalAmount || invoice.amount || 0
    };
    setSelectedInvoice(safeInvoice);
    setOpenPrintDialog(true);
  };

  const handleSubmitPayment = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      await axios.post('/api/billing/pay', {
        invoiceId: selectedInvoice._id,
        ...paymentForm
      }, config);

      setOpenPaymentDialog(false);
      fetchInvoices();
    } catch (error) {
      alert('Error recording payment');
    }
  };

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
              <TableCell>Base Amount</TableCell>
              <TableCell>Total (w/ Penalty)</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInvoices.map((invoice) => (
              <TableRow key={invoice._id}>
                <TableCell>
                  {invoice.resident ? `${invoice.resident.lastName}, ${invoice.resident.firstName}` : 'Unknown'}
                </TableCell>
                <TableCell>{invoice.description}</TableCell>
                {/* FIX: Added fallback || 0 to prevent crash */}
                <TableCell>₱{(invoice.amount || 0).toLocaleString()}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                    {/* FIX: If totalAmount is missing (old records), use amount */}
                    ₱{(invoice.totalAmount || invoice.amount || 0).toLocaleString()}
                </TableCell>
                <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip 
                    label={invoice.status.toUpperCase()} 
                    color={invoice.status === 'paid' ? 'success' : invoice.status === 'partial' ? 'warning' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Print Invoice">
                    <IconButton onClick={() => openPrintModal(invoice)} color="primary">
                      <PrintIcon />
                    </IconButton>
                  </Tooltip>
                  {invoice.status !== 'paid' && (
                    <Button 
                      size="small" 
                      startIcon={<PaymentIcon />}
                      onClick={() => openPayModal(invoice)}
                      color="success"
                    >
                      Pay
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filteredInvoices.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">No invoices found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Invoice Dialog */}
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
            <TextField label="Amount (System adds penalty automatically)" name="amount" type="number" fullWidth onChange={handleInvoiceChange} />
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

      {/* Record Payment Dialog */}
      <Dialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)}>
        <DialogTitle>Record Payment</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 300 }}>
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
                <MenuItem value="oracle_process">Oracle Process</MenuItem>
              </Select>
            </FormControl>
            <TextField 
              label="Reference No. (Optional)" 
              name="referenceNumber" 
              fullWidth 
              onChange={handlePaymentChange} 
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPaymentDialog(false)}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handleSubmitPayment}>
            Confirm Payment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Print Invoice Dialog */}
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
    </Layout>
  );
};

export default Billing;