const express = require('express');
const router = express.Router();
const {
  updateInternshipSchedule,
  getInternshipSchedule,
} = require('../../controllers/scheduleController');

// Create or update schedule
router.post('/create', updateInternshipSchedule);

// Get schedule using query params: ?internshipId=xxx&partnerId=yyy
router.get('/get-schedule', getInternshipSchedule);

module.exports = router;
