const Notification = require('../models/Notification');

const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20);
    return res.json(notifications);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Unable to load notifications' });
  }
};

module.exports = { getUserNotifications };
