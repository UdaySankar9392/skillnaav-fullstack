const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const Userwebapp = require("../models/webapp-models/userModel"); // Adjust path as necessary
const Partnerwebapp = require("../models/webapp-models/partnerModel"); // Adjust path for partner model

// Middleware to protect routes for both users and partners
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if authorization header is present
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1]; // Extract token from header
    console.log("Verifying token:", token); // Log the token before verification

    try {
      // Verify token and decode it
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use your secret key
      let user;

      // Check if the request is for a partner route
      if (req.isPartner) {
        // Lookup partner by decoded ID
        user = await Partnerwebapp.findById(decoded.id).select("-password");

        // Log if the partner is found
        console.log("Partner user found:", user);
      } else {
        // Lookup user by decoded ID
        user = await Userwebapp.findById(decoded.id).select("-password");

        // Log if the user is found
        console.log("User found:", user);
      }

      // If user or partner is not found, return error
      if (!user) {
        return res.status(401).json({ message: "Not authorized, user not found" });
      }

      // Attach the user or partner object to the request
      req.user = user; // Attach user to the request object
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

      // Send a response with the appropriate message
      res.status(401).json({ message });
    }
  } else {
    console.log("No token provided"); // Log if no token is found
    res.status(401).json({ message: "Not authorized, no token" });
  }
});

module.exports = { protect }; // Export the middleware for use in routes
