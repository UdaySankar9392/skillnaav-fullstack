const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const Userwebapp = require("../models/webapp-models/userModel");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if authorization header is present
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    console.log("Verifying token:", token); // Log the token before verification

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
      req.user = await Userwebapp.findById(decoded.id).select("-password"); // Exclude password
      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Not authorized, user not found" });
      }
      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      console.error("Error verifying token:", error); // Log any errors
      let message = "Not authorized, token failed";
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

module.exports = { protect };
