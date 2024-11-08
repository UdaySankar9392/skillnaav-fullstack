const express = require("express");
const router = express.Router();
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
} = require("../../controllers/userController");
const { protect } = require("../../middlewares/authMiddleware");

router.post("/register", registerUser); // User registration route
router.post("/login", authUser); // User login route
router.post("/profile", protect, updateUserProfile); // Protected route to update user profile
router.get("/users", getAllUsers); // Get all users route
router.patch("/approve/:userId", approveUser); // Approve user by ID, add protect middleware if needed
router.patch("/reject/:userId", rejectUser);
router.get('/check-email', checkIfUserExists); 
router.post('/request-password-reset', requestPasswordReset); // Request password reset with OTP
router.post('/verify-otp-reset-password', verifyOTPAndResetPassword);

module.exports = router;