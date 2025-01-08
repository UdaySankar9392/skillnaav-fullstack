const express = require('express');
const { registerGoogleUser, signInGoogleUser } = require('../../controllers/GoogleController'); // Adjust path if needed
const { verifyToken } = require('../../middlewares/googleauthMiddleware');
const router = express.Router();

// POST route for Google User registration or profile update
router.post('/register', registerGoogleUser);

// POST route for Google User sign-ina
router.post('/signin', verifyToken, signInGoogleUser);

module.exports = router;
