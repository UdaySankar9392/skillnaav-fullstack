const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const userwebappSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true, // This creates an index
      trim: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: true,
      minlength: [8, "Password must be at least 8 characters long"],
    },
    otp: { type: String },
    otpExpiration: { type: Date },
    universityName: { type: String, required: true, trim: true },
    dob: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          return /^\d{4}-\d{2}-\d{2}$/.test(value);
        },
        message: "Date of birth must be in YYYY-MM-DD format",
      },
    },
    educationLevel: { type: String, required: true, trim: true },
    fieldOfStudy: { type: String, required: true, trim: true },
    desiredField: { type: String, required: true, trim: true },
    linkedin: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          return /^(https?:\/\/)?(www\.)?linkedin\.com\/.*$/.test(value);
        },
        message: "Please enter a valid LinkedIn URL",
      },
    },
    portfolio: {
      type: String,
      validate: {
        validator: function (value) {
          return /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/\S*)?$/.test(value);
        },
        message: "Please enter a valid portfolio URL",
      },
    },
    profileImage: { type: String, required: true },
    financialStatus: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },
    city: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    currentGrade: { type: String, trim: true },
    gradePercentage: {
      type: String,
      validate: {
        validator: function (value) {
          return /^\d{1,3}(\.\d{1,2})?%$/.test(value);
        },
        message: "Grade percentage must be in the format XX% or XX.XX%",
      },
    },
    adminApproved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },
    premiumExpiration: { type: Date, default: null },
  },
  { timestamps: true }
);

// Indexes (only for non-unique fields)
userwebappSchema.index({ isPremium: 1 });
userwebappSchema.index({ premiumExpiration: 1 });

// Virtual field for age
userwebappSchema.virtual("age").get(function () {
  const dob = new Date(this.dob);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
});

// Middleware for password hashing
userwebappSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Middleware for OTP expiration
userwebappSchema.pre("save", function (next) {
  if (this.otpExpiration && this.otpExpiration < new Date()) {
    this.otp = undefined;
    this.otpExpiration = undefined;
  }
  next();
});

// Method to compare passwords
userwebappSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate password reset token
userwebappSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  return resetToken;
};

// Static methods
userwebappSchema.statics.findByEmail = function (email) {
  return this.findOne({ email });
};

userwebappSchema.statics.isPremiumUser = function (userId) {
  return this.findOne({ _id: userId, isPremium: true });
};

const Userwebapp = mongoose.model("Userwebapp", userwebappSchema);
module.exports = Userwebapp;