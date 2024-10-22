const asyncHandler = require("express-async-handler");
const Partner = require("../models/webapp-models/partnerModel"); // Adjust path as necessary
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

/// Register Partner
const registerPartner = asyncHandler(async (req, res) => {
  const { name, email, password, universityName, institutionId } = req.body;

  try {
    // Check if the partner already exists
    const existingPartner = await Partner.findOne({ email });
    if (existingPartner) {
      return res.status(400).json({ success: false, message: "Partner already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new partner
    const newPartner = new Partner({
      name,
      email,
      password: hashedPassword,
      universityName,
      institutionId,
    });

    // Save partner to database
    await newPartner.save();

    // Respond with partner details including _id
    res.status(201).json({
      _id: newPartner._id, // Include the _id of the new partner
      success: true,
      message: "Partner registered successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error registering partner", error });
  }
});

// Login Partner
const loginPartner = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if partner exists
    const partner = await Partner.findOne({ email });
    if (!partner) {
      return res.status(404).json({ success: false, message: "Partner not found" });
    }

    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(password, partner.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: partner._id, email: partner.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      partner: {
        id: partner._id,
        name: partner.name,
        email: partner.email,
        universityName: partner.universityName,
        institutionId: partner.institutionId,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error logging in", error });
  }
});
// Get All Partners
const getAllPartners = asyncHandler(async (req, res) => {
  try {
    const partners = await Partner.find(); // Retrieve all partners from the database
    res.json({ success: true, partners });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error retrieving partners", error });
  }
});

// Export functions
module.exports = { registerPartner, loginPartner, getAllPartners };

