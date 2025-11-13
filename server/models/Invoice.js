const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  resident: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resident',
    required: true,
  },
  type: {
    type: String,
    enum: ['monthly_dues', 'sticker_fee', 'venue_rental', 'other'],
    default: 'monthly_dues',
  },
  description: {
    type: String,
    required: true,
  },
  amount: {
    type: Number, // Base Amount
    required: true,
  },
  penalty: {
    type: Number, // Added Penalty for delinquents
    default: 0,
  },
  totalAmount: {
    type: Number, // Amount + Penalty
    required: true,
  },
  month: { type: String },
  year: { type: Number },
  dueDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['unpaid', 'paid', 'overdue', 'partial'],
    default: 'unpaid',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Invoice', InvoiceSchema);