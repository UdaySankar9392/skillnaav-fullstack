const express = require("express");
const router = express.Router();
const { profilePicUpload } = require('../../utils/multer'); // Import the profilePicUpload middleware
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
const { protect } = require("../../middlewares/authMiddleware");

// Use profilePicUpload middleware for the register route
router.post("/register", profilePicUpload.single('profileImage'), registerUser);

router.post("/login", authUser);
router.post("/profile", protect, updateUserProfile);
router.get("/users", getAllUsers);
router.patch("/approve/:userId", approveUser);
router.patch("/reject/:userId", rejectUser);
router.get('/check-email', checkIfUserExists);
router.post('/request-password-reset', requestPasswordReset);
router.post('/verify-otp-reset-password', verifyOTPAndResetPassword);
router.get("/profile", protect, getUserProfile);
router.get("/premium-status", protect, getPremiumStatus);

module.exports = router;