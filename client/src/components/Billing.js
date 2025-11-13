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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PaymentIcon from '@mui/icons-material/Payment';
import FilterListIcon from '@mui/icons-material/FilterList';

const Billing = () => {
  const [invoices, setInvoices] = useState([]);
  const [residents, setResidents] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all'); // Filter State
  
  const [openInvoiceDialog, setOpenInvoiceDialog] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

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

  // Filter Logic
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
      await axios.post('/api/billing/invoices', invoiceForm, config);
      setOpenInvoiceDialog(false);
      fetchInvoices();
    } catch (error) {
      alert('Error creating invoice');
    }
  };

  const openPayModal = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentForm({
      amountPaid: invoice.amount,
      paymentMethod: 'cash',
      referenceNumber: ''
    });
    setOpenPaymentDialog(true);
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

      {/* Filter Bar */}
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
              <TableCell>Amount</TableCell>
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
                <TableCell>₱{invoice.amount}</TableCell>
                <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip 
                    label={invoice.status.toUpperCase()} 
                    color={invoice.status === 'paid' ? 'success' : invoice.status === 'partial' ? 'warning' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {invoice.status !== 'paid' && (
                    <Button 
                      size="small" 
                      startIcon={<PaymentIcon />}
                      onClick={() => openPayModal(invoice)}
                    >
                      Pay
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filteredInvoices.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">No invoices found.</TableCell>
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
    </Layout>
  );
};

export default Billing;