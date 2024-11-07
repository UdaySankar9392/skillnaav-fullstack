const express = require("express");
const router = express.Router();
const {
  registerPartner,
  authPartner,
  updatePartnerProfile,
  getAllPartners,
  approvePartner,
  rejectPartner,
  checkEmailExists,
} = require("../../controllers/partnerController");
const { protect } = require("../../middlewares/authMiddleware");

router.post("/register", registerPartner); 
router.post("/login", authPartner); 
router.post("/profile", protect, updatePartnerProfile); // Protected route to update partner profile
router.get("/partners", getAllPartners); // Get all partners route
router.patch("/approve/:partnerId", approvePartner); // Approve partner by ID, add protect middleware if needed
router.patch("/reject/:partnerId", rejectPartner);
router.post("/check-email", checkEmailExists);

module.exports = router;