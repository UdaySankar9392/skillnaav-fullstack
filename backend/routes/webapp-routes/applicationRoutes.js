const express = require("express");
const router = express.Router();
const applicationController = require("../../controllers/applicationController");
const upload = require("../../utils/multer"); // Multer middleware for file uploads

// Route to apply for an internship
// Note: Make sure to use the upload middleware to handle file uploads
router.post("/apply", upload.single('resume'), (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      message: "No file uploaded, please upload a resume.",
    });
  }
  // Proceed with the controller logic if file is uploaded
  applicationController.applyForInternship(req, res);
});

// Route to get all students who applied for a specific internship
router.get("/internship/:internshipId", applicationController.getApplicationsForInternship);

// Route to get application status for a specific student
router.get("/student/:studentId/application-status", applicationController.getApplicationStatus);

module.exports = router;
