const Chat = require('../models/webapp-models/ChatModel');
const Userwebapp = require('../models/webapp-models/userModel'); // Import User model

// Fetch chat messages based on partnerId
const getChatMessages = async (req, res) => {
  const { partnerId } = req.params; // Extract partnerId from the request params

  // Log the incoming request
  console.log('Received request to fetch messages for partnerId:', partnerId);

  try {
    // Check if partnerId is provided
    if (!partnerId) {
      console.error('No partnerId provided in request parameters.');
      return res.status(400).json({ error: 'Partner ID is required.' });
    }

    // Find messages associated with the partnerId
    const messages = await Chat.find({ receiver: partnerId }).sort({ timestamp: 1 });

    // Log the number of messages found
    console.log(`Number of messages found for partnerId ${partnerId}:`, messages.length);

    if (!messages.length) {
      return res.status(404).json({ error: 'No messages found for this partner.' });
    }

    // Log the messages being sent back
    console.log('Sending back the following messages:', messages);
    
    // Map the response to only include relevant fields (if necessary)
    const responseMessages = messages.map(msg => ({
      sender: msg.sender,
      receiver: msg.receiver,
      message: msg.message,
      internship: msg.internship, 
       
    }));

    res.status(200).json(responseMessages); // Send the filtered messages back in response
  } catch (err) {
    console.error('Error fetching chat messages:', err);
    res.status(500).json({ error: 'Failed to fetch chat messages', details: err.message });
  }
};

// Send a message
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
  const { adminId } = req.params; // Extract partnerId from the request params

  // Log the incoming request
  console.log('Received request to fetch messages for adminId:', adminId);

  try {
    // Check if partnerId is provided
    if (!adminId) {
      console.error('No adminId provided in request parameters.');
      return res.status(400).json({ error: 'admin ID is required.' });
    }

    // Find messages associated with the partnerId
    const messages = await Chat.find({ receiver: adminId }).sort({ timestamp: 1 });

    // Log the number of messages found
    console.log(`Number of messages found for adminId ${adminId}:`, messages.length);

    if (!messages.length) {
      return res.status(404).json({ error: 'No messages found for this partner.' });
    }

    // Log the messages being sent back
    console.log('Sending back the following messages:', messages);
    
    // Map the response to only include relevant fields (if necessary)
    const responseMessages = messages.map(msg => ({
      sender: msg.sender,
      receiver: msg.receiver,
      message: msg.message,
       
    }));

    res.status(200).json(responseMessages); // Send the filtered messages back in response
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