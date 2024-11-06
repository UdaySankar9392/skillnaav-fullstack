const asyncHandler = require("express-async-handler");
const Partnerwebapp = require("../models/webapp-models/partnerModel");
const generateToken = require("../utils/generateToken");
const notifyUser = require("../utils/notifyUser"); // Import the notifyUser function

// Helper function to check required fields
const areFieldsFilled = (fields) => fields.every((field) => field);

// Check if email exists
const checkEmailExists = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Check if the email is provided
  if (!email) {
    res.status(400);
    throw new Error("Email is required.");
  }

  // Check if a partner with this email already exists
  const partnerExists = await Partnerwebapp.findOne({ email });

  // Respond with whether the email exists
  res.json({ exists: !!partnerExists });
});

// Register a new partner
const registerPartner = asyncHandler(async (req, res) => {
  console.log("Request Body:", req.body); // Log the request body

  const {
    name,
    email,
    password,
    confirmPassword,
    universityName,
    institutionId,
  } = req.body;

  // Check for required fields
  if (
    !areFieldsFilled([
      name,
      email,
      password,
      confirmPassword,
      universityName,
      institutionId,
    ])
  ) {
    res.status(400);
    throw new Error("Please fill all required fields.");
  }

  // Check if passwords match
  if (password !== confirmPassword) {
    res.status(400);
    throw new Error("Passwords do not match.");
  }

  

  // Create new partner
  const partner = await Partnerwebapp.create({
    name,
    email,
    password, // Ensure password hashing occurs in the model pre-save hook
    universityName,
    institutionId,
    adminApproved: false, // Default to false
  });

  if (partner) {
    res.status(201).json({
      _id: partner._id,
      name: partner.name,
      email: partner.email,
      universityName: partner.universityName,
      institutionId: partner.institutionId,
      token: generateToken(partner._id), // Generate token
      adminApproved: partner.adminApproved, // Include admin approval status
    });
  } else {
    res.status(400);
    throw new Error("Error occurred while registering partner.");
  }
});

// Authenticate partner (login)
const authPartner = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const partner = await Partnerwebapp.findOne({ email });

  if (partner && (await partner.matchPassword(password))) {
    // Check if the partner is approved by an admin and is active
    if (partner.adminApproved && partner.active) {
      res.json({
        _id: partner._id,
        name: partner.name,
        email: partner.email,
        universityName: partner.universityName,
        institutionId: partner.institutionId,
        token: generateToken(partner._id), // Generate token here
      });
    } else {
      // Partner is not approved or not active
      res.status(403);
      throw new Error("Partner account is not approved or is inactive.");
    }
  } else {
    res.status(400);
    throw new Error("Invalid email or password.");
  }
});

// Update partner profile
const updatePartnerProfile = asyncHandler(async (req, res) => {
  const partner = await Partnerwebapp.findById(req.partner._id);

  if (!partner) {
    res.status(404);
    throw new Error("Partner not found.");
  }

  // Update fields if they are provided, otherwise retain existing values
  partner.name = req.body.name || partner.name;
  partner.email = req.body.email || partner.email;
  partner.universityName = req.body.universityName || partner.universityName;
  partner.institutionId = req.body.institutionId || partner.institutionId;

  if (req.body.password) {
    partner.password = req.body.password;
  }

  const updatedPartner = await partner.save();

  res.json({
    _id: updatedPartner._id,
    name: updatedPartner.name,
    email: updatedPartner.email,
    universityName: updatedPartner.universityName,
    institutionId: updatedPartner.institutionId,
    token: generateToken(updatedPartner._id), // Regenerate token
  });
});

// Get all partners
const getAllPartners = asyncHandler(async (req, res) => {
  const partners = await Partnerwebapp.find(
    {},
    "name email universityName institutionId adminApproved"
  );

  if (partners && partners.length > 0) {
    res.status(200).json(partners);
  } else {
    res.status(404);
    throw new Error("No partners found.");
  }
});

// Admin approve partner
const approvePartner = asyncHandler(async (req, res) => {
  const { partnerId } = req.params; // Use the correct parameter name
  console.log("Approving Partner ID:", partnerId); // Log the partnerId

  const partner = await Partnerwebapp.findById(partnerId);
  if (!partner) {
    res.status(404);
    throw new Error("Partner not found.");
  }

  // Approve the partner and set active to true
  partner.adminApproved = true;
  partner.active = true; // Set the active field to true
  await partner.save();

  // Send a notification email to the partner about their approval
  await notifyUser(
    partner.email,
    "Your SkillNaav account has been approved!",
    "Congratulations! Your SkillNaav account has been approved by the admin."
  );

  res.status(200).json({ message: "Partner approved successfully." });
});

// Admin reject partner
const rejectPartner = asyncHandler(async (req, res) => {
  const { partnerId } = req.params; // Use the correct parameter name
  console.log("Rejecting Partner ID:", partnerId); // Log the partnerId

  const partner = await Partnerwebapp.findById(partnerId);
  if (!partner) {
    res.status(404);
    throw new Error("Partner not found.");
  }

  partner.adminApproved = false;
  await partner.save();

  // Optionally, you can log the rejection reason if provided
  const rejectionReason =
    req.body.reason || "Your SkillNaav account has been rejected by the admin.";

  // Send a notification email to the partner about their rejection
  await notifyUser(
    partner.email,
    "Your SkillNaav account has been rejected.",
    rejectionReason
  );

  res.status(200).json({ message: "Partner rejected successfully." });
});

module.exports = {
  registerPartner,
  authPartner,
  updatePartnerProfile,
  getAllPartners,
  approvePartner,
  rejectPartner,
  checkEmailExists,
};