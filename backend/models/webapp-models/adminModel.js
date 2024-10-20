const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const adminwebappSchema = new mongoose.Schema(
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
    isAdmin: {
      type: Boolean,
      default: true, // Admin users are usually admin by default
    },
    pic: {
      type: String,
      default: "https://example.com/default-admin-avatar.png", // Default avatar for admin
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving the admin user
adminwebappSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next(); // If the password is not modified, just proceed
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next(); // Proceed to save the admin user
});

// Method to compare entered password with hashed password
adminwebappSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create Admin model
const Adminwebapp = mongoose.model("Adminwebapp", adminwebappSchema);

module.exports = Adminwebapp;
