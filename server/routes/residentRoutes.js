const express = require('express');
const router = express.Router();
const {
  getResidents,
  addResident,
  updateResident,
  deleteResident,
} = require('../controllers/residentController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.route('/').get(protect, getResidents).post(protect, addResident);
router.route('/:id').put(protect, updateResident).delete(protect, deleteResident);

module.exports = router;