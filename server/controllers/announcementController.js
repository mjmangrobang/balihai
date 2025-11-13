const Announcement = require('../models/Announcement');

// @desc    Get all announcements
// @route   GET /api/announcements
const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Post an announcement
// @route   POST /api/announcements
const createAnnouncement = async (req, res) => {
  const { title, details, priority } = req.body;

  if (!title || !details) {
    return res.status(400).json({ message: 'Please add a title and details' });
  }

  try {
    const announcement = await Announcement.create({
      title,
      details,
      priority,
      postedBy: req.user.id,
    });
    res.status(201).json(announcement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete an announcement
// @route   DELETE /api/announcements/:id
const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    await announcement.deleteOne();
    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
};