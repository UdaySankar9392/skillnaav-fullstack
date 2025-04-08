const Application = require("../models/webapp-models/applicationModel"); // Import the Application model
const mongoose = require("mongoose");
const Userwebapp = require("../models/webapp-models/userModel");  // Ensure correct import path
const InternshipPosting = require("../models/webapp-models/internshipPostModel.js"); 
const multer = require("multer"); // Multer for file uploads
const path = require("path");
const fs = require("fs");

const upgradeToPremium = async (req, res) => {
  const { studentId } = req.body;

  try {
    const student = await Userwebapp.findByIdAndUpdate(studentId, { isPremium: true }, { new: true });

    if (!student) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: "User upgraded to premium!", user: student });
  } catch (error) {
    console.error("Error upgrading user:", error.message);
    res.status(500).json({ message: "Error upgrading to premium.", error: error.message });
  }
};

// Controller to handle applying for an internship (using multer for file uploads)
const applyForInternship = async (req, res) => {
  const { studentId, internshipId } = req.body;
  const resumeFile = req.file;

  if (!resumeFile) {
    return res.status(400).json({ message: "Please upload a resume." });
  }

  try {
    // Check if student and internship exist
    const student = await Userwebapp.findById(studentId);
    const internship = await InternshipPosting.findById(internshipId);

    if (!student || !internship) {
      return res.status(404).json({ message: "Student or Internship not found." });
    }

    // Check if user is premium
    if (!student.isPremium) {
      const applicationCount = await Application.countDocuments({ studentId });

      if (applicationCount >= 5) {
        return res.status(403).json({
          message: "You have reached the limit of 5 applications. Upgrade to premium to apply for more jobs.",
          limitReached: true,
        });
      }
    }

    // Check if the student has already applied for this internship
    const existingApplication = await Application.findOne({ studentId, internshipId });

    if (existingApplication) {
      return res.status(400).json({ message: "You have already applied for this internship." });
    }

    // Use resumeFile.location (S3 URL) instead of memory storage
    const resumeUrl = resumeFile.location; 

    // Create a new application
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
      limitReached: false,
    });
  } catch (error) {
    console.error("Error during application submission:", error.message);
    res.status(500).json({
      message: "Error applying for the internship.",
      error: error.message,
    });
  }
};

const getApplicationCount = async (req, res) => {
  try {
    console.log("Request received at /count/:studentId"); // Debugging log
    console.log("Params received:", req.params);

    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    const applicationCount = await Application.countDocuments({ studentId });

    res.status(200).json({ count: applicationCount });
  } catch (error) {
    console.error("Error fetching application count:", error.message);
    res.status(500).json({ message: "Error fetching application count." });
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

// Controller to check if a specific job has been applied by the user
const checkIfApplied = async (req, res) => {
  const { studentId, internshipId } = req.params;

  try {
    // Check if the student has applied for this internship
    const existingApplication = await Application.findOne({
      studentId,
      internshipId,
    });

    if (existingApplication) {
      return res.status(200).json({ isApplied: true });
    } else {
      return res.status(200).json({ isApplied: false });
    }
  } catch (error) {
    console.error("Error checking application status:", error.message);
    res.status(500).json({
      message: "Error checking application status.",
      error: error.message,
    });
  }
};

const getApplicationsCountForInternships = async (req, res) => {
  try {
    const { internshipIds } = req.query;
    
    if (!internshipIds) {
      return res.status(400).json({ message: "Internship IDs are required" });
    }

    // Convert comma-separated string to array and validate IDs
    const idsArray = internshipIds.split(',')
      .map(id => id.trim())
      .filter(id => mongoose.Types.ObjectId.isValid(id));

    if (idsArray.length === 0) {
      return res.status(400).json({ message: "No valid internship IDs provided" });
    }

    const counts = await Application.aggregate([
      {
        $match: {
          internshipId: { $in: idsArray.map(id => new mongoose.Types.ObjectId(id)) }
        }
      },
      {
        $group: {
          _id: "$internshipId",
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert array to object { internshipId: count }
    const countsMap = counts.reduce((acc, curr) => {
      acc[curr._id.toString()] = curr.count;
      return acc;
    }, {});

    res.status(200).json({ counts: countsMap });
  } catch (error) {
    console.error("Error fetching application counts:", error);
    res.status(500).json({ 
      message: "Error fetching application counts",
      error: error.message 
    });
  }
};

module.exports = {
  applyForInternship,
  getApplicationsForInternship,
  getApplicationStatus,
  getApplicationsForStudent,
  checkIfApplied, // Add the new function to exports
  upgradeToPremium,
  getApplicationCount,
  getApplicationsCountForInternships,
};