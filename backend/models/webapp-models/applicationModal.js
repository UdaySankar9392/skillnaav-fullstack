const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema(
  {
    jobTitle: { type: String, required: true },
    companyName: { type: String, required: true },
    location: { type: String, required: true },
    jobType: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDateOrDuration: { type: String, required: true },
    stipendOrSalary: { type: String, required: true },
    jobDescription: { type: String, required: true },
    qualifications: { type: [String], required: true },
    imgUrl: { type: String },
    contactInfo: {
      name: { type: String },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    isApplied: { type: Boolean, default: false }, 
  },
  { timestamps: true }
);

const Application = mongoose.model("Application", ApplicationSchema);
module.exports = Application;
