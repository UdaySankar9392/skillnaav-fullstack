const Notification = require("../models/webapp-models/NotificationModel");
const sendNotification = require("../utils/Notification");
const mongoose = require("mongoose");

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

// 👉 Delete a notification by ID


const deleteNotification = async (req, res) => {
  const { notificationId } = req.params;

  // Validate the ObjectId format
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid notification ID",
    });
  }

  try {
    // Find and delete the notification by ID
    const deletedNotification = await Notification.findByIdAndDelete(notificationId);

    if (!deletedNotification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete notification",
    });
  }
};



module.exports = {
  sendNotification,
  getNotificationsByStudent,
  markNotificationAsRead,
  deleteNotification
};
