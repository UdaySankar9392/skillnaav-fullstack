const asyncHandler = require("express-async-handler");
const Userwebapp = require("../models/webapp-models/userModel");
const generateToken = require("../utils/generateToken");

// Register a new user
const registerUser = asyncHandler(async (req, res) => {
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

  if (
    !name ||
    !email ||
    !password ||
    !confirmPassword ||
    !universityName ||
    !dob ||
    !educationLevel ||
    !fieldOfStudy ||
    !desiredField ||
    !linkedin ||
    !portfolio
  ) {
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
    password, // Password will be hashed in the model pre-save hook
    universityName,
    dob,
    educationLevel,
    fieldOfStudy,
    desiredField,
    linkedin,
    portfolio,
    adminApproved: false, // Set default to false
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
      token: generateToken(user._id), // Generate token here
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

  if (user) {
    // Check if the password matches
    if (await user.matchPassword(password)) {
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

  // Ensure all fields are updated or retained
  const {
    name,
    email,
    universityName,
    dob,
    educationLevel,
    fieldOfStudy,
    desiredField,
    linkedin,
    portfolio,
    password,
    adminApproved, // Include adminApproved here
  } = req.body;

  if (
    !name ||
    !email ||
    !universityName ||
    !dob ||
    !educationLevel ||
    !fieldOfStudy ||
    !desiredField ||
    !linkedin ||
    !portfolio
  ) {
    res.status(400);
    throw new Error("Please fill all required fields.");
  }

  // Update user's information
  user.name = name;
  user.email = email;
  user.universityName = universityName;
  user.dob = dob;
  user.educationLevel = educationLevel;
  user.fieldOfStudy = fieldOfStudy;
  user.desiredField = desiredField;
  user.linkedin = linkedin;
  user.portfolio = portfolio;

  // Update password if provided
  if (password) {
    user.password = password; // Ensure password is hashed in pre-save hook
  }

  // Update admin approval status if provided
  if (adminApproved !== undefined) {
    // Check if adminApproved is in the request
    user.adminApproved = adminApproved; // Update admin approval status
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
    adminApproved: updatedUser.adminApproved,
    token: generateToken(updatedUser._id),
  });
});

// Get all users with additional fields
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await Userwebapp.find(
    {},
    "name email universityName dob educationLevel fieldOfStudy desiredField linkedin portfolio adminApproved"
  );

  if (users && users.length > 0) {
    res.status(200).json({ users });
  } else {
    res.status(404);
    throw new Error("No users found.");
  }
});

// Admin approve user
const approveUser = async (req, res) => {
  const { id } = req.params; // Get user ID from the request parameters

  try {
    const user = await User.findById(id); // Find the user by ID

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.adminApproved = true; // Set adminApproved to true
    await user.save(); // Save the updated user

    res.status(200).json({
      message: "User approved successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  registerUser,
  authUser,
  updateUserProfile,
  getAllUsers,
  approveUser,
};
