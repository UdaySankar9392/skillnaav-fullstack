const express = require("express");
<<<<<<< HEAD
const Application = require("../../models/webapp-models/applicationModal");
const router = express.Router();

// POST route to create a new application
router.post("/", async (req, res) => {
  try {
    // Check for an existing application for the same job title and user's email
    const existingApplication = await Application.findOne({
      jobTitle: req.body.jobTitle,
      "contactInfo.email": req.body.contactInfo.email, // Ensuring the contactInfo.email is unique to users
    });

    if (existingApplication) {
      return res.status(409).json({
        message: "Application already submitted for this job.",
      });
    }

    // If no existing application, proceed to save the new application
    const applicationData = {
      ...req.body,
      isApplied: true, // Set the job as applied
    };

    const application = new Application(applicationData);
    await application.save();

    return res.status(201).json({
      message: "Application submitted successfully.",
      application,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Error submitting application.",
      error: error.message,
    });
  }
});

// GET route to fetch all applications (for admin review)
router.get("/", async (req, res) => {
  try {
    const applications = await Application.find();
    return res.json(applications);
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching applications.",
      error: error.message,
    });
  }
});

// PATCH route to update application status (approve or reject)
router.patch("/:id", async (req, res) => {
  try {
    const applicationId = req.params.id;
    const { status } = req.body; // The status will be 'approved' or 'rejected'

    // Validate status input
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    // Find the application by ID and update the status
    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      { status: status },
      { new: true }
    );

    if (!updatedApplication) {
      return res.status(404).json({ message: "Application not found." });
    }

    return res.status(200).json({
      message: `Application ${status} successfully.`,
      updatedApplication,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating application status.",
      error: error.message,
    });
  }
});

// DELETE route to remove an application by ID
router.delete("/:id", async (req, res) => {
  try {
    const applicationId = req.params.id;

    // Find the application by ID and remove it
    const deletedApplication = await Application.findByIdAndDelete(
      applicationId
    );

    if (!deletedApplication) {
      return res.status(404).json({
        message: "Application not found.",
      });
    }

    return res.status(200).json({
      message: "Application deleted successfully.",
      deletedApplication,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error deleting application.",
      error: error.message,
    });
  }
});
=======
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
>>>>>>> uday8-1-25

module.exports = router;
