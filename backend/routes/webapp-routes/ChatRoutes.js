const express = require('express');
const router = express.Router();
const { getChatMessages, sendMessage, getMessages, sendReply } = require('../../controllers/ChatController');

router.get('/:partnerId/:internshipId', getChatMessages);


// Route to send a message
router.post('/', sendMessage);

router.get('/:internshipId', getMessages); // Fetch messages for admin
router.post('/send', sendReply);

module.exports = router;
