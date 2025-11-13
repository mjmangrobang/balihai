const Resident = require('../models/Resident');

// @desc    Get all residents
// @route   GET /api/residents
// @access  Private
const getResidents = async (req, res) => {
  try {
    // Sort by Block and Lot for easier reading
    const residents = await Resident.find().sort({ 'address.block': 1, 'address.lot': 1 });
    res.status(200).json(residents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new resident
// @route   POST /api/residents
// @access  Private
const addResident = async (req, res) => {
  const { firstName, lastName, contactNumber, email, address, type, status, vehicles } = req.body;

  if (!firstName || !lastName || !address || !address.block || !address.lot) {
    return res.status(400).json({ message: 'Please include all required fields' });
  }

  try {
    const resident = await Resident.create({
      firstName,
      lastName,
      contactNumber,
      email,
      address,
      type,
      status,
      vehicles
    });
    res.status(201).json(resident);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update resident details
// @route   PUT /api/residents/:id
// @access  Private
const updateResident = async (req, res) => {
  try {
    const resident = await Resident.findById(req.params.id);

    if (!resident) {
      return res.status(404).json({ message: 'Resident not found' });
    }

    const updatedResident = await Resident.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // Return the updated document
    );

    res.status(200).json(updatedResident);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete resident
// @route   DELETE /api/residents/:id
// @access  Private
const deleteResident = async (req, res) => {
  try {
    const resident = await Resident.findById(req.params.id);

    if (!resident) {
      return res.status(404).json({ message: 'Resident not found' });
    }

    await resident.deleteOne();
    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getResidents,
  addResident,
  updateResident,
  deleteResident,
};