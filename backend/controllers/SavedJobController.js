const SavedJob = require("../models/webapp-models/SavedJobModel");
const mongoose = require("mongoose");

// ✅ Save a job
const saveJob = async (req, res) => {
  let { userId, jobId } = req.body;

  console.log("Received userId:", userId);
  console.log("Received jobId:", jobId);

  try {
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid userId or jobId format" });
    }

    userId = new mongoose.Types.ObjectId(userId);
    jobId = new mongoose.Types.ObjectId(jobId);

    const existingSavedJob = await SavedJob.findOne({ userId, jobId });
    if (existingSavedJob) {
      return res.status(400).json({ message: "Job already saved" });
    }

    const savedJob = new SavedJob({ userId, jobId });
    await savedJob.save();

    res.status(201).json({ message: "Job saved successfully", savedJob });
  } catch (error) {
    console.error("Error saving job:", error);
    res.status(500).json({ message: "Error saving job", error });
  }
};


// ✅ Get saved jobs for a user (with job details)
const getSavedJobs = async (req, res) => {
  const { userId } = req.params;

  try {
    const savedJobs = await SavedJob.find({ userId }).populate("jobId");
    res.status(200).json(savedJobs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching saved jobs", error });
  }
};

// ✅ Remove saved job
const removeSavedJob = async (req, res) => {
  try {
    const { userId, jobId } = req.params;
    console.log("🔍 DELETE request received:", { userId, jobId });

    // ✅ Ensure IDs are valid MongoDB ObjectIds
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(jobId)) {
      console.log("❌ Invalid ObjectId format", { userId, jobId });
      return res.status(400).json({ message: "Invalid userId or jobId format" });
    }

    const objectUserId = new mongoose.Types.ObjectId(userId);
    const objectJobId = new mongoose.Types.ObjectId(jobId);

    // ✅ Check if the saved job exists
    const savedJob = await SavedJob.findOne({ userId: objectUserId, jobId: objectJobId });

    if (!savedJob) {
      console.log("⚠️ No matching job found:", { jobId });
      return res.status(404).json({ message: "Saved job not found" });
    }

    // ✅ Delete the entry by its `_id`
    await SavedJob.deleteOne({ _id: savedJob._id });

    console.log("✅ Job removed successfully:", savedJob);
    res.status(200).json({ message: "Job removed successfully", deletedJob: savedJob });

  } catch (error) {
    console.error("❌ Error removing job:", error);
    res.status(500).json({ message: "Error removing job", error });
  }
};
module.exports = { saveJob, getSavedJobs, removeSavedJob };
