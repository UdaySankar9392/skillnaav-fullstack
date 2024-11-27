const admin = require("firebase-admin");

// Initialize Firebase Admin SDK (you should have this initialized somewhere in your app)
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const googleAuthMiddleware = async (req, res, next) => {
  const idToken = req.headers.authorization?.split("Bearer ")[1]; // Get token from header

  if (!idToken) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // Verify the Firebase token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // Add decoded user info to request object
    next(); // Proceed to the next middleware/route handler
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(403).json({ message: "Unauthorized" });
  }
};

module.exports = googleAuthMiddleware;
