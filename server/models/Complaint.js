const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  resident: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resident',
    required: true,
  },
  type: {
    type: String,
    enum: ['complaint', 'service_request', 'incident_report'],
    default: 'complaint',
  },
  subject: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved', 'rejected'],
    default: 'pending',
  },
  dateFiled: {
    type: Date,
    default: Date.now,
  },
  resolvedDate: {
    type: Date,
  },
  isArchived: { // New Field for Archiving
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Complaint', ComplaintSchema);