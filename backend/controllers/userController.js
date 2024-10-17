  const asyncHandler = require("express-async-handler");
  const Userwebapp = require("../models/webapp-models/userModel");
  const generateToken = require("../utils/generateToken");

  // Register a new user
  const registerUser = asyncHandler(async (req, res) => {
    const {
      name,
      email,
      password,
      confirmPassword, // Added confirmPassword
      profilePicture,
      universityName,
      dob, // Renamed from 'userDob'
      educationLevel,
      fieldOfStudy,
      desiredField,
      linkedin,
      portfolio,
      resume,
    } = req.body;

    // Validate required fields
    if (!name || !email || !password || !confirmPassword) {
      res.status(400);
      throw new Error("Please fill all required fields: name, email, password, and confirm password.");
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
      password,
      profilePicture,
      universityName,
      dob, // Renamed
      educationLevel,
      fieldOfStudy,
      desiredField,
      linkedin,
      portfolio,
      resume,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        universityName: user.universityName,
        dob: user.dob, // Renamed
        educationLevel: user.educationLevel,
        fieldOfStudy: user.fieldOfStudy,
        desiredField: user.desiredField,
        linkedin: user.linkedin,
        portfolio: user.portfolio,
        resume: user.resume,
        token: generateToken(user._id),
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

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        universityName: user.universityName,
        dob: user.dob, // Renamed
        educationLevel: user.educationLevel,
        fieldOfStudy: user.fieldOfStudy,
        desiredField: user.desiredField,
        linkedin: user.linkedin,
        portfolio: user.portfolio,
        resume: user.resume,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error("Invalid email or password.");
    }
  });

  // Update user profile
  const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await Userwebapp.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.universityName = req.body.universityName || user.universityName;
      user.dob = req.body.dob || user.dob; // Renamed
      user.educationLevel = req.body.educationLevel || user.educationLevel;
      user.fieldOfStudy = req.body.fieldOfStudy || user.fieldOfStudy;
      user.desiredField = req.body.desiredField || user.desiredField;
      user.linkedin = req.body.linkedin || user.linkedin;
      user.portfolio = req.body.portfolio || user.portfolio;
      user.resume = req.body.resume || user.resume;
      user.profilePicture = req.body.profilePicture || user.profilePicture;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        universityName: updatedUser.universityName,
        dob: updatedUser.dob, // Renamed
        educationLevel: updatedUser.educationLevel,
        fieldOfStudy: updatedUser.fieldOfStudy,
        desiredField: updatedUser.desiredField,
        linkedin: updatedUser.linkedin,
        portfolio: updatedUser.portfolio,
        resume: updatedUser.resume,
        profilePicture: updatedUser.profilePicture,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404);
      throw new Error("User not found.");
    }
  });

  // Get all users with additional fields
  const getAllUsers = asyncHandler(async (req, res) => {
    const users = await Userwebapp.find({}, "name email universityName dob educationLevel fieldOfStudy desiredField linkedin portfolio resume profilePicture");

    if (users && users.length > 0) {
      res.status(200).json(users);
    } else {
      res.status(404);
      throw new Error("No users found.");
    }
  });

  module.exports = { registerUser, authUser, updateUserProfile, getAllUsers };
