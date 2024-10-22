const express = require("express");
const router = express.Router();
const {
  registerAdmin,
  authAdmin,
  updateAdminProfile,
  getAllAdmins,
  approveAdmin,
  rejectAdmin,
} = require("../../controllers/adminController");
const { protect } = require("../../middlewares/authMiddleware");

router.post("/register", registerAdmin); // Admin registration route
router.post("/login", authAdmin); // Admin login route
router.post("/profile", protect, updateAdminProfile); // Protected route to update admin profile
router.get("/admins", getAllAdmins); // Get all admins route
router.patch("/approve/:adminId", approveAdmin); // Approve admin by ID, add protect middleware if needed
router.patch("/reject/:adminId", rejectAdmin);

module.exports = router;
