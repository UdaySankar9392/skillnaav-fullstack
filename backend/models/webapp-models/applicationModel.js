const mongoose = require("mongoose");

const applicationSchema = mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    internshipId: { type: mongoose.Schema.Types.ObjectId, ref: "InternshipPosting", required: true },
    resumeUrl: { type: String, required: true },
    applicationStatus: { type: String, default: "pending" }, // e.g., pending, approved, rejected
    applicationDate: { type: Date, default: Date.now }, // When the student applied
    notes: { type: String }, // Optional field for admin or partner notes
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

const Application = mongoose.model("Application", applicationSchema);

module.exports = Application;
