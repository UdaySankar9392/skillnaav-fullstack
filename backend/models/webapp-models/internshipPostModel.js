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
    
    // New field for internship type handling
    internshipType: {
      type: String,
      enum: ['FREE', 'STIPEND', 'PAID'], // Restrict values to these three options
      required: true
    },
    
    compensationDetails: {
      type: {
        type: String,
        enum: ['FREE', 'STIPEND', 'PAID'], // Type of compensation
        required: true
      },
      amount: { type: Number }, // Optional for free internships
      currency: { type: String }, // Optional for free internships
      frequency: { 
        type: String,
        enum: ['MONTHLY', 'WEEKLY', 'ONE_TIME'], // Payment frequency for stipend/paid internships
      },
      benefits: { type: [String] }, // Optional benefits provided to interns
      additionalCosts: [{
        description: { type: String }, // Description of additional costs if applicable
        amount: { type: Number }, // Amount of additional costs
        currency: { type: String } // Currency for additional costs
      }]
    },

    partnerId: { type: mongoose.Schema.Types.ObjectId, ref: "Partner", required: true }, 
    qualifications: { type: [String], required: true },
    

    endDateOrDuration: { type: String, required: true },
    salaryDetails: { type: String, required: true },
    partnerId: { type: mongoose.Schema.Types.ObjectId, ref: "Partner", required: true }, 
    duration: { type: String, required: true },
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
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);


    imgUrl: { type: String, default: "https://default-image-url.com/image.png" },
    studentApplied: { type: Boolean, default: false },
    adminApproved: { type: Boolean, default: false },
    adminReviewed: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
    
    
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);


const InternshipPosting = mongoose.model("InternshipPosting", internshipPostingSchema);

module.exports = InternshipPosting;
