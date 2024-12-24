const GoogleUserWebApp = require("../models/webapp-models/GoogleUserModel");
const admin = require("../config/firebase-admin"); // Import Firebase Admin SDK

// Register Google User
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

// Sign-In Google User
const signInGoogleUser = async (req, res) => {
  try {
    const { idToken, googleId } = req.body; // ID token and googleId are required

    if (!idToken || !googleId) {
      return res.status(400).json({ message: "Google ID and ID token are required." });
    }

    // Verify the Firebase ID token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);  // Verifying the ID token
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired ID token." });
    }

    // Ensure the token's UID matches the googleId
    if (decodedToken.uid !== googleId) { 
      return res.status(401).json({ message: "Google ID does not match the token." });
    }

    // Find user by googleId
    let user = await GoogleUserWebApp.findOne({ googleId });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if the user's account is approved
    if (!user.adminApproved) {
      return res.status(403).json({
        message: "Your account is awaiting admin approval. Please try again later."
      });
    }

    // Proceed with successful sign-in (e.g., generate a session, issue a JWT, etc.)
    return res.status(200).json({
      message: "Sign-in successful.",
      user: {
        name: user.name,
        email: user.email,
        googleId: user.googleId,
        universityName: user.universityName,
        dob: user.dob,
        educationLevel: user.educationLevel,
        fieldOfStudy: user.fieldOfStudy,
        desiredField: user.desiredField,
        linkedin: user.linkedin,
        portfolio: user.portfolio,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Error during user sign-in:", error);
    return res.status(500).json({
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
};

module.exports = {
  registerGoogleUser,
  signInGoogleUser,
};
