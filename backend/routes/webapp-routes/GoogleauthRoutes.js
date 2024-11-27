const express = require('express');
const router = express.Router();
const { googleLogin } = require('../../controllers/GoogleauthController'); // Import the controller function

// Route to handle Google login
router.post('/google-login', googleLogin);

module.exports = router;
