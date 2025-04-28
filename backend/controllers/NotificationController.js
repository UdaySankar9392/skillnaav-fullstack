const Notification = require("../models/webapp-models/NotificationModel");
const sendNotification = require("../utils/Notification");

// 💡 You already use sendNotification in other controllers like offerLetterController.js
// Now we use it here too

// 👉 Fetch all notifications for a student
const getNotificationsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const notifications = await Notification.find({ studentId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications"
    });
  }
};

// 👉 Mark a notification as read
// 👉 Mark a notification as read
const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true }, // ✅ Use the correct field from schema
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({
      success: true,
      notification
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read"
    });
  }
};


module.exports = {
  sendNotification,
  getNotificationsByStudent,
  markNotificationAsRead
};
