// models/webapp-models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  title: String,
  message: String,
  link: String, // could be offer letter, etc.
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
    deletedAt: { type: Date, default: null } ,
});

module.exports = mongoose.model('Notification', notificationSchema);
