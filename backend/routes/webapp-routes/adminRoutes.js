const express = require("express");
const router = express.Router();
const {
  registerAdmin,
  authAdmin,
  updateAdminProfile,
  getAllAdmins,
} = require("../../controllers/adminController");
const { protect } = require("../../middlewares/authMiddleware");

router.post("/register", registerAdmin); // Admin registration route
router.post("/login", authAdmin); // Admin login route
router.post("/profile", protect, updateAdminProfile); // Protected route to update admin profile
router.get("/all", getAllAdmins); // Get all admins route

module.exports = router;
