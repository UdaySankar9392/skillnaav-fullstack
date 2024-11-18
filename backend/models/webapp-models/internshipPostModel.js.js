const mongoose = require("mongoose");

const internshipPostingSchema = mongoose.Schema(
  {
    jobTitle: { type: String, required: true },
    companyName: { type: String, required: true },
    location: { type: String, required: true },
    jobDescription: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDateOrDuration: { type: String, required: true },
    salaryDetails: { type: String, required: true },
    duration: { type: String, required: true },
    qualifications: { type: [String], required: true },
    contactInfo: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    imgUrl: { type: String, required: true },
    studentApplied: { type: Boolean, default: false },
    adminApproved: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false }, // Field for soft delete
    
    // // Add a 'chat' field for messaging
    // chat: [
    //   {
    //     senderId: { type: String, required: true }, // ID of the sender (e.g., admin or partner)
    //     text: { type: String, required: true }, // Message content
    //     timestamp: { type: Date, default: Date.now }, // Timestamp for the message
    //   },
    // ],
  },
  { timestamps: true }
);

const InternshipPosting = mongoose.model(
  "InternshipPosting",
  internshipPostingSchema
);

module.exports = InternshipPosting;
