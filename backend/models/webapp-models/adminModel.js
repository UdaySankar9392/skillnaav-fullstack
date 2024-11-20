// const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");

// const adminwebappSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       trim: true,
//     },
//     password: {
//       type: String,
//       required: true,
//     },
//     universityName: {
//       type: String,
//       required: true,
//     },
//     dob: {
//       type: String,
//       required: true,
//     },
//     educationLevel: {
//       type: String,
//       required: true,
//     },
//     fieldOfStudy: {
//       type: String,
//       required: true,
//     },
//     desiredField: {
//       type: String,
//       required: true,
//     },
//     linkedin: {
//       type: String,
//       required: true,
//     },
//     portfolio: {
//       type: String,
//       required: true,
//     },
//     adminApproved: {
//       type: Boolean,
//       default: false,
//     },
//     isActive: {
//       type: Boolean,
//       default: false,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Hash password before saving
// adminwebappSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) {
//     return next();
//   }
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
// });

// // Compare hashed password with entered password
// adminwebappSchema.methods.matchPassword = async function (enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

// const Adminwebapp = mongoose.model("Adminwebapp", adminwebappSchema);

// module.exports = Adminwebapp;
// models/Admin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the schema
const adminwebappsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  pic: {
    type: String,
    default: 'https://example.com/avatar.png'
  },
}, {
  timestamps: true
});

// Method to compare passwords
adminwebappsSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create the model using the schema and export it
module.exports = mongoose.model('adminwebapps', adminwebappsSchema);
