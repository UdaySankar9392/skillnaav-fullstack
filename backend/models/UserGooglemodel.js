// models/GoogleAuthUser.js
const mongoose = require("mongoose");

const googleAuthUserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    googleAuth: { type: Boolean, default: true }, // Marks that the user signed up via Google
    // Initial profile data (can be filled later)
    universityName: { type: String },
    dob: { type: Date },
    educationLevel: { type: String },
    fieldOfStudy: { type: String },
    // Additional profile fields to be filled after sign-up
    desiredField: { type: String },
    linkedin: { type: String },
    portfolio: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GoogleAuthUser", googleAuthUserSchema);
