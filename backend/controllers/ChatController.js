const Chat = require('../models/webapp-models/ChatModel');
const Userwebapp = require('../models/webapp-models/userModel'); // Import User model

// Fetch chat messages based on partnerId
const getChatMessages = async (req, res) => {
  const { internshipId, partnerId } = req.params;

  console.log('Fetching messages for internshipId:', internshipId, 'and partnerId:', partnerId);

  try {
    if (!internshipId || !partnerId) {
      console.error('Missing internshipId or partnerId in request parameters.');
      return res.status(400).json({ error: 'Internship ID and Partner ID are required.' });
    }

    const messages = await Chat.find({
      internship: internshipId,
      $or: [
        { sender: partnerId },
        { receiver: partnerId },
      ],
    }).sort({ createdAt: 1 }); // Sort by creation time

    console.log(`Found ${messages.length} messages for partnerId ${partnerId}.`);

  if (!messages.length) {
  return res.status(200).json([]); // ✅ Return empty array instead of 404
}


    const responseMessages = messages.map((msg) => ({
      sender: msg.sender,
      receiver: msg.receiver,
      message: msg.message,
      internship: msg.internship,
      createdAt: msg.createdAt, // Include timestamp if needed
    }));

    res.status(200).json(responseMessages);
  } catch (err) {
    console.error('Error fetching chat messages:', err);
    res.status(500).json({ error: 'Failed to fetch chat messages', details: err.message });
  }
};


// Send a message
const sendMessage = async (req, res) => {
  const { internshipId, senderId, receiverId, message } = req.body;

  try {
    if (!internshipId || !senderId || !receiverId || !message) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const newMessage = await Chat.create({
      internship: internshipId,
      sender: senderId,
      receiver: receiverId,
      message,
    });

    console.log('New message created:', newMessage);

    res.status(201).json(newMessage);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'Failed to send message', details: err.message });
  }
};



const sendReply = async (req, res) => {
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
      receiver: receiverId, // Use receiverId from request body
      message,
    });

    await newMessage.save();
    res.status(201).json(newMessage); // Respond with the newly created message object
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'Failed to send message', details: err.message });
  }
};  


const getMessages = async (req, res) => {
  const { internshipId } = req.params;

  console.log('Fetching messages for internshipId:', internshipId);

  try {
    if (!internshipId) {
      return res.status(400).json({ error: 'Internship ID is required.' });
    }

    const messages = await Chat.find({ internship: internshipId }).sort({ createdAt: 1 });

    console.log(`Found ${messages.length} messages for internshipId ${internshipId}.`);

 if (!messages.length) {
  return res.status(200).json([]); // ✅ Return empty array instead of 404
}


    const responseMessages = messages.map((msg) => ({
      sender: msg.sender,
      receiver: msg.receiver,
      message: msg.message,
      createdAt: msg.createdAt,
    }));

    res.status(200).json(responseMessages);
  } catch (err) {
    console.error('Error fetching chat messages:', err);
    res.status(500).json({ error: 'Failed to fetch chat messages', details: err.message });
  }
};



module.exports = {
  getChatMessages,
  sendMessage,
  sendReply,
  getMessages,
};