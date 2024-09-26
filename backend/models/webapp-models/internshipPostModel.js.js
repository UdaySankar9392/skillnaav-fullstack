const mongoose = require("mongoose");

const internshipPostingSchema = mongoose.Schema(
  {
    jobTitle: { type: String, required: true },
    isApproved: {
      type: Boolean,
      default: false,
    },
    companyName: { type: String, required: true },
    location: { type: String, required: true },
    jobType: { type: String, required: true },
    jobDescription: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDateOrDuration: { type: String, required: true },
    stipendOrSalary: { type: String },
    qualifications: { type: [String], required: true },
    preferredExperience: { type: String },
    applicationDeadline: { type: Date, required: true },
    applicationProcess: { type: String, required: true },
    contactInfo: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    applicationLinkOrEmail: { type: String, required: true },
  },
  { timestamps: true }
);

const InternshipPosting = mongoose.model(
  "InternshipPosting",
  internshipPostingSchema
);

module.exports = InternshipPosting;
