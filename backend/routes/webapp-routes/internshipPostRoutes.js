const express = require("express");
const InternshipPosting = require("../../models/webapp-models/internshipPostModel.js");
const notifyUser = require("../../utils/notifyUser.js");
const router = express.Router();

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
      duration: req.body.duration,
      salaryDetails: req.body.salaryDetails,
      qualifications: req.body.qualifications,
      // currency: req.body.currency,
      // time: req.body.time,
      
      contactInfo: req.body.contactInfo,
      
      imgUrl: req.body.imgUrl,
      studentApplied: req.body.studentApplied || false,
      adminApproved: req.body.adminApproved || false,
      adminReviewed: req.body.adminReviewed || false,
      partnerId: req.body.partnerId,
      deleted: req.body.admindeleted || false 
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

    // Find the internship by ID
    const internship = await InternshipPosting.findById(id);

    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }

    // Mark the internship as deleted (soft delete)
    internship.deleted = true;  // Set the 'deleted' field to true
    await internship.save();  // Save the updated internship document

    res.json({ message: "Internship marked as deleted successfully" });
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

    const deletedInternship = await InternshipPosting.findByIdAndDelete(id);

    if (!deletedInternship) {
      return res.status(404).json({ message: "Internship not found" });
    }

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
// router.get("/:id", async (req, res) => {
//   try {
//     const internship = await InternshipPosting.findById(req.params.id);

//     if (internship) {
//       res.json(internship);
//     } else {
//       res.status(404).json({ message: "Internship not found" });
//     }
//   } catch (error) {
//     res.status(500).json({ message: "Server Error" });
//   }
// });

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

// GET all approved internships (excluding deleted ones)
router.get("/approved", async (req, res) => {
  try {
    const approvedInternships = await InternshipPosting.find({
      adminApproved: true,
      deleted: false, // Exclude soft-deleted internships
    });
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