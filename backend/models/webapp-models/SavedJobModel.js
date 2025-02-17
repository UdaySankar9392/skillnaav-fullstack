const mongoose = require("mongoose");

const savedJobSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Userwebapp",
    required: true,
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InternshipPosting",
    required: true,
  },
}, { timestamps: true });

const SavedJob = mongoose.model("SavedJob", savedJobSchema);

module.exports = SavedJob;
