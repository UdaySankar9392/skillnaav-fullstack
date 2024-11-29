const asyncHandler = require("express-async-handler");
const Partnerwebapp = require("../models/webapp-models/partnerModel");
const generateToken = require("../utils/generateToken");
const notifyUser = require("../utils/notifyUser");
const crypto = require('crypto');
const nodemailer = require('nodemailer');
// Get partner profile
const getPartnerProfile = asyncHandler(async (req, res) => {
    const partner = await Partnerwebapp.findById(req.user._id);

    if (partner) {
        res.json({
            _id: partner._id,
            name: partner.name,
            email: partner.email,
            universityName: partner.universityName,
            institutionId: partner.institutionId,
            adminApproved: partner.adminApproved,
            active: partner.active,
        });
    } else {
        res.status(404);
        throw new Error("Partner not found.");
    }
});

// Helper function to check required fields
const areFieldsFilled = (fields) => fields.every((field) => field);

// Generate a random OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit OTP
};

// Check if email exists
const checkEmailExists = asyncHandler(async (req, res) => {
    const { email } = req.body;

    // Check if the email is provided
    if (!email) {
        res.status(400);
        throw new Error("Email is required.");
    }

    // Check if a partner with this email already exists
    const partnerExists = await Partnerwebapp.findOne({ email });
    
    // Respond with whether the email exists
    res.json({ exists: !!partnerExists });
});

// Request Password Reset with OTP
const requestPasswordReset = asyncHandler(async (req, res) => {
    const { email } = req.body;

    // Find the partner by email
    const partner = await Partnerwebapp.findOne({ email });
    if (!partner) {
        res.status(404);
        throw new Error("No account found with that email.");
    }

    // Generate an OTP and save it to the partner model
    const otp = generateOTP();
    partner.otp = otp; // Assuming you have an otp field in your model
    partner.otpExpiration = Date.now() + 300000; // OTP valid for 5 minutes
    await partner.save();

    // Send the OTP to the user's email
    await notifyUser(partner.email, "Your OTP for Password Reset", `<p>Your OTP is: ${otp}</p><p>It is valid for 5 minutes.</p>`);

    res.status(200).json({ message: "OTP sent to your email." });
});

// Verify OTP and Reset Password
const verifyOTPAndResetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    // Find the partner by email and check if the OTP is valid
    const partner = await Partnerwebapp.findOne({
        email,
        otp,
        otpExpiration: { $gt: Date.now() } // Check if the OTP is still valid
    });

    if (!partner) {
        res.status(400);
        throw new Error("Invalid or expired OTP.");
    }

    // Set the new password (this will be hashed due to pre-save hook)
    partner.password = newPassword;
    
    // Clear the OTP fields
    partner.otp = undefined;
    partner.otpExpiration = undefined;
    
    await partner.save();
    
    res.status(200).json({ message: "Password has been successfully updated." });
});

// Register a new partner
const registerPartner = asyncHandler(async (req, res) => {
    console.log("Request Body:", req.body); // Log the request body

    const { name, email, password, confirmPassword, universityName, institutionId } = req.body;

    // Check for required fields
    if (!areFieldsFilled([name, email, password, confirmPassword, universityName, institutionId])) {
        res.status(400);
        throw new Error("Please fill all required fields.");
    }

    // Check if passwords match
    if (password !== confirmPassword) {
        res.status(400);
        throw new Error("Passwords do not match.");
    }

    // Create new partner
    const partner = await Partnerwebapp.create({
        name,
        email,
        password, // Ensure password hashing occurs in the model pre-save hook
        universityName,
        institutionId,
        adminApproved: false, // Default to false
    });

    if (partner) {
        res.status(201).json({
            _id: partner._id,
            name: partner.name,
            email: partner.email,
            universityName: partner.universityName,
            institutionId: partner.institutionId,
            token: generateToken(partner._id), // Generate token
            adminApproved: partner.adminApproved, // Include admin approval status
        });
    } else {
        res.status(400);
        throw new Error("Error occurred while registering partner.");
    }
});

// Authenticate partner (login)
// Authenticate partner (login)
const authPartner = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
  
    const partner = await Partnerwebapp.findOne({ email });
  
    if (partner && await partner.matchPassword(password)) {
      // Generate token regardless of admin approval
      const token = generateToken(partner._id);
  
      res.json({
        _id: partner._id,
        name: partner.name,
        email: partner.email,
        universityName: partner.universityName,
        institutionId: partner.institutionId,
        token, // Generate token here
        adminApproved: partner.adminApproved, // Include admin approval status
        active: partner.active // Include active status
      });
    } else {
      res.status(400);
      throw new Error("Invalid email or password.");
    }
  });
  

// Update partner profile
const updatePartnerProfile = asyncHandler(async (req, res) => {
   const partner = await Partnerwebapp.findById(req.partner._id);
   if (!partner) {
       res.status(404);
       throw new Error("Partner not found.");
   }

   // Update fields if they are provided; otherwise retain existing values
   partner.name = req.body.name || partner.name;
   partner.email = req.body.email || partner.email;
   partner.universityName = req.body.universityName || partner.universityName;
   partner.institutionId = req.body.institutionId || partner.institutionId;

   if (req.body.password) {
       partner.password = req.body.password; // Ensure password hashing occurs in the model pre-save hook.
   }

   const updatedPartner = await partner.save();
   res.json({
       _id: updatedPartner._id,
       name: updatedPartner.name,
       email: updatedPartner.email,
       universityName: updatedPartner.universityName,
       institutionId: updatedPartner.institutionId,
       token: generateToken(updatedPartner._id), // Regenerate token.
   });
});

// Get all partners
const getAllPartners = asyncHandler(async (req, res) => {
   const partners = await Partnerwebapp.find({}, "name email universityName institutionId adminApproved");
   if (partners && partners.length > 0) {
       res.status(200).json(partners);
   } else {
       res.status(404);
       throw new Error("No partners found.");
   }
});

// Admin approve a partner account
const approvePartner = asyncHandler(async (req, res) => {
   const { partnerId } = req.params;
   console.log("Approving Partner ID:", partnerId);

   const partner = await Partnerwebapp.findById(partnerId);
   if (!partner) {
       res.status(404);
       throw new Error("Partner not found.");
   }

   // Approve the account and set active to true.
   partner.adminApproved = true;
   partner.active = true;
   
   await notifyUser(partner.email, "Your SkillNaav account has been approved!", "Congratulations! Your SkillNaav account has been approved by the admin.");

   await partner.save();
   
   res.status(200).json({ message: "Partner approved successfully." });
});

// Admin reject a partner account
const rejectPartner = asyncHandler(async (req, res) => {
   const { partnerId } = req.params;
   console.log("Rejecting Partner ID:", partnerId);

   const partner = await Partnerwebapp.findById(partnerId);
   if (!partner) {
       res.status(404);
       throw new Error("Partner not found.");
   }

   // Reject the account and notify user.
   const rejectionReason = req.body.reason || "Your SkillNaav account has been rejected by the admin.";
   
   await notifyUser(partner.email, "Your SkillNaav account has been rejected.", rejectionReason);

   await Partnerwebapp.updateOne({ _id: partnerId }, { adminApproved: false });

   res.status(200).json({ message: "Partner rejected successfully." });
});

// Exporting functions for use in routes.
module.exports = {
   registerPartner,
   authPartner,
   updatePartnerProfile,
   getAllPartners,
   approvePartner,
   rejectPartner,
   checkEmailExists,
   requestPasswordReset,
   verifyOTPAndResetPassword, // Exporting verifyOTPAndResetPassword function 
   getPartnerProfile,
};
