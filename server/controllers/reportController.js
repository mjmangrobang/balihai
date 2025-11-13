const Transaction = require('../models/Transaction');
const Expense = require('../models/Expense');
const Invoice = require('../models/Invoice');
const Resident = require('../models/Resident');

// @desc    Generate Specific Reports
// @route   POST /api/reports/generate
// @access  Private (Admin/Treasurer)
const generateReport = async (req, res) => {
  const { type, startDate, endDate, residentId } = req.body;

  try {
    // Standard Date Filter
    const dateFilter = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };

    let reportData = {};

    // --- REPORT TYPE 1: FINANCIAL SUMMARY (Income vs Expense) ---
    if (type === 'financial_summary') {
      const transactions = await Transaction.find({ paymentDate: dateFilter })
        .populate('resident', 'firstName lastName');
      const totalCollections = transactions.reduce((acc, curr) => acc + curr.amountPaid, 0);

      const expenses = await Expense.find({ date: dateFilter });
      const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

      reportData = {
        title: 'Financial Summary Report',
        totalCollections,
        totalExpenses,
        netBalance: totalCollections - totalExpenses,
        details: [] // Summary doesn't need long lists here, visualized in frontend
      };
    }

    // --- REPORT TYPE 2: DAILY/PERIODIC COLLECTION REPORT ---
    else if (type === 'collection_report') {
      const transactions = await Transaction.find({ paymentDate: dateFilter })
        .populate('resident', 'firstName lastName address')
        .populate('invoice', 'description') // Get what they paid for
        .sort({ paymentDate: 1 });

      const total = transactions.reduce((acc, curr) => acc + curr.amountPaid, 0);

      reportData = {
        title: 'Collection Report',
        total,
        details: transactions.map(t => ({
          date: t.paymentDate,
          resident: t.resident ? `${t.resident.lastName}, ${t.resident.firstName}` : 'Unknown',
          blockLot: t.resident ? `B${t.resident.address.block} L${t.resident.address.lot}` : '-',
          description: t.invoice ? t.invoice.description : 'Payment',
          reference: t.referenceNumber || '-',
          method: t.paymentMethod,
          amount: t.amountPaid
        }))
      };
    }

    // --- REPORT TYPE 3: EXPENSE REPORT ---
    else if (type === 'expense_report') {
      const expenses = await Expense.find({ date: dateFilter })
        .sort({ date: 1 });

      const total = expenses.reduce((acc, curr) => acc + curr.amount, 0);

      reportData = {
        title: 'Expense Report',
        total,
        details: expenses.map(e => ({
          date: e.date,
          title: e.title,
          category: e.category,
          particulars: e.particulars || '-',
          amount: e.amount
        }))
      };
    }

    // --- REPORT TYPE 4: CUSTOMER LEDGER (Specific Resident History) ---
    else if (type === 'customer_ledger') {
      if (!residentId) {
        return res.status(400).json({ message: 'Resident ID is required for Ledger' });
      }

      const resident = await Resident.findById(residentId);
      
      // 1. Get all Invoices (Charges/Debits)
      const invoices = await Invoice.find({ resident: residentId });
      
      // 2. Get all Payments (Credits)
      const payments = await Transaction.find({ resident: residentId });

      // 3. Combine and Sort by Date
      let ledgerEntries = [];

      // Add Invoices (Positive Amount / Debit)
      invoices.forEach(inv => {
        ledgerEntries.push({
          date: inv.createdAt,
          description: `Invoice: ${inv.description}`,
          debit: inv.totalAmount || inv.amount, // Use total with penalty if exists
          credit: 0,
          ref: '-'
        });
      });

      // Add Payments (Negative Amount / Credit)
      payments.forEach(pay => {
        ledgerEntries.push({
          date: pay.paymentDate,
          description: `Payment (${pay.paymentMethod})`,
          debit: 0,
          credit: pay.amountPaid,
          ref: pay.referenceNumber || '-'
        });
      });

      // Sort chronologically
      ledgerEntries.sort((a, b) => new Date(a.date) - new Date(b.date));

      // Calculate Running Balance
      let runningBalance = 0;
      const finalLedger = ledgerEntries.map(entry => {
        runningBalance = runningBalance + entry.debit - entry.credit;
        return { ...entry, balance: runningBalance };
      });

      reportData = {
        title: `Customer Ledger: ${resident.lastName}, ${resident.firstName}`,
        residentDetails: resident,
        totalDue: runningBalance, // Final balance
        details: finalLedger
      };
    }

    res.status(200).json(reportData);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { generateReport };