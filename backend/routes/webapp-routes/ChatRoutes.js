const express = require('express');
const router = express.Router();
const { getChatMessages, sendMessage } = require('../../controllers/ChatController');

router.get('/:internshipId', getChatMessages);


// Route to send a message
router.post('/', sendMessage);

module.exports = router;
