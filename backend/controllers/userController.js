const asyncHandler = require("express-async-handler");
const Userwebapp = require("../models/webapp-models/userModel");
const generateToken = require("../utils/generateToken");
const notifyUser = require("../utils/notifyUser"); // Import the notifyUser function


// In your controller file (e.g., userController.js)
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await Userwebapp.findById(req.user._id); // Assuming req.user is set by authentication middleware

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

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
    adminApproved: user.adminApproved,
    financialStatus: user.financialStatus,
    state: user.state,
    country: user.country,
    city: user.city,
    postalCode: user.postalCode,
    currentGrade: user.currentGrade,
    gradePercentage: user.gradePercentage,
  });
});
// Helper function to check required fields
const areFieldsFilled = (fields) => fields.every((field) => field);

// Check if user exists by email
const checkIfUserExists = asyncHandler(async (req, res) => {
  const { email } = req.query; // Get email from query parameters
  const userExists = await Userwebapp.findOne({ email });
  
  res.json({ exists: !!userExists }); // Respond with true or false
});



  // Generate a random OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit OTP
};

// Request Password Reset with OTP
const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Find the user by email
  const user = await Userwebapp.findOne({ email });
  if (!user) {
      res.status(404);
      throw new Error("No account found with that email.");
  }

  // Generate an OTP and save it to the user model
  const otp = generateOTP();
  user.otp = otp; 
  user.otpExpiration = Date.now() + 300000; // OTP valid for 5 minutes
  await user.save();

  // Send the OTP to the user's email
  await notifyUser(user.email, "Your OTP for Password Reset", `<p>Your OTP is: ${otp}</p><p>It is valid for 5 minutes.</p>`);

  res.status(200).json({ message: "OTP sent to your email." });
});

// Verify OTP and Reset Password

const verifyOTPAndResetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  // Find the user by email and check if the OTP is valid
  const user = await Userwebapp.findOne({
      email,
      otp,
      otpExpiration: { $gt: Date.now() } // Check if the OTP is still valid
  });

  if (!user) {
      res.status(400);
      throw new Error("Invalid or expired OTP.");
  }

  // Set the new password (this will be hashed due to pre-save hook)
  user.password = newPassword;
  
  // Clear the OTP fields
  user.otp = undefined;
  user.otpExpiration = undefined;

  await user.save();

  res.status(200).json({ message: "Password has been successfully updated." });
});
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
  if (!areFieldsFilled([name, email, password, confirmPassword, universityName, dob, educationLevel, fieldOfStudy, desiredField, linkedin, ])) {
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
    // Generate token regardless of admin approval
    const token = generateToken(user._id);

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
      token, // Generate token here
      adminApproved: user.adminApproved // Include admin approval status
    });
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
  user.financialStatus = req.body.financialStatus || user.financialStatus;
  user.state = req.body.state || user.state;
  user.country = req.body.country || user.country;
  user.city = req.body.city || user.city;
  user.postalCode = req.body.postalCode || user.postalCode;
  user.currentGrade = req.body.currentGrade || user.currentGrade;
  user.gradePercentage = req.body.gradePercentage || user.gradePercentage;

  if (req.body.password) {
    user.password = req.body.password; // This will trigger the password hashing pre-save hook
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
    financialStatus: updatedUser.financialStatus,
    state: updatedUser.state,
    country: updatedUser.country,
    city: updatedUser.city,
    postalCode: updatedUser.postalCode,
    currentGrade: updatedUser.currentGrade,
    gradePercentage: updatedUser.gradePercentage,
    token: generateToken(updatedUser._id), // Regenerate token
  });
});


// Get all users with additional fields
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await Userwebapp.find({}, "name email universityName dob educationLevel fieldOfStudy desiredField linkedin  adminApproved");

  if (users && users.length > 0) {
    res.status(200).json(users);
  } else {
    res.status(404);
    throw new Error("No users found.");
  }
});

// Admin approve a user
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
  
  await notifyUser(user.email, "Your SkillNaav account has been approved!", "Congratulations! Your SkillNaav account has been approved by the admin.");

  
   await user.save();

   res.status(200).json({ message: "User approved successfully." });
});

// Admin rejects a user
const rejectUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  console.log("Rejecting User ID:", userId);

  // Find the user by ID
  const user = await Userwebapp.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  // Update the user's admin approval status to false and set status to 'Rejected'
  user.adminApproved = false;
  user.status = "Rejected";
  await user.save();

  // Notify the user about the rejection
  await notifyUser(
    user.email,
    "Your SkillNaav account has been rejected.",
    "Your SkillNaav account has been rejected by the admin."
  );

  // Send a success response
  res.status(200).json({ message: "User rejected successfully." });
});

module.exports = { 
   registerUser, 
   authUser, 
   updateUserProfile, 
   getAllUsers, 
   approveUser, 
   rejectUser ,
   checkIfUserExists, // Exporting the new function to check for existing users.
   requestPasswordReset,
   verifyOTPAndResetPassword,
   getUserProfile,
};