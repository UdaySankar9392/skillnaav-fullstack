const express = require("express");
const InternshipPosting = require("../../models/webapp-models/internshipPostModel.js");
const router = express.Router();

// GET all internship postings
router.get("/", async (req, res) => {
  try {
    const internships = await InternshipPosting.find({});
    res.json(internships);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server Error: Unable to fetch internships" });
  }
});

// POST create a new internship posting
router.post("/", async (req, res) => {
  try {
    console.log(req.body); // Log the incoming request data

    const newInternship = new InternshipPosting({
      jobTitle: req.body.jobTitle,
      companyName: req.body.companyName,
      location: req.body.location,
      jobType: req.body.jobType,
      jobDescription: req.body.jobDescription,
      startDate: req.body.startDate,
      endDateOrDuration: req.body.endDateOrDuration,
      stipendOrSalary: req.body.stipendOrSalary,
      qualifications: req.body.qualifications,
      preferredExperience: req.body.preferredExperience,
      applicationDeadline: req.body.applicationDeadline,
      applicationProcess: req.body.applicationProcess,
      contactInfo: req.body.contactInfo,
      applicationLinkOrEmail: req.body.applicationLinkOrEmail,
      imgUrl: req.body.imgUrl,
    });

    const createdInternship = await newInternship.save();
    res.status(201).json(createdInternship);
  } catch (error) {
    console.error("Error: ", error); // Log the actual error
    res
      .status(400)
      .json({ message: "Error: Unable to create internship post" });
  }
});

// GET a single internship posting by ID
router.get("/:id", async (req, res) => {
  try {
    const internship = await InternshipPosting.findById(req.params.id);

    if (internship) {
      res.json(internship);
    } else {
      res.status(404).json({ message: "Internship not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// PUT update an internship posting by ID
router.put("/:id", async (req, res) => {
  const {
    jobTitle,
    companyName,
    location,
    jobType,
    jobDescription,
    startDate,
    endDateOrDuration,
    stipendOrSalary,
    qualifications,
    preferredExperience,
    workingHours,
    applicationDeadline,
    applicationProcess,
    companyWebsite,
    contactInfo,
    internshipBenefits,
    department,
    applicationLinkOrEmail,
    workAuthorization,
    skillsToBeDeveloped,
    numberOfOpenings,
    imgUrl,
  } = req.body;

  try {
    const internship = await InternshipPosting.findById(req.params.id);

    if (internship) {
      internship.jobTitle = jobTitle;
      internship.companyName = companyName;
      internship.location = location;
      internship.jobType = jobType;
      internship.jobDescription = jobDescription;
      internship.startDate = startDate;
      internship.endDateOrDuration = endDateOrDuration;
      internship.stipendOrSalary = stipendOrSalary;
      internship.qualifications = qualifications;
      internship.preferredExperience = preferredExperience;
      internship.workingHours = workingHours;
      internship.applicationDeadline = applicationDeadline;
      internship.applicationProcess = applicationProcess;
      internship.companyWebsite = companyWebsite;
      internship.contactInfo = contactInfo;
      internship.internshipBenefits = internshipBenefits;
      internship.department = department;
      internship.applicationLinkOrEmail = applicationLinkOrEmail;
      internship.workAuthorization = workAuthorization;
      internship.skillsToBeDeveloped = skillsToBeDeveloped;
      internship.numberOfOpenings = numberOfOpenings;
      internship.imgUrl = imgUrl;

      const updatedInternship = await internship.save();
      res.json(updatedInternship);
    } else {
      res.status(404).json({ message: "Internship not found" });
    }
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error: Unable to update internship post" });
  }
});

// DELETE an internship posting by ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Log the ID to verify
    console.log("ID to delete:", id);

    // Find and delete the internship in one step
    const deletedInternship = await InternshipPosting.findByIdAndDelete(id);

    if (!deletedInternship) {
      return res.status(404).json({ message: "Internship not found" });
    }

    res.json({ message: "Internship deleted successfully" });
  } catch (error) {
    console.error("Error during deletion:", error); // Log the actual error
    res.status(500).json({
      message: "Server Error: Unable to delete the internship",
      error: error.message,
    });
  }
});

// POST approve an internship posting by ID
router.patch("/:id/approve", async (req, res) => {
  try {
    const internship = await InternshipPosting.findById(req.params.id);

    if (internship) {
      internship.isApproved = true; // Mark as approved
      await internship.save(); // Save changes
      res.json({ message: "Internship approved successfully", internship });
    } else {
      res.status(404).json({ message: "Internship not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server Error: Unable to approve internship" });
  }
});

// POST reject an internship posting by ID
router.patch("/:id/reject", async (req, res) => {
  try {
    const internship = await InternshipPosting.findById(req.params.id);

    if (internship) {
      internship.isApproved = false; // Mark as rejected
      await internship.save(); // Save changes
      res.json({ message: "Internship rejected successfully", internship });
    } else {
      res.status(404).json({ message: "Internship not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server Error: Unable to reject internship" });
  }
});

// GET approved internships
router.get("/approved", async (req, res) => {
  try {
    const approvedInternships = await InternshipPosting.find({
      isApproved: true,
    });
    res.json(approvedInternships);
  } catch (error) {
    console.error("Error fetching approved internships:", error); // Log the error
    res.status(500).json({
      message: "Error fetching approved internships",
      error: error.message,
    });
  }
});

module.exports = router;
