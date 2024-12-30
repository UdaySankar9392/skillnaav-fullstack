const Application = require("../models/webapp-models/applicationModel"); // Import the Application model

// Controller to handle applying for an internship
const applyForInternship = async (req, res) => {
  const { studentId, internshipId } = req.body;
  const resumeFile = req.file; // This will contain file info after multer processes it

  if (!resumeFile) {
    return res.status(400).json({
      message: "Please upload a resume.",
    });
  }

  try {
    // Create a URL for the file to be stored in the database
    const resumeUrl = `/uploads/${resumeFile.filename}`; // Generate the file URL for storage

    // Create a new application document with the studentId, internshipId, and resume URL
    const newApplication = new Application({
      studentId,
      internshipId,
      resumeUrl, // Store the file URL in the database
    });

    // Save the application in the database
    await newApplication.save();

    res.status(201).json({
      message: "Application submitted successfully!",
      application: newApplication, // Include the new application data
    });
  } catch (error) {
    console.error(error);
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
    // Find all applications for the given internship
    const applications = await Application.find({ internshipId })
      .populate("studentId", "name email") // Populate student info (name, email)
      .populate("internshipId", "jobTitle companyName"); // Populate internship details (job title, company name)

    res.status(200).json({
      applications,
    });
  } catch (error) {
    console.error(error);
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
    console.error(error);
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
