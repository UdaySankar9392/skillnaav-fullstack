const GoogleUserWebApp = require("../models/webapp-models/GoogleUserModel");
const admin = require("../config/firebase-admin"); // Import Firebase Admin SDK

const registerGoogleUser = async (req, res) => {
  try {
    const {
      idToken, // Firebase ID Token
      googleId, // Google UID from Google OAuth
      name,
      email,
      universityName,
      dob,
      educationLevel,
      fieldOfStudy,
      desiredField,
      linkedin,
      portfolio,
    } = req.body;

    // Validate required fields
    if (
      !idToken ||
      !googleId ||
      !name ||
      !email ||
      !universityName ||
      !dob ||
      !educationLevel ||
      !fieldOfStudy ||
      !desiredField ||
      !linkedin
    ) {
      return res.status(400).json({ message: "All required fields must be filled." });
    }

    // Verify the Firebase ID token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);  // Verifying the ID token
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired ID token." }); // Token verification failure
    }

    // Ensure the token's UID matches the googleId
    if (decodedToken.uid !== googleId) { 
      return res.status(401).json({ message: "Google ID does not match the token." });
    }

    // Parse the date for consistency
    const parsedDob = new Date(dob);
    if (isNaN(parsedDob)) {
      return res.status(400).json({ message: "Invalid date format for DOB." });
    }

    // Check if the user already exists using googleId
    let user = await GoogleUserWebApp.findOne({ googleId });

    if (user) {
      // Update existing user profile
      user.name = name;
      user.email = email;
      user.universityName = universityName;
      user.dob = parsedDob;
      user.educationLevel = educationLevel;
      user.fieldOfStudy = fieldOfStudy;
      user.desiredField = desiredField;
      user.linkedin = linkedin;
      user.portfolio = portfolio || user.portfolio;

      // Admin approval and active status are not updated, assuming that admin approval is done separately
      // Save updates
      const updatedUser = await user.save();
      return res.status(200).json({
        message: "User profile updated successfully!",
        user: updatedUser,
      });
    } else {
      // Create a new user if it doesn't exist
      const newUser = new GoogleUserWebApp({
        googleId,
        name,
        email,
        universityName,
        dob: parsedDob,
        educationLevel,
        fieldOfStudy,
        desiredField,
        linkedin,
        portfolio: portfolio || null,
        adminApproved: false, // Default is false (awaiting admin approval)
        isActive: false, // Default is false (user not active yet)
      });

      // Save the new user
      const savedUser = await newUser.save();
      return res.status(201).json({
        message: "User registered successfully! Awaiting admin approval.",
        user: savedUser,
      });
    }
  } catch (error) {
    console.error("Error during user registration or profile update:", error);
    return res.status(500).json({
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
};

module.exports = {
  registerGoogleUser,
};
