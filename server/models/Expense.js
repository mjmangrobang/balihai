const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  particulars: { // New Field: Specific details
    type: String,
  },
  category: {
    type: String,
    enum: ['maintenance', 'utilities', 'salaries', 'supplies', 'other'],
    default: 'other',
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
  },
  proofImage: { // New Field: Stores the receipt image (Base64 string)
    type: String,
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

module.exports = mongoose.model('Expense', ExpenseSchema);