const Application = require("../models/webapp-models/applicationModel"); // Import the Application model
const mongoose = require("mongoose");
const Userwebapp = require("../models/webapp-models/userModel");  // Ensure correct import path
const InternshipPosting = require("../models/webapp-models/internshipPostModel.js"); 
const multer = require("multer"); // Multer for file uploads
const path = require("path");
const fs = require("fs");

// Controller to handle applying for an internship (using multer for file uploads)
const applyForInternship = async (req, res) => {
  const { studentId, internshipId } = req.body;
  const resumeFile = req.file;

  if (!resumeFile) {
    return res.status(400).json({
      message: "Please upload a resume.",
    });
  }

  try {
    const student = await Userwebapp.findById(studentId);
    const internship = await InternshipPosting.findById(internshipId);

    if (!student || !internship) {
      return res.status(404).json({
        message: "Student or Internship not found.",
      });
    }

    const resumeUrl = resumeFile.location; // S3 file URL

    const newApplication = new Application({
      studentId,
      internshipId,
      resumeUrl,
      status: "Applied",
      appliedDate: new Date(),
      userName: student.name,
      userEmail: student.email,
      jobTitle: internship.jobTitle,
    });

    await newApplication.save();

    res.status(201).json({
      message: "Application submitted successfully!",
      application: newApplication,
    });
  } catch (error) {
    console.error("Error during application submission:", error.message);
    res.status(500).json({
      message: "Error applying for the internship.",
      error: error.message,
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

    // Fetch applications without populating the references
    const applications = await Application.find({ internshipId });

    // Check if applications exist
    if (!applications || applications.length === 0) {
      return res.status(404).json({ message: "No applications found for this internship." });
    }

    // Send success response with the applications data
    res.status(200).json({ applications });
  } catch (error) {
    console.error("Error fetching applications:", error.message); // Log detailed error
    res.status(500).json({
      message: "Error fetching applications.",
      error: error.message,
    });
  }
};

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

const getApplicationsForStudent = async (req, res) => {
  try {
    const applications = await Application.find({ studentId: req.params.studentId })
      .populate('internshipId')  // Populate internship details
      .populate('studentId', 'userName userEmail');  // Populate user details

    res.json({ applications });
  } catch (err) {
    console.error("Error fetching applications:", err);
    res.status(500).json({ message: "Error fetching applications" });
  }
};


module.exports = {
  applyForInternship,
  getApplicationsForInternship,
  getApplicationStatus, 
  getApplicationsForStudent,
};
