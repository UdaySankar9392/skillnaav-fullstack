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
    imgUrl: { type: String, default: "https://default-image-url.com/image.png" },
    studentApplied: { type: Boolean, default: false },
    adminApproved: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
    // partnerId: { type: mongoose.Schema.Types.ObjectId, ref: "partnererwebapps"}, // Partner reference
    // Chat or messaging (commented for now)
    // chat: [
    //   {
    //     senderId: { type: mongoose.Schema.Types.ObjectId, ref: "Userwebapp", required: true },
    //     text: { type: String, required: true },
    //     timestamp: { type: Date, default: Date.now },
    //   },
    // ],
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

const InternshipPosting = mongoose.model("InternshipPosting", internshipPostingSchema);

module.exports = InternshipPosting;
