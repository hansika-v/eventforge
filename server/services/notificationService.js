const Notification = require('../models/Notification');

const createNotification = async ({ userId, message, type = 'info' }) => {
  if (!userId) return null;
  const notification = await Notification.create({ user: userId, message, type });
  return notification;
};

const getNotificationsForUser = async (userId) => {
  return Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(20);
};

module.exports = { createNotification, getNotificationsForUser };
