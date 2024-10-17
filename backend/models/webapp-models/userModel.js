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
      required: true,
    },
    profilePicture: {
      type: String,
      required: false,
      default: "https://example.com/default-pic.png",
    },
    universityName: {
      type: String,
      required: false,
    },
    dob: { // Renamed from 'userDob' to 'dob'
      type: String,
      required: false, // Optional
    },
    educationLevel: {
      type: String,
      required: false,
    },
    fieldOfStudy: {
      type: String,
      required: false,
    },
    desiredField: {
      type: String,
      required: false,
    },
    linkedin: {
      type: String,
      required: false,
    },
    portfolio: {
      type: String,
      required: false,
    },
    resume: {
      type: String,
      required: false,
    },
    conformpassword: {
      type: String,
      required: false,
    }
  },
  {
    timestamps: true,
  }
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
