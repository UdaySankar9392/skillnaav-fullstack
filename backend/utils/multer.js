const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');
const path = require('path');

// Initialize S3Client for resume uploads
const s3Resume = new S3Client({
  region: process.env.AWS_REGION_RESUME, // Region for resume bucket
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Initialize S3Client for profile picture uploads
const s3ProfilePic = new S3Client({
  region: process.env.AWS_REGION_PROFILE_PIC, // Region for profile picture bucket
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Multer configuration for resume uploads
const resumeUpload = multer({
  storage: multerS3({
    s3: s3Resume,
    bucket: process.env.AWS_S3_BUCKET_RESUME, // Bucket for resumes
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `resumes/${uniqueSuffix}${path.extname(file.originalname)}`);
    },
  }),
  fileFilter: function (req, file, cb) {
    const allowedTypes = /pdf|docx|doc/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only .pdf, .doc, or .docx files are allowed.'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Multer configuration for profile picture uploads
const profilePicUpload = multer({
  storage: multerS3({
    s3: s3ProfilePic,
    bucket: process.env.AWS_S3_BUCKET_PROFILE_PIC,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `profile-pics/${uniqueSuffix}${path.extname(file.originalname)}`);
    },
  }),
  fileFilter: function (req, file, cb) {
    console.log("File received:", file);
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    console.log("File Extension Valid:", extname);
    console.log("MIME Type Valid:", mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      console.error("File rejected:", file.originalname);
      cb(new Error('Only image files (JPEG, JPG, PNG, GIF) are allowed.'));
    }
  },
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
});


module.exports = { resumeUpload, profilePicUpload };