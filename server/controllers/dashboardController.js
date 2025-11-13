const Resident = require('../models/Resident');
const User = require('../models/User');

// @desc    Get Dashboard Statistics
// @route   GET /api/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    // Count total residents
    const totalResidents = await Resident.countDocuments();

    // Count delinquents
    const delinquentResidents = await Resident.countDocuments({ status: 'delinquent' });

    // Calculate delinquency rate (avoid division by zero)
    const delinquencyRate = totalResidents > 0 
      ? ((delinquentResidents / totalResidents) * 100).toFixed(1) 
      : 0;

    // Mock financial data (Until we build the Billing Module)
    const monthlyCollection = 0; 
    const pendingDues = 0;

    res.status(200).json({
      totalResidents,
      delinquentResidents,
      delinquencyRate,
      monthlyCollection,
      pendingDues,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getDashboardStats };