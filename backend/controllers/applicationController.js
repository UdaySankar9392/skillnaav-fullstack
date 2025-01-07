const path = require("path"); // Import path module
const multer = require("multer"); // If you're using multer in this file, import it
const Application = require("../models/webapp-models/applicationModel");
const mongoose = require("mongoose");
const Userwebapp = require("../models/webapp-models/userModel");
const InternshipPosting = require("../models/webapp-models/internshipPostModel.js");
const cloudinary = require("../config/cloudinaryConfig"); // Import Cloudinary configuration

// Controller to handle applying for an internship
const applyForInternship = async (req, res) => {
  const { studentId, internshipId } = req.body;
  const resumeFile = req.file;  // Access the file from req.file

  if (!studentId || !internshipId || !resumeFile) {
    return res.status(400).json({ error: "Student ID, Internship ID, and resume are required." });
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(internshipId)) {
      return res.status(400).json({ error: "Invalid student or internship ID." });
    }

    const [student, internship] = await Promise.all([
      Userwebapp.findById(studentId),
      InternshipPosting.findById(internshipId),
    ]);

    if (!student || !internship) {
      return res.status(404).json({ error: "Student or Internship not found." });
    }

    // Validate file type (this is handled by multer already, but you can add extra checks if needed)
    const validFileTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const isValidMimeType = validFileTypes.includes(resumeFile.mimetype);

    if (!isValidMimeType) {
      return res.status(400).json({ error: "Invalid file format. Only .pdf, .doc, and .docx files are allowed." });
    }

    // Upload the file to Cloudinary
    const cloudinaryResult = await cloudinary.uploader.upload(resumeFile.path);  // Assuming resumeFile.path exists

    const newApplication = new Application({
      studentId,
      internshipId,
      resumeUrl: cloudinaryResult.secure_url,  // Save the Cloudinary URL instead of the local file path
      status: "Applied",
      appliedDate: new Date(),
      userName: student.name,
      userEmail: student.email,
      jobTitle: internship.jobTitle,
    });

    await newApplication.save();

    res.status(201).json({
      message: "Application submitted successfully.",
      data: newApplication,
    });
  } catch (error) {
    console.error("Error during application submission:", error);
    if (error instanceof multer.MulterError) {
      return res.status(500).json({ error: "Multer error: " + error.message });
    }
    res.status(500).json({ error: "Internal server error.", details: error.message });
  }
};


// Controller to get all applications for a specific internship
const getApplicationsForInternship = async (req, res) => {
  const { internshipId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(internshipId)) {
    return res.status(400).json({ message: "Invalid internship ID." });
  }

  try {
    const applications = await Application.find({ internshipId });
    if (applications.length === 0) {
      return res.status(404).json({ message: "No applications found for this internship." });
    }

    res.status(200).json({ applications });
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

// Controller to get application status for a student
const getApplicationStatus = async (req, res) => {
  const { studentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    return res.status(400).json({ message: "Invalid student ID." });
  }

  try {
    const applications = await Application.find({ studentId });
    if (applications.length === 0) {
      return res.status(404).json({ message: "No applications found for this student." });
    }

    res.status(200).json({ applications });
  } catch (error) {
    console.error("Error fetching application status:", error);
    res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

module.exports = {
  applyForInternship,
  getApplicationsForInternship,
  getApplicationStatus,
};
