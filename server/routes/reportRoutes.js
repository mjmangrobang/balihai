const express = require('express');
const router = express.Router();
const { getFinancialReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.post('/financial', protect, getFinancialReport);

module.exports = router;