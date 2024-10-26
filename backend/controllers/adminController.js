// const asyncHandler = require("express-async-handler");
// const Adminwebapp = require("../models/webapp-models/adminModel");
// const generateToken = require("../utils/generateToken");
// const notifyUser = require("../utils/notifyUser"); // Import the notifyUser function

// // Helper function to check required fields
// const areFieldsFilled = (fields) => fields.every((field) => field);

// // Register a new admin
// const registerAdmin = asyncHandler(async (req, res) => {
//   console.log("Request Body:", req.body); // Log the request body

//   const {
//     name,
//     email,
//     password,
//     confirmPassword,
//     universityName,
//     dob,
//     educationLevel,
//     fieldOfStudy,
//     desiredField,
//     linkedin,
//     portfolio,
//   } = req.body;

//   // Check for required fields
//   if (
//     !areFieldsFilled([
//       name,
//       email,
//       password,
//       confirmPassword,
//       universityName,
//       dob,
//       educationLevel,
//       fieldOfStudy,
//       desiredField,
//       linkedin,
//       portfolio,
//     ])
//   ) {
//     res.status(400);
//     throw new Error("Please fill all required fields.");
//   }

//   // Check if passwords match
//   if (password !== confirmPassword) {
//     res.status(400);
//     throw new Error("Passwords do not match.");
//   }

//   // Check if the admin already exists
//   const adminExists = await Adminwebapp.findOne({ email });
//   if (adminExists) {
//     res.status(400);
//     throw new Error("Admin already exists");
//   }

//   // Create new admin
//   const admin = await Adminwebapp.create({
//     name,
//     email,
//     password, // Ensure password hashing occurs in the model pre-save hook
//     universityName,
//     dob,
//     educationLevel,
//     fieldOfStudy,
//     desiredField,
//     linkedin,
//     portfolio,
//     adminApproved: false, // Default to false
//   });

//   if (admin) {
//     res.status(201).json({
//       _id: admin._id,
//       name: admin.name,
//       email: admin.email,
//       universityName: admin.universityName,
//       dob: admin.dob,
//       educationLevel: admin.educationLevel,
//       fieldOfStudy: admin.fieldOfStudy,
//       desiredField: admin.desiredField,
//       linkedin: admin.linkedin,
//       portfolio: admin.portfolio,
//       token: generateToken(admin._id), // Generate token
//       adminApproved: admin.adminApproved, // Include admin approval status
//     });
//   } else {
//     res.status(400);
//     throw new Error("Error occurred while registering admin.");
//   }
// });

// // Authenticate admin (login)
// const authAdmin = asyncHandler(async (req, res) => {
//   const { email, password } = req.body;

//   const admin = await Adminwebapp.findOne({ email });

//   if (admin && (await admin.matchPassword(password))) {
//     // Check if the admin is approved by another admin
//     if (admin.adminApproved) {
//       res.json({
//         _id: admin._id,
//         name: admin.name,
//         email: admin.email,
//         universityName: admin.universityName,
//         dob: admin.dob,
//         educationLevel: admin.educationLevel,
//         fieldOfStudy: admin.fieldOfStudy,
//         desiredField: admin.desiredField,
//         linkedin: admin.linkedin,
//         portfolio: admin.portfolio,
//         token: generateToken(admin._id), // Generate token here
//       });
//     } else {
//       // Admin is not approved by another admin
//       res.status(403);
//       throw new Error("Admin account is not approved by another admin.");
//     }
//   } else {
//     res.status(400);
//     throw new Error("Invalid email or password.");
//   }
// });

// // Update admin profile
// const updateAdminProfile = asyncHandler(async (req, res) => {
//   const admin = await Adminwebapp.findById(req.admin._id);

//   if (!admin) {
//     res.status(404);
//     throw new Error("Admin not found.");
//   }

//   // Update fields if they are provided, otherwise retain existing values
//   admin.name = req.body.name || admin.name;
//   admin.email = req.body.email || admin.email;
//   admin.universityName = req.body.universityName || admin.universityName;
//   admin.dob = req.body.dob || admin.dob;
//   admin.educationLevel = req.body.educationLevel || admin.educationLevel;
//   admin.fieldOfStudy = req.body.fieldOfStudy || admin.fieldOfStudy;
//   admin.desiredField = req.body.desiredField || admin.desiredField;
//   admin.linkedin = req.body.linkedin || admin.linkedin;
//   admin.portfolio = req.body.portfolio || admin.portfolio;

//   if (req.body.password) {
//     admin.password = req.body.password;
//   }

//   const updatedAdmin = await admin.save();

//   res.json({
//     _id: updatedAdmin._id,
//     name: updatedAdmin.name,
//     email: updatedAdmin.email,
//     universityName: updatedAdmin.universityName,
//     dob: updatedAdmin.dob,
//     educationLevel: updatedAdmin.educationLevel,
//     fieldOfStudy: updatedAdmin.fieldOfStudy,
//     desiredField: updatedAdmin.desiredField,
//     linkedin: updatedAdmin.linkedin,
//     portfolio: updatedAdmin.portfolio,
//     token: generateToken(updatedAdmin._id), // Regenerate token
//   });
// });

// // Get all admins with additional fields
// const getAllAdmins = asyncHandler(async (req, res) => {
//   const admins = await Adminwebapp.find(
//     {},
//     "name email universityName dob educationLevel fieldOfStudy desiredField linkedin portfolio adminApproved"
//   );

//   if (admins && admins.length > 0) {
//     res.status(200).json(admins);
//   } else {
//     res.status(404);
//     throw new Error("No admins found.");
//   }
// });

// // Admin approve admin
// const approveAdmin = asyncHandler(async (req, res) => {
//   const { adminId } = req.params; // Use the correct parameter name
//   console.log("Approving Admin ID:", adminId); // Log the adminId

//   const admin = await Adminwebapp.findById(adminId);
//   if (!admin) {
//     res.status(404);
//     throw new Error("Admin not found.");
//   }

//   // Approve the admin
//   admin.adminApproved = true;
//   await admin.save();

//   // Send a notification email to the admin about their approval
//   await notifyUser(
//     admin.email,
//     "Your SkillNaav account has been approved!",
//     "Congratulations! Your SkillNaav account has been approved by another admin."
//   );

//   res.status(200).json({ message: "Admin approved successfully." });
// });

// // Admin reject admin
// const rejectAdmin = asyncHandler(async (req, res) => {
//   const { adminId } = req.params; // Use the correct parameter name
//   console.log("Rejecting Admin ID:", adminId); // Log the adminId

//   const admin = await Adminwebapp.findById(adminId);
//   if (!admin) {
//     res.status(404);
//     throw new Error("Admin not found.");
//   }

//   admin.adminApproved = false;
//   await admin.save();

//   // Optionally, you can log the rejection reason if provided
//   const rejectionReason =
//     req.body.reason || "Your SkillNaav account has been rejected by an admin.";

//   // Send a notification email to the admin about their rejection
//   await notifyUser(
//     admin.email,
//     "Your SkillNaav account has been rejected.",
//     rejectionReason
//   );

//   res.status(200).json({ message: "Admin rejected successfully." });
// });

// module.exports = {
//   registerAdmin,
//   authAdmin,
//   updateAdminProfile,
//   getAllAdmins,
//   approveAdmin,
//   rejectAdmin,
// };


// controllers/adminController.js

const Admin = require('../models/webapp-models/adminModel');
const bcrypt = require('bcrypt'); // for password hashing

// Dummy predefined credentials for illustration (in a real application, you would fetch this from the database)
const predefinedAdminCredentials = {
  username: 'admin',
  password: 'password123', // Make sure to hash passwords in production
};

const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  // Check if credentials match predefined ones
  if (
    username === predefinedAdminCredentials.username &&
    password === predefinedAdminCredentials.password
  ) {
    // Optionally, you could return a JWT token here
    return res.status(200).json({ message: 'Login successful' });
  }

  return res.status(401).json({ message: 'Invalid credentials' });
};

module.exports = { loginAdmin };
