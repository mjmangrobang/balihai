const express = require('express');
const router = express.Router();
const {
  getComplaints,
  getArchivedComplaints,
  createComplaint,
  updateComplaintStatus,
  archiveComplaint
} = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getComplaints);
router.get('/archived', protect, getArchivedComplaints);
router.post('/', protect, createComplaint);
router.put('/:id', protect, updateComplaintStatus);
router.put('/:id/archive', protect, archiveComplaint);

module.exports = router;