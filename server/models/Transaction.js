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
    enum: ['cash', 'bank_transfer', 'gcash'],
    required: true,
  },
  referenceNumber: {
    type: String, // For Bank/GCash ref numbers
  },
  receiptImage: {
    type: String, // URL to the uploaded image
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId, // The staff who encoded it
    ref: 'User',
  }
});

module.exports = mongoose.model('Transaction', TransactionSchema);