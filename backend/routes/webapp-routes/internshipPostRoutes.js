const express = require("express");
const InternshipPosting = require("../../models/webapp-models/internshipPostModel.js");
const notifyUser = require("../../utils/notifyUser.js");
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
      // preferredExperience: req.body.preferredExperience,
      // applicationDeadline: req.body.applicationDeadline,
      // applicationProcess: req.body.applicationProcess,
      contactInfo: req.body.contactInfo,
      // applicationLinkOrEmail: req.body.applicationLinkOrEmail,
      imgUrl: req.body.imgUrl,
      studentApplied: req.body.studentApplied || false,
      adminApproved: req.body.adminApproved || false,
      adminReviewed: req.body.adminReviewed || false,
    });

    const createdInternship = await newInternship.save();
    res.status(201).json(createdInternship);
  } catch (error) {
    console.error("Error: ", error);
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
    // preferredExperience,
    // workingHours,
    // applicationDeadline,
    // applicationProcess,
    // companyWebsite,
    contactInfo,
    // internshipBenefits,
    // department,
    // applicationLinkOrEmail,
    // workAuthorization,
    // skillsToBeDeveloped,
    // numberOfOpenings,
    imgUrl,
    studentApplied,
    adminApproved,
  } = req.body;

  try {
    // Use findByIdAndUpdate for better efficiency and only update fields that are provided in the request
    const updatedInternship = await InternshipPosting.findByIdAndUpdate(
      req.params.id,
      {
        // Only update fields that are present in the request
        ...(jobTitle && { jobTitle }),
        ...(companyName && { companyName }),
        ...(location && { location }),
        ...(jobType && { jobType }),
        ...(jobDescription && { jobDescription }),
        ...(startDate && { startDate }),
        ...(endDateOrDuration && { endDateOrDuration }),
        ...(stipendOrSalary && { stipendOrSalary }),
        ...(qualifications && { qualifications }),
        // ...(preferredExperience && { preferredExperience }),
        // ...(workingHours && { workingHours }),
        // ...(applicationDeadline && { applicationDeadline }),
        // ...(applicationProcess && { applicationProcess }),
        // ...(companyWebsite && { companyWebsite }),
        ...(contactInfo && { contactInfo }),
        // ...(internshipBenefits && { internshipBenefits }),
        // ...(department && { department }),
        // ...(applicationLinkOrEmail && { applicationLinkOrEmail }),
        // ...(workAuthorization && { workAuthorization }),
        // ...(skillsToBeDeveloped && { skillsToBeDeveloped }),
        // ...(numberOfOpenings && { numberOfOpenings }),
        ...(imgUrl && { imgUrl }),
        ...(studentApplied !== undefined && { studentApplied }),
        ...(adminApproved !== undefined && { adminApproved }),
      },
      { new: true } // Return the updated document
    );

    // Check if internship was found and updated
    if (updatedInternship) {
      res.json(updatedInternship);
    } else {
      res.status(404).json({ message: "Internship not found" });
    }
  } catch (error) {
    console.error("Error updating internship:", error.message);
    res.status(500).json({
      message: "Error: Unable to update internship post",
      error: error.message,
    });
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

/// Approve an internship posting by ID
router.patch("/:id/approve", async (req, res) => {
  try {
    const internship = await InternshipPosting.findById(req.params.id);

    if (internship) {
      internship.adminApproved = true; // Mark as approved
      await internship.save(); // Save changes

      // Prepare and send email to the partner
      const emailContent = `
        Congratulations! Your internship posting "${internship.jobTitle}" has been approved!
        Company: ${internship.companyName}
        Location: ${internship.location}
        Description: ${internship.jobDescription}
        Start Date: ${internship.startDate}
        End Date/Duration: ${internship.endDateOrDuration}
      `;
      try {
        console.log(`Sending email to: ${internship.contactInfo.email}`);
        await notifyUser(internship.contactInfo.email, "Internship Approved", emailContent);
      } catch (emailError) {
        console.error("Failed to send approval email:", emailError);
      }
      

      res.json({ message: "Internship approved successfully", internship });
    } else {
      res.status(404).json({ message: "Internship not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error: Unable to approve internship", error: error.message });
  }
});

// Reject an internship posting by ID
router.patch("/:id/reject", async (req, res) => {
  try {
    const internship = await InternshipPosting.findById(req.params.id);

    if (internship) {
      internship.adminApproved = false; // Mark as rejected
      await internship.save(); // Save changes

      // Prepare and send rejection email to the partner
      const emailContent = `
        We regret to inform you that your internship posting "${internship.jobTitle}" has been rejected.
        Reason: ${req.body.reason || "No specific reason provided."}
        Company: ${internship.companyName}
        Location: ${internship.location}
      `;
      try {
        await notifyUser(internship.contactInfo.email, "Internship Rejected", emailContent);
      } catch (emailError) {
        console.error("Failed to send rejection email:", emailError);
      }

      res.json({ message: "Internship rejected successfully", internship });
    } else {
      res.status(404).json({ message: "Internship not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error: Unable to reject internship", error: error.message });
  }
});

// Get all approved internships
router.get("/approved", async (req, res) => {
  try {
    const approvedInternships = await InternshipPosting.find({ adminApproved: true });
    res.json(approvedInternships);
  } catch (error) {
    console.error("Error fetching approved internships:", error);
    res.status(500).json({
      message: "Error fetching approved internships",
      error: error.message,
    });
  }
});


router.post("/:id/review", async (req, res) => {
  const { reviewText } = req.body;

  if (!reviewText) {
    return res.status(400).json({ message: "All fields are required for a review" });
  }

  try {
    const internship = await InternshipPosting.findById(req.params.id);
    console.log("ID being used:", req.params.id);


    if (internship) { 
      if (!internship.reviews) {
      internship.reviews = []; // Initialize if undefined
    }
      // Add the review to the internship
      internship.reviews.push({ reviewText });
      internship.isAdminReviewed = true; // Mark as reviewed
      internship.adminReviewText = reviewText; // Store admin feedback
      await internship.save();

      // Prepare email content
      const emailContent = `
        A new review has been posted for your internship listing "${internship.jobTitle}"!

        Admin Review: "${reviewText}"
      `;

      // Send email
      try {
        console.log(`Sending email to: ${internship.contactInfo.email}`);
        await notifyUser(internship.contactInfo.email, "New Internship Review Received", emailContent);
      } catch (emailError) {
        console.error("Failed to send review email:", emailError);
      }

      res.status(201).json({
        message: "Review added successfully, marked as reviewed, and email sent",
        review: internship.reviews[internship.reviews.length - 1],
        isAdminReviewed: internship.isAdminReviewed,
        adminReviewText: internship.adminReviewText,
      });
    } else {
      res.status(404).json({ message: "Internship not found" });
    }
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ message: "Server Error: Unable to add review", error: error.message });
  }
});

module.exports = router;