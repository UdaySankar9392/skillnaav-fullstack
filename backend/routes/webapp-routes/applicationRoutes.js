const express = require("express");
const router = express.Router();
const applicationController = require("../../controllers/applicationController");
const { resumeUpload } = require("../../utils/multer"); // Multer middleware for file uploads

// Destructure the required function from applicationController
const {
  applyForInternship,
  getApplicationsForInternship,
  getApplicationStatus,
  getApplicationsForStudent,
  checkIfApplied, // Add the new function
} = applicationController;

// Route to apply for an internship
router.post("/apply", resumeUpload.single("resume"), (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      message: "No file uploaded, please upload a resume.",
    });
  }
  // Proceed with the controller logic if file is uploaded
  applyForInternship(req, res);
});

// Route to get all applications for a specific internship
router.get("/internship/:internshipId", getApplicationsForInternship);

// Route to get application status for a specific student
router.get("/student/:studentId/application-status", getApplicationStatus);

// Route to get applied jobs with internship details for a specific student
router.get("/student/:studentId/applications", getApplicationsForStudent);

// Route to check if a specific job has been applied by the user
router.get("/check-applied/:studentId/:internshipId", checkIfApplied);

module.exports = router;