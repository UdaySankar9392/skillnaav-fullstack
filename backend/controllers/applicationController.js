const Application = require("../models/webapp-models/applicationModel"); // Import the Application model
const mongoose = require("mongoose");
const Userwebapp = require("../models/webapp-models/userModel");  // Ensure correct import path
const InternshipPosting = require("../models/webapp-models/internshipPostModel.js"); 
const multer = require("multer"); // Multer for file uploads
const path = require("path");
const fs = require("fs");



// Controller to handle applying for an internship (using multer for file uploads)
const applyForInternship = (req, res) => {
  const { studentId, internshipId } = req.body;
  const resumeFile = req.file; // This will contain file info after multer processes it

  if (!resumeFile) {
    return res.status(400).json({
      message: "Please upload a resume.",
    });
  }

  try {
    // Construct the file path to store in the database
    const resumePath = path.join(__dirname, "..", "uploads", resumeFile.filename);

    // Create a new application document with the studentId, internshipId, resume path, and application date
    const newApplication = new Application({
      studentId,
      internshipId,
      resumeUrl: resumePath, // Store the local file path in the database
      status: "Applied", // Default status when applied
      appliedDate: new Date(), // Store the application date
    });

    // Save the application in the database
    newApplication.save()
      .then(() => {
        res.status(201).json({
          message: "Application submitted successfully!",
          application: newApplication, // Include the new application data
        });
      })
      .catch((error) => {
        console.error("Error saving application:", error.message);
        res.status(500).json({
          message: "Error applying for the internship.",
          error: error.message, // Provide error details for debugging
        });
      });
  } catch (error) {
    console.error("Error during application submission:", error.message);
    res.status(500).json({
      message: "Error applying for the internship.",
      error: error.message, // Provide error details for debugging
    });
  }
};

// Controller to get all students who applied for a specific internship
const getApplicationsForInternship = async (req, res) => {
  const { internshipId } = req.params;

  try {
    // Validate internshipId
    if (!mongoose.Types.ObjectId.isValid(internshipId)) {
      return res.status(400).json({ message: "Invalid internship ID." });
    }

    // Fetch applications and populate references
    const applications = await Application.find({ internshipId })
      .populate("studentId", "name email") // Populate student details
      .populate("internshipId", "jobTitle companyName") // Populate internship details
      .exec();

    // Check if applications exist
    if (!applications || applications.length === 0) {
      return res.status(404).json({ message: "No applications found for this internship." });
    }

    // Send success response
    res.status(200).json({ applications });
  } catch (error) {
    console.error("Error fetching applications:", error.message); // Log detailed error
    res.status(500).json({
      message: "Error fetching applications.",
      error: error.message,
    });
  }
};;


// Controller to get application status for a student
const getApplicationStatus = async (req, res) => {
  const { studentId } = req.params;

  try {
    // Find all applications for the student
    const applications = await Application.find({ studentId });

    if (!applications || applications.length === 0) {
      return res.status(404).json({
        message: "No applications found for this student.",
      });
    }

    res.status(200).json({
      applications,
    });
  } catch (error) {
    console.error("Error fetching application status:", error.message);
    res.status(500).json({
      message: "Error fetching application status.",
      error: error.message,
    });
  }
};

module.exports = {
  applyForInternship,
  getApplicationsForInternship,
  getApplicationStatus, 
};
