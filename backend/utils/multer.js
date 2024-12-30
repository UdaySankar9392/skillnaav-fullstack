const multer = require('multer');
const path = require('path');

// Set up where to store the file and how to name it
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Store files in the 'uploads' folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Generate a unique filename
  },
});

// File type validation (only allow pdf, docx, or doc files)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|docx|doc/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true); // Accept the file
  } else {
    cb(new Error('Only .pdf, .doc, or .docx files are allowed.'));
  }
};

// Create multer instance with additional options
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
  },
});

module.exports = upload;
