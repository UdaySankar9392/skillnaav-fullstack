// multer.js
const multer = require("multer");
const path = require("path");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinaryConfig");

// Set up Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "skillnaav_resumes",
    allowed_formats: ["pdf", "doc", "docx"],
    public_id: (req, file) => `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
  },
});

// File filter function for multer
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|docx|doc/;
  const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase()) &&
allowedTypes.test(file.mimetype);

  if (isValid) {
    return cb(null, true); // File is valid
  } else {
    return cb(new Error("Only .pdf, .doc, or .docx files are allowed.")); // Invalid file type
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB file size limit
});

module.exports = upload;
