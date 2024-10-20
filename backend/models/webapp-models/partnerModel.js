const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const partnerwebappSchema = new mongoose.Schema(
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
      default: false,
    },
    pic: {
      type: String,
      default: "https://example.com/default-avatar.png",
    },
  },
  {
    timestamps: true,
  }
);

partnerwebappSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

partnerwebappSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Partnerwebapp = mongoose.model("Partnerwebapp", partnerwebappSchema);

module.exports = Partnerwebapp;
