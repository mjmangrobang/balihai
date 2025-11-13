const Expense = require('../models/Expense');

// @desc    Get all expenses
// @route   GET /api/expenses
const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add new expense
// @route   POST /api/expenses
const addExpense = async (req, res) => {
  // Added particulars and proofImage to destructuring
  const { title, particulars, category, amount, description, date, proofImage } = req.body;

  if (!title || !amount) {
    return res.status(400).json({ message: 'Please provide title and amount' });
  }

  try {
    const expense = await Expense.create({
      title,
      particulars, // Save Particulars
      category,
      amount,
      description,
      proofImage, // Save Image String
      date: date || Date.now(),
      recordedBy: req.user.id,
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    await expense.deleteOne();
    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getExpenses,
  addExpense,
  deleteExpense,
};