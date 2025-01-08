const { body, param, validationResult } = require('express-validator');

// Example validation middleware
const validateApplication = [
  body('studentId').isMongoId().withMessage('Invalid student ID'),
  body('internshipId').isMongoId().withMessage('Invalid internship ID'),
  // Add more validations as needed
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
