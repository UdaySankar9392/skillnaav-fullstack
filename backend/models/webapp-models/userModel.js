const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userwebappSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    otp: { type: String },
    otpExpiration: { type: Date },
    universityName: { type: String, required: true },
    dob: { type: String, required: true },
    educationLevel: { type: String, required: true },
    fieldOfStudy: { type: String, required: true },
    desiredField: { type: String, required: true },
    linkedin: { type: String, required: true },
    portfolio: { type: String },

    // ✅ Keep only one profileImage field
    profileImage: { type: String, required: true },

    // New fields added (optional)
    financialStatus: { type: String },
    state: { type: String },
    country: { type: String },
    city: { type: String },
    postalCode: { type: String },
    currentGrade: { type: String },
    gradePercentage: { type: String },

    adminApproved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },

    // Add premiumExpiration field
    premiumExpiration: { type: Date, default: null }, // Default is null (no expiration)
  },
  { timestamps: true }
);

// Hash password before saving
userwebappSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare hashed password with entered password
userwebappSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Userwebapp = mongoose.model("Userwebapp", userwebappSchema);

module.exports = Userwebapp;