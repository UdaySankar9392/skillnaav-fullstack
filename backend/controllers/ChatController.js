const Chat = require('../models/webapp-models/ChatModel');
const Userwebapp = require('../models/webapp-models/userModel'); // Import User model

const getChatMessages = async (req, res) => {
  const { internshipId } = req.params; // Extract internshipId from the request params

  try {
    // Trim any whitespace/newline characters from internshipId
    const trimmedInternshipId = internshipId.trim();

    const messages = await Chat.find({ internship: trimmedInternshipId }).sort({ timestamp: 1 });
    if (!messages.length) {
      return res.status(404).json({ error: 'No messages found for this internship.' });
    }
    res.status(200).json(messages); // Send the messages back in response
  } catch (err) {
    console.error('Error fetching chat messages:', err);
    res.status(500).json({ error: 'Failed to fetch chat messages', details: err.message });
  }
};

const sendMessage = async (req, res) => {
  const { internshipId, senderId, receiverId, message } = req.body;

  try {
    // Validate that all fields are provided
    if (!internshipId || !senderId || !receiverId || !message) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Create a new chat message
    const newMessage = new Chat({
      internship: internshipId,
      sender: senderId,
      receiver: receiverId,
      message,
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'Failed to send message', details: err.message });
  }
};
module.exports = {
  getChatMessages,
  sendMessage,
};