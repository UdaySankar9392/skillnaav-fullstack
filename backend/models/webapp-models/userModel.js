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
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    pic: {
      type: String,
      required: true,
      default: "https://example.com/default-pic.png", // Replace with actual default URL
    },
  },
  {
    timestamps: true,
  }
);

userwebappSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userwebappSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Userwebapp = mongoose.model("Userwebapp", userwebappSchema);

module.exports = Userwebapp;
