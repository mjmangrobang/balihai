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
    type: String, // e.g., "January 2025 Dues"
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  month: { type: String }, // e.g., "January"
  year: { type: Number },  // e.g., 2025
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