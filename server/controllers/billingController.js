const Invoice = require('../models/Invoice');
const Transaction = require('../models/Transaction');
const Resident = require('../models/Resident');

// @desc    Get all invoices
// @route   GET /api/billing/invoices
const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('resident', 'firstName lastName address')
      .sort({ dueDate: 1 }); // Sort by oldest due date first
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new Invoice (e.g., Monthly Dues)
// @route   POST /api/billing/invoices
const createInvoice = async (req, res) => {
  const { residentId, type, amount, description, month, year, dueDate } = req.body;

  try {
    const invoice = await Invoice.create({
      resident: residentId,
      type,
      amount,
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

// @desc    Record a Payment
// @route   POST /api/billing/pay
const recordPayment = async (req, res) => {
  const { invoiceId, amountPaid, paymentMethod, referenceNumber, receiptImage } = req.body;

  try {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Create Transaction Record
    const transaction = await Transaction.create({
      invoice: invoiceId,
      resident: invoice.resident,
      amountPaid,
      paymentMethod,
      referenceNumber,
      receiptImage,
      recordedBy: req.user._id
    });

    // Update Invoice Status
    if (amountPaid >= invoice.amount) {
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

module.exports = {
  getInvoices,
  createInvoice,
  recordPayment
};

// @desc    Get logged-in user's invoices
// @route   GET /api/billing/my-invoices
const getMyInvoices = async (req, res) => {
  try {
    // Check if user is actually linked to a resident
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

module.exports = {
  getInvoices,
  createInvoice,
  recordPayment,
  getMyInvoices, // <--- Export the new function
};