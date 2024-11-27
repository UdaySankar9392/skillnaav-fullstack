const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userwebappSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        // Password is required only for regular sign-up (not for Google sign-up)
        return !this.isGoogleSignUp;
      },
    },
    otp: { 
      type: String 
    },
    otpExpiration: { 
      type: Date 
    },
    universityName: {
      type: String,
      required: true,
    },
    dob: {
      type: String,
      required: true,
    },
    educationLevel: {
      type: String,
      required: true,
    },
    fieldOfStudy: {
      type: String,
      required: true,
    },
    desiredField: {
      type: String,
      required: true,
    },
    linkedin: {
      type: String,
      required: true,
    },
    portfolio: {
      type: String,
    },
    adminApproved: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isGoogleSignUp: {
      type: Boolean,
      default: false, // Set to true if the user signs up via Google
    },
    googleId: {
      type: String, // Google ID for Google sign-ins
    },
    googleProfilePic: {
      type: String, // Google profile picture URL
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving for regular sign-ups (not Google sign-up)
userwebappSchema.pre("save", async function (next) {
  if (!this.isModified("password") || this.isGoogleSignUp) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password for regular sign-ups (not Google sign-ups)
userwebappSchema.methods.matchPassword = async function (enteredPassword) {
  if (this.isGoogleSignUp) return true; // For Google sign-ups, no password check is needed
  return await bcrypt.compare(enteredPassword, this.password);
};

const Userwebapp = mongoose.model("Userwebapp", userwebappSchema);

module.exports = Userwebapp;
