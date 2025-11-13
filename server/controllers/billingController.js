const Invoice = require('../models/Invoice');
const Transaction = require('../models/Transaction');
const Resident = require('../models/Resident');

// @desc    Get all invoices
const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('resident', 'firstName lastName address')
      .sort({ dueDate: 1 }); 
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new Invoice
const createInvoice = async (req, res) => {
  const { residentId, type, amount, description, month, year, dueDate } = req.body;

  try {
    const resident = await Resident.findById(residentId);
    if (!resident) return res.status(404).json({ message: 'Resident not found' });

    let penalty = 0;
    if (resident.status === 'delinquent') {
      penalty = parseFloat(amount) * 0.10; 
    }

    const totalAmount = parseFloat(amount) + penalty;

    const invoice = await Invoice.create({
      resident: residentId,
      type,
      amount,
      penalty,
      totalAmount,
      amountPaid: 0,
      description,
      month,
      year,
      dueDate
    });

    res.status(201).json(invoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Record a Payment (Manual Admin Entry)
const recordPayment = async (req, res) => {
  const { invoiceId, amountPaid, paymentMethod, referenceNumber } = req.body;

  try {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    const paidAmount = parseFloat(amountPaid);

    const transaction = await Transaction.create({
      invoice: invoiceId,
      resident: invoice.resident,
      amountPaid: paidAmount,
      paymentMethod,
      referenceNumber,
      status: 'completed',
      recordedBy: req.user._id
    });

    invoice.amountPaid = (invoice.amountPaid || 0) + paidAmount;

    if (invoice.amountPaid >= invoice.totalAmount) {
      invoice.status = 'paid';
    } else {
      invoice.status = 'partial';
    }
    await invoice.save();

    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Resident Submits Payment Proof (Online)
const submitPaymentProof = async (req, res) => {
  const { invoiceId, paymentMethod, referenceNumber } = req.body;
  
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'Please upload at least one screenshot.' });
  }

  try {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    const imageUrls = req.files.map(file => file.path);

    if (!req.user.linkedResident) {
       return res.status(400).json({ message: 'User not linked to resident.' });
    }

    // If amount is not specified in body (usually full balance for user), calc it
    // But for partial, admin verifies the actual amount later.
    // We record the INTENDED payment as the remaining balance for now.
    const remainingBalance = invoice.totalAmount - (invoice.amountPaid || 0);

    const transaction = await Transaction.create({
      invoice: invoiceId,
      resident: req.user.linkedResident, 
      amountPaid: remainingBalance, 
      paymentMethod, 
      referenceNumber,
      receiptImages: imageUrls, 
      status: 'pending',
      recordedBy: req.user._id
    });

    invoice.status = 'pending_approval';
    await invoice.save();

    res.status(201).json(transaction);
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin Approves or Rejects Payment
const approvePayment = async (req, res) => {
  const { status, rejectionReason, confirmedAmount } = req.body; 
  const { transactionId } = req.params;

  try {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    const invoice = await Invoice.findById(transaction.invoice);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    if (status === 'completed') {
      const finalAmount = parseFloat(confirmedAmount) || transaction.amountPaid;
      
      transaction.status = 'completed';
      transaction.amountPaid = finalAmount;

      invoice.amountPaid = (invoice.amountPaid || 0) + finalAmount;

      if (invoice.amountPaid >= invoice.totalAmount) {
        invoice.status = 'paid';
      } else {
        invoice.status = 'partial';
      }

    } else if (status === 'rejected') {
      transaction.status = 'rejected';
      transaction.rejectionReason = rejectionReason || 'No reason provided';
      
      if ((invoice.amountPaid || 0) > 0) {
        invoice.status = 'partial';
      } else {
        const isOverdue = new Date() > new Date(invoice.dueDate);
        invoice.status = isOverdue ? 'overdue' : 'unpaid';
      }
    }

    await transaction.save();
    await invoice.save();

    res.status(200).json({ transaction, invoice });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get Transaction by Invoice ID (For Verification)
const getTransactionByInvoice = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ 
        invoice: req.params.invoiceId,
        status: { $in: ['pending', 'rejected'] }
    }).sort({ paymentDate: -1 });

    if (!transaction) return res.status(404).json({ message: 'No transaction found' });
    
    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged-in user's invoices
const getMyInvoices = async (req, res) => {
  try {
    if (!req.user.linkedResident) {
      return res.status(400).json({ message: 'User is not linked to a resident profile' });
    }

    const invoices = await Invoice.find({ resident: req.user.linkedResident })
      .sort({ dueDate: 1 });
      
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- NEW FUNCTION: Get History for a specific Invoice ---
const getInvoiceHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({ invoice: req.params.invoiceId })
      .sort({ paymentDate: -1 }); // Newest first
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getInvoices,
  createInvoice,
  recordPayment,
  submitPaymentProof,
  approvePayment,
  getTransactionByInvoice,
  getMyInvoices,
  getInvoiceHistory, // Export the new function
};