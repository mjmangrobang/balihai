const Resident = require('../models/Resident');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

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

// @desc    Register a new resident AND create a User account
// @route   POST /api/residents
// @access  Private
const addResident = async (req, res) => {
  const { firstName, lastName, contactNumber, email, address, type, status, vehicles } = req.body;

  if (!firstName || !lastName || !address || !address.block || !address.lot) {
    return res.status(400).json({ message: 'Please include all required fields' });
  }

  try {
    // 1. Check if email already exists (if provided)
    if (email) {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: 'Email already registered to a user' });
      }
    }

    // 2. Create Resident Record
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

    // 3. Automatically Create User Account
    // Generate a dummy email if none provided: firstname.lastname@balihai.com
    const userEmail = email || `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/\s/g, '')}@balihai.com`;
    
    // Default Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Balihai@123', salt);

    await User.create({
      name: `${firstName} ${lastName}`,
      email: userEmail,
      password: hashedPassword,
      role: 'resident',
      linkedResident: resident._id,
      isActive: true
    });

    res.status(201).json(resident);
  } catch (error) {
    // If duplicate key error (usually email)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email or Record already exists' });
    }
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
      { new: true }
    );

    // Optional: Update User email if resident email changes
    if (req.body.email) {
      await User.findOneAndUpdate(
        { linkedResident: req.params.id },
        { email: req.body.email }
      );
    }

    res.status(200).json(updatedResident);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete resident AND their User account
// @route   DELETE /api/residents/:id
// @access  Private
const deleteResident = async (req, res) => {
  try {
    const resident = await Resident.findById(req.params.id);

    if (!resident) {
      return res.status(404).json({ message: 'Resident not found' });
    }

    // Delete the Resident Profile
    await resident.deleteOne();

    // Delete the Linked User Account
    await User.findOneAndDelete({ linkedResident: req.params.id });

    res.status(200).json({ id: req.params.id, message: 'Resident and Account removed' });
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