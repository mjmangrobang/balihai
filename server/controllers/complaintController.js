const Complaint = require('../models/Complaint');

// @desc    Get active (non-archived) complaints - ADMIN VIEW
// @route   GET /api/complaints
const getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ isArchived: false })
      .populate('resident', 'firstName lastName address')
      .sort({ dateFiled: -1 });
    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get archived complaints - ADMIN VIEW
// @route   GET /api/complaints/archived
const getArchivedComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ isArchived: true })
      .populate('resident', 'firstName lastName address')
      .sort({ dateFiled: -1 });
    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged-in resident's complaints - RESIDENT VIEW
// @route   GET /api/complaints/my-complaints
const getMyComplaints = async (req, res) => {
  try {
    if (!req.user.linkedResident) {
      return res.status(400).json({ message: 'User not linked to a resident profile' });
    }

    const complaints = await Complaint.find({ resident: req.user.linkedResident })
      .sort({ dateFiled: -1 });
    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    File a complaint (Resident Only)
// @route   POST /api/complaints
const createComplaint = async (req, res) => {
  // For residents, we grab the ID from their token, not the body
  const residentId = req.user.role === 'resident' ? req.user.linkedResident : req.body.residentId;
  const { type, subject, description } = req.body;

  if (!residentId) {
    return res.status(400).json({ message: 'Resident ID is required' });
  }

  try {
    const complaint = await Complaint.create({
      resident: residentId,
      type,
      subject,
      description
    });
    res.status(201).json(complaint);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/:id
const updateComplaintStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.status = status;
    if (status === 'resolved') {
      complaint.resolvedDate = Date.now();
    }

    await complaint.save();
    res.status(200).json(complaint);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Archive a complaint
// @route   PUT /api/complaints/:id/archive
const archiveComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.isArchived = true;
    await complaint.save();
    res.status(200).json(complaint);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getComplaints,
  getArchivedComplaints,
  getMyComplaints, // NEW
  createComplaint,
  updateComplaintStatus,
  archiveComplaint
};