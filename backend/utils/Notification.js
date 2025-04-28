const Notification = require('../models/webapp-models/NotificationModel');

const sendNotification = async ({ studentId, title, message, link = null }) => {
  if (!studentId || !title || !message) {
    throw new Error('Missing required fields for notification');
  }

  const notification = new Notification({
    studentId,
    title,
    message,
    link,       // ✅ Add offer letter link (optional)
    read: false
  });

  await notification.save();
  return notification;
};

module.exports = sendNotification;
