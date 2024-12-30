const express = require("express");
const router = express.Router();
const ApplicationController = require("../../controllers/applicationController"); // Correct import
const upload = require('../../utils/multer'); // Correct path to multer

// Apply for an internship
router.post("/apply", upload.single('resume'), ApplicationController.applyForInternship); // Ensure 'resume' matches the field name on the front-end form

// Get all applications for a specific internship
router.get("/internship/:internshipId/applications", ApplicationController.getApplicationsForInternship);

// Get application status for a student
router.get("/student/:studentId/applications", ApplicationController.getApplicationStatus);

module.exports = router;
