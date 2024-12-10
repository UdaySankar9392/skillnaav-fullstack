const mongoose = require("mongoose");

const googleUserWebAppSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows null googleId if the user logs in via email only
    },
    name: {
      type: String,
      required: true, // Name from Google signup
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true, // Ensures email is trimmed of spaces
    },
    universityName: {
      type: String,
      required: true, // University name entered by the user
    },
    dob: {
      type: Date,
      required: true, // Date of birth entered by the user
    },
    educationLevel: {
      type: String,
      required: true, // Education level selected by user
    },
    fieldOfStudy: {
      type: String,
      required: true, // Field of study entered by the user
    },
    desiredField: {
      type: String,
      required: true, // Desired field for internship/job
    },
    linkedin: {
      type: String,
      required: true, // LinkedIn profile link
    },
    portfolio: {
      type: String,
      default: null, // Portfolio website link (optional)
    },
    // Admin approval for registration
    adminApproved: {
      type: Boolean,
      default: false, // Initially false, set to true when approved by admin
    },
    // Indicates whether the user is active (registration complete and approved)
    isActive: {
      type: Boolean,
      default: false, // Initially false, set to true when approved and active
    },
  },
  {
    timestamps: true, // Automatically creates createdAt and updatedAt fields
  }
);

// Create model
const GoogleUserWebApp = mongoose.model("GoogleUserWebApp", googleUserWebAppSchema);

// Export model for use in other files
module.exports = GoogleUserWebApp;
