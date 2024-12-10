const express = require('express');
const { registerGoogleUser } = require('../../controllers/GoogleController'); // Adjust path if needed

const router = express.Router();

// POST route for Google User registration or profile update
router.post('/register', registerGoogleUser);

module.exports = router;
