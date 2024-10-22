const asyncHandler = require("express-async-handler");
const Userwebapp = require("../models/webapp-models/userModel");
const generateToken = require("../utils/generateToken");
const notifyUser = require("../utils/notifyUser"); // Import the notifyUser function

// Helper function to check required fields
const areFieldsFilled = (fields) => fields.every((field) => field);

// Register a new user
const registerUser = asyncHandler(async (req, res) => {
  console.log('Request Body:', req.body); // Log the request body

  const {
    name,
    email,
    password,
    confirmPassword,
    universityName,
    dob,
    educationLevel,
    fieldOfStudy,
    desiredField,
    linkedin,
    portfolio,
  } = req.body;

  // Check for required fields
  if (!areFieldsFilled([name, email, password, confirmPassword, universityName, dob, educationLevel, fieldOfStudy, desiredField, linkedin, portfolio])) {
    res.status(400);
    throw new Error("Please fill all required fields.");
  }

  // Check if passwords match
  if (password !== confirmPassword) {
    res.status(400);
    throw new Error("Passwords do not match.");
  }

  // Check if the user already exists
  const userExists = await Userwebapp.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Create new user
  const user = await Userwebapp.create({
    name,
    email,
    password, // Ensure password hashing occurs in the model pre-save hook
    universityName,
    dob,
    educationLevel,
    fieldOfStudy,
    desiredField,
    linkedin,
    portfolio,
    adminApproved: false, // Default to false
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      universityName: user.universityName,
      dob: user.dob,
      educationLevel: user.educationLevel,
      fieldOfStudy: user.fieldOfStudy,
      desiredField: user.desiredField,
      linkedin: user.linkedin,
      portfolio: user.portfolio,
      token: generateToken(user._id), // Generate token
      adminApproved: user.adminApproved, // Include admin approval status
    });
  } else {
    res.status(400);
    throw new Error("Error occurred while registering user.");
  }
});

// Authenticate user (login)
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await Userwebapp.findOne({ email });

  if (user && await user.matchPassword(password)) {
    // Check if the user is approved by an admin
    if (user.adminApproved) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        universityName: user.universityName,
        dob: user.dob,
        educationLevel: user.educationLevel,
        fieldOfStudy: user.fieldOfStudy,
        desiredField: user.desiredField,
        linkedin: user.linkedin,
        portfolio: user.portfolio,
        token: generateToken(user._id), // Generate token here
      });
    } else {
      // User is not approved by admin
      res.status(403);
      throw new Error("User account is not approved by an admin.");
    }
  } else {
    res.status(400);
    throw new Error("Invalid email or password.");
  }
});

// Update user profile
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await Userwebapp.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  // Update fields if they are provided, otherwise retain existing values
  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.universityName = req.body.universityName || user.universityName;
  user.dob = req.body.dob || user.dob;
  user.educationLevel = req.body.educationLevel || user.educationLevel;
  user.fieldOfStudy = req.body.fieldOfStudy || user.fieldOfStudy;
  user.desiredField = req.body.desiredField || user.desiredField;
  user.linkedin = req.body.linkedin || user.linkedin;
  user.portfolio = req.body.portfolio || user.portfolio;

  if (req.body.password) {
    user.password = req.body.password;
  }

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    universityName: updatedUser.universityName,
    dob: updatedUser.dob,
    educationLevel: updatedUser.educationLevel,
    fieldOfStudy: updatedUser.fieldOfStudy,
    desiredField: updatedUser.desiredField,
    linkedin: updatedUser.linkedin,
    portfolio: updatedUser.portfolio,
    token: generateToken(updatedUser._id), // Regenerate token
  });
});

// Get all users with additional fields
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await Userwebapp.find({}, "name email universityName dob educationLevel fieldOfStudy desiredField linkedin portfolio adminApproved");

  if (users && users.length > 0) {
    res.status(200).json(users);
  } else {
    res.status(404);
    throw new Error("No users found.");
  }
});

// Admin approve user
// Admin approve user
const approveUser = asyncHandler(async (req, res) => {
  const { userId } = req.params; // Use the correct parameter name
  console.log("Approving User ID:", userId); // Log the userId

  const user = await Userwebapp.findById(userId);
  if (!user) {
      res.status(404);
      throw new Error("User not found.");
  }

  // Approve the user
  user.adminApproved = true;
  await user.save();

  // Send a notification email to the user about their approval
  await notifyUser(user.email, "Your SkillNaav account has been approved!", "Congratulations! Your SkillNaav account has been approved by the admin.");

  res.status(200).json({ message: "User approved successfully." });
});



// Admin reject user
const rejectUser = asyncHandler(async (req, res) => {
  const { userId } = req.params; // Use the correct parameter name
  console.log("Rejecting User ID:", userId); // Log the userId

  const user = await Userwebapp.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  user.adminApproved = false;
  await user.save(); 

  // Optionally, you can log the rejection reason if provided
  const rejectionReason = req.body.reason || "Your SkillNaav account has been rejected by the admin.";
  
  // Send a notification email to the user about their rejection
  await notifyUser(user.email, "Your SkillNaav account has been rejected.", rejectionReason);

  // Optionally, you can perform any additional actions here (like setting a rejection status)
  
  res.status(200).json({ message: "User rejected successfully." });
});

module.exports = { registerUser, authUser, updateUserProfile, getAllUsers, approveUser, rejectUser };




