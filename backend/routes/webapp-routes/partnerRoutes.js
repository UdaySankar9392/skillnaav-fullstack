const express = require("express");
const router = express.Router();
const { registerPartner, loginPartner, getAllPartners } = require("../../controllers/partnerController");

// Partner registration route
router.post("/register", registerPartner);

// Partner login route
router.post("/login", loginPartner);

// Get all partners route
router.get("/all", getAllPartners); // New route to get all partners

// Export routes
module.exports = router;
