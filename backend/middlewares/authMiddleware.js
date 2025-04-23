const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const Userwebapp = require("../models/webapp-models/userModel");
const Partnerwebapp = require("../models/webapp-models/partnerModel");

// Middleware to authenticate both users and partners
const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Try to find user first
      let user = await Userwebapp.findById(decoded.id).select("-password");
      
      // If not a user, try to find partner
      if (!user) {
        user = await Partnerwebapp.findById(decoded.id).select("-password");
        if (user) {
          req.isPartner = true; // Flag to indicate this is a partner
        }
      }

      if (!user) {
        return res.status(401).json({ message: "Not authorized" });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
});

// Middleware to authorize only partners
const authorizePartner = asyncHandler(async (req, res, next) => {
  if (!req.isPartner) {
    return res.status(403).json({ 
      message: "Not authorized as partner" 
    });
  }
  next();
});

// Middleware to authorize only admin users
const authorizeAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ 
      message: "Not authorized as admin" 
    });
  }
  next();
});

module.exports = {
  authenticate,
  authorizePartner,
  authorizeAdmin
};