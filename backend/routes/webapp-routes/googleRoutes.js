const express = require('express');
const { googleAuth, googleCallback } = require('../../controllers/GoogleController');
const router = express.Router();

router.get('/auth', googleAuth);
router.get('/callback', googleCallback);

module.exports = router;
