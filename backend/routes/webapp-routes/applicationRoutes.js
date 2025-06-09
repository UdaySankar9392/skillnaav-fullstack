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
  checkIfApplied,
  upgradeToPremium,
  getApplicationCount, // Add the new function
} = applicationController;

router.post("/upgrade-to-premium", upgradeToPremium);

router.get("/count/:studentId", getApplicationCount);

// Route to apply for an internship
router.post("/apply", resumeUpload.single("resume"), applyForInternship);


// Route to get all applications for a specific internship
router.get("/internship/:internshipId", getApplicationsForInternship);

// Route to get application status for a specific student
router.get("/student/:studentId/application-status", getApplicationStatus);

// Route to get applied jobs with internship details for a specific student
router.get("/student/:studentId/applications", getApplicationsForStudent);

// Route to check if a specific job has been applied by the user
router.get("/check-applied/:studentId/:internshipId", checkIfApplied);

router.get('/counts', applicationController.getApplicationsCountForInternships);



module.exports = router;