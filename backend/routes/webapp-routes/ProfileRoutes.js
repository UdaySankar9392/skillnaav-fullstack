const express = require("express");
const router = express.Router();
const UserGoogleModel = require("../../models/UserGooglemodel");
const googleAuthMiddleware = require("../../middlewares/googleAuthMiddleware");

// Update profile route
router.post("/update-profile", googleAuthMiddleware, async (req, res) => {
  const { universityName, dob, educationLevel, fieldOfStudy, desiredField, linkedIn, portfolio } = req.body;
  const email = req.user.email; // Email from the decoded token

  try {
    // Find user by email (this assumes email is unique in the database)
    let user = await UserGoogleModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user profile fields (only update fields provided)
    user.universityName = universityName || user.universityName;
    user.dob = dob || user.dob;
    user.educationLevel = educationLevel || user.educationLevel;
    user.fieldOfStudy = fieldOfStudy || user.fieldOfStudy;
    user.desiredField = desiredField || user.desiredField;
    user.linkedIn = linkedIn || user.linkedIn;
    user.portfolio = portfolio || user.portfolio;

    // Save the updated user profile
    await user.save();
    return res.status(200).json({ message: "Profile updated successfully!" });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ message: "Error updating profile." });
  }
});

module.exports = router;
