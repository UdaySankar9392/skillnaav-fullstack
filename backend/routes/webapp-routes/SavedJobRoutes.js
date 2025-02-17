const express = require("express");
const router = express.Router();
const { saveJob, getSavedJobs, removeSavedJob } = require("../../controllers/SavedJobController");

// ✅ Save a job
router.post("/save", saveJob);

// ✅ Get saved jobs for a user
router.get("/getSavedJobs/:userId", getSavedJobs);

// ✅ Remove saved job
router.delete("/remove/:userId/:jobId", removeSavedJob);


module.exports = router;
