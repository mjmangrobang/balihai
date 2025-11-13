const express = require('express');
const router = express.Router();
const { generateReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

// Changed to /generate to match the generic nature of the report
router.post('/generate', protect, generateReport);

module.exports = router;