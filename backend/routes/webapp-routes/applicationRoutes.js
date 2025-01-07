const express = require("express");
const router = express.Router();
const applicationController = require("../../controllers/applicationController");
const upload = require("../../utils/multer");

// Route to apply for an internship
router.post("/apply", upload.single("resume"), applicationController.applyForInternship);

// Route to get all students who applied for a specific internship
router.get("/internship/:internshipId", applicationController.getApplicationsForInternship);

// Route to get application status for a specific student
router.get("/student/:studentId/application-status", applicationController.getApplicationStatus);

module.exports = router;
