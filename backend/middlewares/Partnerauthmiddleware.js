const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const Partnerwebapp = require("../models/webapp-models/partnerModel"); // Adjust path as necessary

// Middleware to protect routes for partners
const partnerProtect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if authorization header is present
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1]; // Extract token from header
    console.log("Verifying partner token:", token); // Log the token before verification

    try {
      // Verify token and decode it
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use your secret key
      // Find the partner by ID and exclude password from the response
      req.partner = await Partnerwebapp.findById(decoded.id).select("-password");

      // Check if partner exists
      if (!req.partner) {
        return res.status(401).json({ message: "Not authorized, partner not found" });
      }
      
      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      console.error("Error verifying token:", error); // Log any errors
      let message = "Not authorized, token failed";
      
      // Handle specific JWT errors
      if (error.name === "JsonWebTokenError") {
        message = "Not authorized, token invalid";
      } else if (error.name === "TokenExpiredError") {
        message = "Not authorized, token expired";
      }
      
      res.status(401).json({ message });
    }
  } else {
    console.log("No token provided"); // Log if no token is found
    res.status(401).json({ message: "Not authorized, no token" });
  }
});

module.exports = { partnerProtect }; // Export the middleware for use in partner routes
