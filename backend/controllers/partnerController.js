const asyncHandler = require("express-async-handler");
const Partnerwebapp = require("../models/webapp-models/partnerModel");
const generateToken = require("../utils/generateToken");

const registerPartner = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    res.status(400);
    throw new Error(
      "Please fill all required fields: name, email, and password."
    );
  }

  // Check if the partner already exists
  const partnerExists = await Partnerwebapp.findOne({ email });
  if (partnerExists) {
    res.status(400);
    throw new Error("Partner already exists");
  }

  // Create partner
  const partner = await Partnerwebapp.create({ name, email, password, pic });

  if (partner) {
    res.status(201).json({
      _id: partner._id,
      name: partner.name,
      email: partner.email,
      isAdmin: partner.isAdmin,
      pic: partner.pic,
      token: generateToken(partner._id),
    });
  } else {
    res.status(400);
    throw new Error("Error Occurred");
  }
});

const authPartner = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const partner = await Partnerwebapp.findOne({ email });

  if (partner && (await partner.matchPassword(password))) {
    res.json({
      _id: partner._id,
      name: partner.name,
      email: partner.email,
      isAdmin: partner.isAdmin,
      pic: partner.pic,
      token: generateToken(partner._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid Email or Password!");
  }
});

const updatePartnerProfile = asyncHandler(async (req, res) => {
  const partner = await Partnerwebapp.findById(req.user._id);
  if (partner) {
    partner.name = req.body.name || partner.name;
    partner.email = req.body.email || partner.email;

    if (req.body.password) {
      partner.password = req.body.password;
    }
    const updatedPartner = await partner.save();
    res.json({
      _id: updatedPartner._id,
      name: updatedPartner.name,
      email: updatedPartner.email,
      token: generateToken(updatedPartner._id),
    });
  } else {
    res.status(404);
    throw new Error("Partner Not Found!");
  }
});

const getAllPartners = asyncHandler(async (req, res) => {
  const partners = await Partnerwebapp.find({}, "name email"); // Fetch only name and email

  if (partners) {
    res.status(200).json(partners);
  } else {
    res.status(404);
    throw new Error("No partners found!");
  }
});

module.exports = {
  registerPartner,
  authPartner,
  updatePartnerProfile,
  getAllPartners,
};
