const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Configure S3 client with timeout and retry settings
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  requestHandler: {
    requestTimeout: 30000, // 30 seconds timeout
    socketTimeout: 30000   // 30 seconds socket timeout
  },
  maxAttempts: 3, // Retry up to 3 times
});

// Common upload configuration
const createUploader = (bucket, folder, allowedTypes, sizeLimit) => {
  return multer({
    storage: multerS3({
      s3,
      bucket,
      metadata: (req, file, cb) => cb(null, { fieldName: file.fieldname }),
      key: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${folder}/${uniqueSuffix}${ext}`);
      },
      contentType: multerS3.AUTO_CONTENT_TYPE,
    }),
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const mimetype = file.mimetype;
      
      if (allowedTypes.test(ext) && allowedTypes.test(mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Invalid file type. Only ${allowedTypes} are allowed.`));
      }
    },
    limits: { fileSize: sizeLimit },
  });
};

// Configure uploaders
const resumeUpload = createUploader(
  process.env.AWS_RESUME_BUCKET,
  'resumes',
  /pdf|docx?/,
  5 * 1024 * 1024 // 5MB
);

const profilePicUpload = createUploader(
  process.env.AWS_PROFILE_PIC_BUCKET || process.env.AWS_RESUME_BUCKET,
  'profile-pics',
  /jpe?g|png|gif/,
  2 * 1024 * 1024 // 2MB
);

// Enhanced file upload with retry logic
const uploadFile = async (params, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const command = new PutObjectCommand(params);
      await s3.send(command);
      return `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

// Upload offer letter implementations
const uploadOfferLetter = async (localFilePath, fileName) => {
  const fileContent = fs.readFileSync(localFilePath);
  return uploadFile({
    Bucket: process.env.AWS_RESUME_BUCKET,
    Key: `offer-letters/${fileName}`,
    Body: fileContent,
    ContentType: 'application/pdf',
  });
};

const uploadOfferLetterBuffer = async (buffer, fileName) => {
  return uploadFile({
    Bucket: process.env.AWS_RESUME_BUCKET,
    Key: `offer-letters/${fileName}`,
    Body: buffer,
    ContentType: 'application/pdf',
  });
};

module.exports = {
  resumeUpload,
  profilePicUpload,
  uploadOfferLetter,
  uploadOfferLetterBuffer,
};