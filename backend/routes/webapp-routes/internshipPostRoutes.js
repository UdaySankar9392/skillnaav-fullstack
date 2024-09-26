const express = require("express");
const InternshipPosting = require("../../models/webapp-models/internshipPostModel.js"); // Adjust the path to your model
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
    const internship = await InternshipPosting.findById(req.params.id);

    if (internship) {
      await internship.remove();
      res.json({ message: "Internship removed" });
    } else {
      res.status(404).json({ message: "Internship not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
