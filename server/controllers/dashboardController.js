const Resident = require('../models/Resident');
const Transaction = require('../models/Transaction');
const Announcement = require('../models/Announcement');

// @desc    Get Dashboard Statistics
// @route   GET /api/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    // 1. Resident Stats
    const totalResidents = await Resident.countDocuments();
    const delinquentResidents = await Resident.countDocuments({ status: 'delinquent' });
    const delinquencyRate = totalResidents > 0 
      ? ((delinquentResidents / totalResidents) * 100).toFixed(1) 
      : 0;

    // 2. Financial Stats (Current Month)
    const date = new Date();
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    
    // Aggregate total payments for this month
    const monthlyTransactions = await Transaction.aggregate([
      {
        $match: {
          paymentDate: { $gte: firstDayOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalCollection: { $sum: "$amountPaid" }
        }
      }
    ]);

    const monthlyCollection = monthlyTransactions.length > 0 
      ? monthlyTransactions[0].totalCollection 
      : 0;

    // 3. Chart Data (Income for Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const incomeHistory = await Transaction.aggregate([
      {
        $match: {
          paymentDate: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: { 
            month: { $month: "$paymentDate" }, 
            year: { $year: "$paymentDate" } 
          },
          total: { $sum: "$amountPaid" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Format chart data for Frontend (e.g., "Jan", "Feb")
    const formattedHistory = incomeHistory.map(item => {
      const date = new Date(item._id.year, item._id.month - 1);
      return {
        name: date.toLocaleString('default', { month: 'short' }),
        income: item.total
      };
    });

    // 4. Recent Announcements (Fetch top 3)
    const recentAnnouncements = await Announcement.find()
      .sort({ createdAt: -1 })
      .limit(3);

    res.status(200).json({
      totalResidents,
      delinquentResidents,
      delinquencyRate,
      monthlyCollection,
      incomeHistory: formattedHistory,
      announcements: recentAnnouncements
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching dashboard stats' });
  }
};

module.exports = { getDashboardStats };