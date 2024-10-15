const express = require("express");
const router = express.Router();
const {
  registerUser,
  authUser,
  updateUserProfile,
  getAllUsers,
} = require("../../controllers/userController");
const { protect } = require("../../middlewares/authMiddleware");

router.post("/register", registerUser); // User registration route
router.post("/login", authUser); // User login route
router.post("/profile", protect, updateUserProfile); // Protected route to update user profile
router.get("/users", getAllUsers); // Get all users route

module.exports = router;
