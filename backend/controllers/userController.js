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
    currentLevelOfEducation,
    fieldOfInterest,
    fieldOfStudy,
    desiredField,
    linkedin,
    portfolio,
  } = req.body;

  // Validate required fields
  if (
    !name ||
    !email ||
    !password ||
    !confirmPassword ||
    !universityName ||
    !dob ||
    !currentLevelOfEducation ||
    !fieldOfStudy ||
    !fieldOfInterest ||
    !desiredField ||
    !linkedin ||
    !portfolio
  ) {
    return res.status(400).json({
      message: "Please fill all required fields.",
    });
  }

  // Check if passwords match
  if (password !== confirmPassword) {
    return res.status(400).json({
      message: "Passwords do not match.",
    });
  }

  // Check if the user already exists
  const userExists = await Userwebapp.findOne({ email });
  if (userExists) {
    return res.status(400).json({
      message: "User already exists.",
    });
  }

  // Create user
  const user = await Userwebapp.create({
    name,
    email,
    password,
    universityName,
    dob,
    currentLevelOfEducation,
    fieldOfInterest,
    fieldOfStudy,
    desiredField,
    linkedin,
    portfolio,
  });

  if (user) {
    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    return res.status(400).json({
      message: "Error occurred while creating the user.",
    });
  }
});

// Authenticate user and get token
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await Userwebapp.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    return res.status(400).json({
      message: "Invalid Email or Password.",
    });
  }
});

// Update user profile
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await Userwebapp.findById(req.user._id);
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.universityName = req.body.universityName || user.universityName;
    user.dob = req.body.dob || user.dob;
    user.currentLevelOfEducation =
      req.body.currentLevelOfEducation || user.currentLevelOfEducation;
    user.fieldOfInterest = req.body.fieldOfInterest || user.fieldOfInterest;
    user.desiredField = req.body.desiredField || user.desiredField;
    user.linkedin = req.body.linkedin || user.linkedin;
    user.portfolio = req.body.portfolio || user.portfolio;

    // Optional: Password change logic can be added here
    if (req.body.password) {
      user.password = req.body.password; // You might want to hash this password
    }

    const updatedUser = await user.save();
    return res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      universityName: updatedUser.universityName,
      dob: updatedUser.dob,
      currentLevelOfEducation: updatedUser.currentLevelOfEducation,
      fieldOfInterest: updatedUser.fieldOfInterest,
      desiredField: updatedUser.desiredField,
      linkedin: updatedUser.linkedin,
      portfolio: updatedUser.portfolio,
      token: generateToken(updatedUser._id),
    });
  } else {
    return res.status(404).json({
      message: "User Not Found!",
    });
  }
});

// Get all users
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await Userwebapp.find({}, "name email"); // Fetch only name and email

  if (users && users.length > 0) {
    return res.status(200).json(users);
  } else {
    return res.status(404).json({
      message: "No users found!",
    });
  }
});

module.exports = { registerUser, authUser, updateUserProfile, getAllUsers };
