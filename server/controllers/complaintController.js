const Complaint = require('../models/Complaint');

// @desc    Get all complaints
// @route   GET /api/complaints
const getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('resident', 'firstName lastName address')
      .sort({ dateFiled: -1 });
    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    File a complaint (Admin logging on behalf of resident)
// @route   POST /api/complaints
const createComplaint = async (req, res) => {
  const { residentId, type, subject, description } = req.body;

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

module.exports = {
  getComplaints,
  createComplaint,
  updateComplaintStatus,
};