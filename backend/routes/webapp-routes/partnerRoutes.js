const express = require("express");
const router = express.Router();
const {
  registerPartner,
  authPartner,
  updatePartnerProfile,
  getAllPartners,
} = require("../../controllers/partnerController");
const { protect } = require("../../middlewares/authMiddleware");

// Partner registration route
router.post("/register", registerPartner);

// Partner login route
router.post("/login", authPartner);

// Protected route to update partner profile
router.post("/profile", protect, updatePartnerProfile);

// Get all partners route
router.get("/partners", getAllPartners);

module.exports = router;
