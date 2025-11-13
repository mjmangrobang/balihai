const express = require('express');
const router = express.Router();
const {
  getAnnouncements,
  getArchivedAnnouncements,
  addAnnouncement,
  reuseAnnouncement, // New
  deleteAnnouncement,
} = require('../controllers/announcementController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getAnnouncements);
router.get('/archived', protect, getArchivedAnnouncements); // New Route
router.post('/', protect, addAnnouncement);
router.put('/:id/reuse', protect, reuseAnnouncement); // New Route
router.delete('/:id', protect, deleteAnnouncement);

module.exports = router;