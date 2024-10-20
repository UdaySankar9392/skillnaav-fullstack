const asyncHandler = require("express-async-handler");
const Adminwebapp = require("../models/webapp-models/adminModel");
const generateToken = require("../utils/generateToken");

// Register Admin
const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    res.status(400);
    throw new Error(
      "Please fill all required fields: name, email, and password."
    );
  }

  // Check if the admin already exists
  const adminExists = await Adminwebapp.findOne({ email });
  if (adminExists) {
    res.status(400);
    throw new Error("Admin already exists");
  }

  // Create admin
  const admin = await Adminwebapp.create({ name, email, password, pic });

  if (admin) {
    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      isAdmin: admin.isAdmin,
      pic: admin.pic,
      token: generateToken(admin._id),
    });
  } else {
    res.status(400);
    throw new Error("Error Occurred");
  }
});

// Admin Login
const authAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await Adminwebapp.findOne({ email });

  if (admin && (await admin.matchPassword(password))) {
    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      isAdmin: admin.isAdmin,
      pic: admin.pic,
      token: generateToken(admin._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid Email or Password!");
  }
});

// Update Admin Profile
const updateAdminProfile = asyncHandler(async (req, res) => {
  const admin = await Adminwebapp.findById(req.admin._id);
  if (admin) {
    admin.name = req.body.name || admin.name;
    admin.email = req.body.email || admin.email;

    if (req.body.password) {
      admin.password = req.body.password;
    }
    const updatedAdmin = await admin.save();
    res.json({
      _id: updatedAdmin._id,
      name: updatedAdmin.name,
      email: updatedAdmin.email,
      token: generateToken(updatedAdmin._id),
    });
  } else {
    res.status(404);
    throw new Error("Admin Not Found!");
  }
});

// Get All Admins
const getAllAdmins = asyncHandler(async (req, res) => {
  const admins = await Adminwebapp.find({}, "name email"); // Fetch only name and email

  if (admins) {
    res.status(200).json(admins);
  } else {
    res.status(404);
    throw new Error("No admins found!");
  }
});

module.exports = { registerAdmin, authAdmin, updateAdminProfile, getAllAdmins };
