const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const Userwebapp = require("../models/webapp-models/userModel");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if authorization header is present
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log("Authorization header:", req.headers.authorization); // Log the header

      console.log("Verifying token:", token); // Log the token before verification
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with your secret
      console.log("Decoded token:", decoded); // Log decoded token

      req.user = await Userwebapp.findById(decoded.id).select("-password"); // Exclude password
      if (!req.user) {
        console.error("User not found for ID:", decoded.id);
        return res.status(401).json({ message: "Not authorized, user not found" });
      }
      next();
    } catch (error) {
      console.error("Error verifying token:", error); // Log any errors
      if (error.name === 'JsonWebTokenError') {
        res.status(401).json({ message: "Not authorized, token invalid" });
      } else if (error.name === 'TokenExpiredError') {
        res.status(401).json({ message: "Not authorized, token expired" });
      } else {
        res.status(401).json({ message: "Not authorized, token failed" });
      }
    }
  } else {
    // If no token is present
    console.log("No token provided"); // Log if no token is found
    res.status(401).json({ message: "Not authorized, no token" });
  }
});

module.exports = { protect };
