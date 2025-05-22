const mongoose = require("mongoose");

const internshipPostingSchema = mongoose.Schema(
  {
    jobTitle: { type: String, required: true },
    companyName: { type: String, required: true },
    location: { type: String, required: true },
    jobDescription: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDateOrDuration: { type: String, required: true }, // Can be a date or duration string
    duration: { type: String, required: true }, // E.g., "2 months and 13 days"

    // Internship type (Free / Stipend / Paid)
    internshipType: {
      type: String,
      enum: ['FREE', 'STIPEND', 'PAID'],
      required: true
    },

    // **New**: Mode of internship (Offline / Online / Hybrid)
    internshipMode: {
      type: String,
      enum: ['OFFLINE', 'ONLINE', 'HYBRID'],
      required: true,
      default: 'ONLINE'
    },

    compensationDetails: {
      type: {
        type: String,
        enum: ['FREE', 'STIPEND', 'PAID'],
        required: true
      },
      amount: { type: Number }, // Optional for free internships
      currency: { type: String }, // Optional for free internships
      frequency: { 
        type: String,
        enum: ['MONTHLY', 'WEEKLY', 'ONE_TIME'],
      },
      benefits: { type: [String] }, // Optional benefits for interns
      additionalCosts: [{
        description: { type: String },
        amount: { type: Number },
        currency: { type: String }
      }]
    },

    partnerId: { type: mongoose.Schema.Types.ObjectId, ref: "Partner", required: true }, 
    qualifications: { type: [String], required: true },

    contactInfo: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },

    imgUrl: { 
      type: String, 
      default: "https://default-image-url.com/image.png" 
    },

    studentApplied: { type: Boolean, default: false },
    adminApproved: { type: Boolean, default: false },
    adminReviewed: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const InternshipPosting = mongoose.model("InternshipPosting", internshipPostingSchema);

module.exports = InternshipPosting;
