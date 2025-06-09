// backend/routes/webapp‑routes/userRoutes.js
const express = require("express");
const router = express.Router();

const { profilePicUpload } = require('../../utils/multer');

const {
  registerUser,
  authUser,
  updateUserProfile,
  getAllUsers,
  approveUser,
  rejectUser,
  checkIfUserExists,
  requestPasswordReset,
  verifyOTPAndResetPassword,
  getUserProfile,
  getPremiumStatus,
} = require("../../controllers/userController");

// UPDATED: import authenticate instead of protect
const { authenticate } = require("../../middlewares/authMiddleware");

// Public
router.post(
  "/register",
  profilePicUpload.single('profileImage'),
  registerUser
);

router.post("/login", authUser);

router.get("/check-email", checkIfUserExists);

router.post("/request-password-reset", requestPasswordReset);
router.post("/verify-otp-reset-password", verifyOTPAndResetPassword);

// Protected
router.get("/profile", authenticate, getUserProfile);
router.put("/profile", authenticate, updateUserProfile);

router.get("/premium-status", authenticate, getPremiumStatus);

// Admin (you might want to gate these behind an admin check later)
router.get("/users",  getAllUsers);
router.patch("/approve/:userId",  approveUser);
router.patch("/reject/:userId", rejectUser);

module.exports = router;
