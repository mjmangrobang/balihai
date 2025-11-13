const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const {
  getInvoices,
  createInvoice,
  recordPayment,
  submitPaymentProof,
  approvePayment,
  getMyInvoices,
  getTransactionByInvoice,
  getInvoiceHistory // Import the new controller
} = require('../controllers/billingController');
const { protect } = require('../middleware/authMiddleware');

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'balihai_payments',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

const upload = multer({ storage: storage });

// Routes
router.get('/invoices', protect, getInvoices);
router.get('/my-invoices', protect, getMyInvoices);
router.get('/transaction/:invoiceId', protect, getTransactionByInvoice);

// --- NEW ROUTE for History ---
router.get('/history/:invoiceId', protect, getInvoiceHistory);

router.post('/invoices', protect, createInvoice);
router.post('/pay', protect, recordPayment);
router.post('/pay/online', protect, upload.array('receiptImages', 3), submitPaymentProof);

router.put('/pay/approve/:transactionId', protect, approvePayment);

module.exports = router;