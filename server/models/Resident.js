const mongoose = require('mongoose');

const ResidentSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    // Not required, as some seniors might not have email [cite: 1080]
  },
  address: {
    block: { type: String, required: true },
    lot: { type: String, required: true },
    street: { type: String, required: true },
  },
  // Tracks if they are a homeowner, tenant, or lot owner [cite: 974]
  type: {
    type: String,
    enum: ['homeowner', 'tenant', 'lot_owner'],
    default: 'homeowner',
  },
  // Tracks delinquency status [cite: 155]
  status: {
    type: String,
    enum: ['good_standing', 'delinquent'],
    default: 'good_standing',
  },
  // For vehicle sticker renewal [cite: 984]
  vehicles: [
    {
      plateNumber: String,
      model: String,
      type: { type: String, enum: ['car', 'motorcycle'] },
      stickerIssued: { type: Boolean, default: false }
    }
  ],
  // For demographic tracking (household members) [cite: 223]
  householdMembers: [
    {
      name: String,
      relation: String,
      age: Number
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Resident', ResidentSchema);