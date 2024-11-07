const mongoose = require("mongoose");

const internshipPostingSchema = mongoose.Schema(
  {
    jobTitle: { type: String, required: true },
    companyName: { type: String, required: true },
    location: { type: String, required: true },
    jobType: { type: String, required: true },
    jobDescription: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDateOrDuration: { type: String, required: true },
    salaryDetails: { type: String ,  required: true},
    duration: {type: String, required: true },
    qualifications: { type: [String], required: true },
    // currency: { type: String, required: true }, 
    // time: { type: String, required: true },  
    
    contactInfo: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    imgUrl: { type: String, required: true },
    studentApplied: { type: Boolean, default: false }, 
    adminApproved: { type: Boolean, default: false }, 
  },
  { timestamps: true }
);

const InternshipPosting = mongoose.model(
  "InternshipPosting",
  internshipPostingSchema
);

module.exports = InternshipPosting;
