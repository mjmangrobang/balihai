const Announcement = require('../models/Announcement');

// @desc    Get active announcements (Auto-archives expired ones)
// @route   GET /api/announcements
const getAnnouncements = async (req, res) => {
  try {
    const now = new Date();

    // 1. Find active announcements that have EXPIRED and Archive them
    await Announcement.updateMany(
      { isArchived: false, expirationDate: { $lt: now } },
      { $set: { isArchived: true } }
    );

    // 2. Fetch only Active (Non-Archived) announcements
    const announcements = await Announcement.find({ isArchived: false })
      .sort({ createdAt: -1 });

    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get archived announcements
// @route   GET /api/announcements/archived
const getArchivedAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ isArchived: true })
      .sort({ createdAt: -1 });
    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Post a new announcement
// @route   POST /api/announcements
const addAnnouncement = async (req, res) => {
  const { title, details, priority, durationDays } = req.body;

  if (!title || !details || !durationDays) {
    return res.status(400).json({ message: 'Please provide all fields including duration' });
  }

  // Calculate Expiration Date
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + parseInt(durationDays));

  try {
    const announcement = await Announcement.create({
      title,
      details,
      priority,
      expirationDate,
      postedBy: req.user.id,
    });
    res.status(201).json(announcement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Reuse/Repost an archived announcement
// @route   PUT /api/announcements/:id/reuse
const reuseAnnouncement = async (req, res) => {
  const { durationDays } = req.body;

  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Set new expiration date
    const newExpiration = new Date();
    newExpiration.setDate(newExpiration.getDate() + parseInt(durationDays));

    announcement.isArchived = false;
    announcement.createdAt = Date.now(); // Bring to top
    announcement.expirationDate = newExpiration;
    
    await announcement.save();
    res.status(200).json(announcement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete announcement
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
  getArchivedAnnouncements,
  addAnnouncement,
  reuseAnnouncement,
  deleteAnnouncement,
};