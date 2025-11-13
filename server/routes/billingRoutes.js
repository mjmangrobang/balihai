const express = require('express');
const router = express.Router();
const {
  getInvoices,
  createInvoice,
  recordPayment,
  getMyInvoices,
} = require('../controllers/billingController');
const { protect } = require('../middleware/authMiddleware');

// All routes protected
router.get('/invoices', protect, getInvoices);
router.get('/my-invoices', protect, getMyInvoices);
router.post('/invoices', protect, createInvoice);
router.post('/pay', protect, recordPayment);

module.exports = router;