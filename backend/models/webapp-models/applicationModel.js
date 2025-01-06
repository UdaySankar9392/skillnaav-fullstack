const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Userwebapp", required: true }, // Update the reference to Userwebapp
  internshipId: { type: mongoose.Schema.Types.ObjectId, ref: "InternshipPostings", required: true },
  resumeUrl: { type: String, required: true },
  status: { type: String, enum: ["Applied", "Under Review", "Accepted", "Rejected"], default: "Applied" },
  appliedDate: { type: Date, default: Date.now },
});

const Application = mongoose.model("Application", applicationSchema);

module.exports = Application;
