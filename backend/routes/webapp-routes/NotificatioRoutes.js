// routes/notificationRoutes.js
const express = require("express");
const router = express.Router();
const {
  getNotificationsByStudent,
  markNotificationAsRead,
  deleteNotification,
} = require("../../controllers/NotificationController");

// 🔁 Get all notifications for a student
router.get("/:studentId", getNotificationsByStudent);

// ✅ Mark one notification as read
router.put("/read/:notificationId", markNotificationAsRead);
 router.delete("/:notificationId", deleteNotification);

module.exports = router;
