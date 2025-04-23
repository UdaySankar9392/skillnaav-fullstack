const express = require("express");
const InternshipPosting = require("../../models/webapp-models/internshipPostModel.js");
const notifyUser = require("../../utils/notifyUser.js");
const router = express.Router();
const mongoose = require("mongoose");
const Application = require("../../models/webapp-models/applicationModel.js"); // Adjust path if needed
const SavedJob = require("../../models/webapp-models/SavedJobModel.js"); // Adjust path if needed


// GET all internship postings (excluding deleted)
router.get("/", async (req, res) => {
  try {
    // Filter internships to exclude those that are soft-deleted
    const internships = await InternshipPosting.find({ deleted: false });
    res.json(internships);
  } catch (error) {
    res.status(500).json({ message: "Server Error: Unable to fetch internships" });
  }
});


// GET all approved internships (excluding deleted ones) with sorting
router.get("/approved", async (req, res) => {
  try {
    let { isPremium } = req.query;

    console.log("Received request with isPremium:", isPremium);

    const isPremiumUser = isPremium === "true";

    // Fetch only admin-approved internships
    let internships = await InternshipPosting.find({ deleted: false, adminApproved: true }).lean();

    if (!internships.length) {
      return res.json([]);
    }

    console.log("Before sorting:", internships.map(i => ({ title: i.jobTitle, type: i.internshipType })));

    // Define sorting priorities
    const premiumPriority = { PAID: 3, STIPEND: 2, FREE: 1 };
    const nonPremiumPriority = { FREE: 3, STIPEND: 2, PAID: 1 };

    // Normalize internshipType to uppercase
    internships.forEach(internship => {
      internship.internshipType = (internship.internshipType || "FREE").toUpperCase();
    });

    // Apply sorting based on user type
    const priority = isPremiumUser ? premiumPriority : nonPremiumPriority;

    internships.sort((a, b) => {
      return (priority[b.internshipType] || 0) - (priority[a.internshipType] || 0);
    });

    // **Introduce controlled randomness (20% chance per internship to swap)**
    for (let i = internships.length - 1; i > 0; i--) {
      if (Math.random() < 0.2) { // 20% chance to swap
        let j = Math.floor(Math.random() * (i + 1));
        [internships[i], internships[j]] = [internships[j], internships[i]];
      }
    }

    console.log("After sorting & shuffling:", internships.map(i => ({ title: i.jobTitle, type: i.internshipType })));

    res.json(internships);
  } catch (error) {
    console.error("Error fetching approved internships:", error);
    res.status(500).json({
      message: "Error fetching approved internships",
      error: error.message,
    });
  }
});



// POST create a new internship posting
router.post("/", async (req, res) => {
  try {
    const { 
      jobTitle, companyName, location, jobDescription, startDate, 
      endDateOrDuration, duration, internshipType, qualifications, 
      contactInfo, imgUrl, partnerId, compensationDetails 
    } = req.body;

    // Default compensation details based on internshipType
    let finalCompensationDetails = { type: internshipType };

    if (internshipType === "PAID" || internshipType === "STIPEND") {
      finalCompensationDetails.amount = compensationDetails?.amount || 0;
      finalCompensationDetails.currency = compensationDetails?.currency || "USD";
      finalCompensationDetails.frequency = compensationDetails?.frequency || "Monthly";
    } else {
      finalCompensationDetails.amount = 0; // No salary for unpaid
      finalCompensationDetails.currency = null;
      finalCompensationDetails.frequency = null;
    }

    const newInternship = new InternshipPosting({
      jobTitle,
      companyName,
      location,
      jobType: "Internship", // Set default as "Internship"
      jobDescription,
      startDate,
      endDateOrDuration,
      duration,
      internshipType,
      compensationDetails: finalCompensationDetails,
      qualifications,
      contactInfo,
      imgUrl,
      studentApplied: false, // Default value
      adminApproved: false, // Default value
      adminReviewed: false, // Default value
      partnerId,
      deleted: false // Default value
    });

    const createdInternship = await newInternship.save();
    res.status(201).json(createdInternship);
  } catch (error) {
    console.error("Error: ", error);
    res.status(400).json({ message: "Error: Unable to create internship post", error: error.message });
  }
});


// GET all deleted internship postings (soft deleted)
router.get("/bin", async (req, res) => {
  try {
    const deletedInternships = await InternshipPosting.find({ deleted: true });

    if (deletedInternships.length === 0) {
      return res.status(404).json({ message: "No deleted internships found" });
    }

    res.json(deletedInternships);
  } catch (error) {
    console.error("Error fetching deleted internships:", error);
    res.status(500).json({
      message: "Server Error: Unable to fetch deleted internships",
      error: error.message,
    });
  }
});


// Soft delete an internship posting by ID (mark as deleted)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid internship ID" });
    }

    const internship = await InternshipPosting.findById(id);

    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }

    internship.deleted = true;
    await internship.save();

    await Application.updateMany({ internshipId: id }, { deleted: true });
    // Remove saved job references from SavedJobs schema
    await SavedJob.deleteMany({ jobId: id });

    res.json({ message: "Internship and applications soft deleted" });
  } catch (error) {
    console.error("Error during deletion:", error);
    res.status(500).json({
      message: "Server Error: Unable to delete the internship",
      error: error.message,
    });
  }
});

// Restore an internship by setting 'deleted' to false
router.patch("/:id/restore", async (req, res) => {
  const { id } = req.params;

  try {
    // Find the internship by ID
    const internship = await InternshipPosting.findById(id);

    // Check if the internship exists
    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }

    // Set 'deleted' to false (restore the internship)
    internship.deleted = false;

    // Save the updated internship document
    await internship.save();

    // Return the restored internship
    res.status(200).json({
      message: "Internship restored successfully",
      internship,
    });
  } catch (error) {
    console.error("Error restoring internship:", error);
    res.status(500).json({
      message: "Server Error: Unable to restore internship",
      error: error.message,
    });
  }
});

// Permanently delete an internship posting by ID
router.delete("/:id/permanent", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid internship ID" });
    }

    const internship = await InternshipPosting.findById(id);
    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }

    // Delete applications first
    await Application.deleteMany({ internshipId: id });

    // Then delete the internship
    await InternshipPosting.deleteOne({ _id: id });

    // Delete all related saved job entries
    await SavedJob.deleteMany({ jobId: id });

    res.json({ message: "Internship permanently deleted" });
  } catch (error) {
    console.error("Error during permanent deletion:", error);
    res.status(500).json({
      message: "Server Error: Unable to permanently delete the internship",
      error: error.message,
    });
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



router.get("/partner/:partnerId", async (req, res) => {
  try {
    const { partnerId } = req.params;
    const internships = await InternshipPosting.find({ partnerId });

    if (internships.length > 0) {
      res.json(internships);
    } else {
      res.status(404).json({ message: "No internships found for this partner ID" });
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
    // jobType,
    jobDescription,
    startDate,
    endDateOrDuration,
    duration,
    salaryDetails,
    qualifications,
    // currency, 
    // time ,
    contactInfo,
    
    imgUrl,
    studentApplied,
    adminApproved,
    partnerId,
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
        // ...(jobType && { jobType }),
        ...(jobDescription && { jobDescription }),
        ...(startDate && { startDate }),
        ...(endDateOrDuration && { endDateOrDuration }),
        ...(duration && { duration }),
        ...(salaryDetails && { salaryDetails }),
        ...(qualifications && { qualifications }),
        // ...(currency && { currency }), 
        // ...(time && { time }),
        ...(contactInfo && { contactInfo }),
        
       
        ...(imgUrl && { imgUrl }),
        ...(studentApplied !== undefined && { studentApplied }),
        ...(adminApproved !== undefined && { adminApproved }),
        ...(partnerId && { partnerId }), 
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



router.post("/:id/review", async (req, res) => {
  try {
    const internship = await InternshipPosting.findById(req.params.id);
    if (!internship) {
      return res.status(404).json({ message: "Internship not found." });
    }

    // Mark as reviewed
    internship.isAdminReviewed = true; 

    await internship.save();

    res.status(200).json({
      message: "Internship marked as reviewed.",
      isAdminReviewed: internship.isAdminReviewed,
    });
  } catch (error) {
    console.error("Error updating internship:", error);
    res.status(500).json({ message: "Server error: Unable to update internship.", error: error.message });
  }
});

module.exports = router;