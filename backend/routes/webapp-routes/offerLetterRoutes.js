// routes/offerLetterRoutes.js
const express = require('express');
const router = express.Router();
const { sendOfferLetter } = require('../../controllers/offerLetterController');


router.post('/', sendOfferLetter);  // Handles POST /api/offer-letters

module.exports = router;