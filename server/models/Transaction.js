const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: true,
  },
  resident: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resident',
    required: true,
  },
  amountPaid: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'gcash', 'oracle_process'],
    required: true,
  },
  referenceNumber: {
    type: String,
  },
  // --- UPDATED: Array of Strings for multiple images ---
  receiptImages: [
    { type: String } 
  ],
  // --- NEW: Reason if admin rejects ---
  rejectionReason: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'rejected'],
    default: 'completed',
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
});

module.exports = mongoose.model('Transaction', TransactionSchema);