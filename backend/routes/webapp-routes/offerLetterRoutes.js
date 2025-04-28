// routes/offerLetterRoutes.js
const express = require('express');
const router = express.Router();
const { sendOfferLetter, getOfferLetterByStudent, updateOfferStatus } = require('../../controllers/offerLetterController');


router.post('/', sendOfferLetter);  // Handles POST /api/offer-letters
router.get('/:studentId', getOfferLetterByStudent); // GET Offer Letter
router.patch('/:id/status', updateOfferStatus);     // PATCH Accept/Reject


module.exports = router;