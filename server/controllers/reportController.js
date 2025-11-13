const Transaction = require('../models/Transaction');
const Expense = require('../models/Expense');

// @desc    Get Financial Summary (Income vs Expenses)
// @route   POST /api/reports/financial
// @access  Private (Admin/Treasurer)
const getFinancialReport = async (req, res) => {
  const { startDate, endDate } = req.body;

  try {
    // Define date range filter
    const dateFilter = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };

    // 1. Get Total Collections (Transactions)
    const transactions = await Transaction.find({
      paymentDate: dateFilter
    }).populate('resident', 'firstName lastName');

    const totalCollections = transactions.reduce((acc, curr) => acc + curr.amountPaid, 0);

    // 2. Get Total Expenses
    const expenses = await Expense.find({
      date: dateFilter
    });

    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

    // 3. Calculate Net
    const netBalance = totalCollections - totalExpenses;

    res.status(200).json({
      startDate,
      endDate,
      totalCollections,
      totalExpenses,
      netBalance,
      transactions, // Detailed list for the table
      expenses      // Detailed list for the table
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getFinancialReport };