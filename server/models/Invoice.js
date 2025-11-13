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
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number, // Target total to be paid
    required: true,
  },
  // --- NEW FIELD: Track how much has been paid so far ---
  amountPaid: {
    type: Number,
    default: 0,
  },
  month: { type: String },
  year: { type: Number },
  dueDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['unpaid', 'paid', 'overdue', 'partial', 'pending_approval'],
    default: 'unpaid',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Invoice', InvoiceSchema);