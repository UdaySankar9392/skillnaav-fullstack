import React, { useState, useEffect } from "react";
import axios from "axios";

// Component for Internship Card
const InternshipCard = ({ internshipId, jobTitle, onClick }) => (
  <div
    className="p-4 mb-4 bg-white shadow-lg rounded-lg cursor-pointer hover:bg-gray-100 transition duration-200"
    onClick={() => onClick(internshipId, jobTitle)}  // Pass both ID and Title
  >
    <h3 className="text-lg font-bold text-gray-700">{jobTitle}</h3>
    <p className="text-sm text-gray-500">Internship ID: {internshipId}</p>
  </div>
);

// Main Chat Interface
const ChatInterface = () => {
  const [internships, setInternships] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [partnerId, setPartnerId] = useState(null);
  const [adminId, setAdminId] = useState(null);
  const [selectedInternshipId, setSelectedInternshipId] = useState(null);
  const [selectedInternshipTitle, setSelectedInternshipTitle] = useState("");  // Track Title
  const [showChat, setShowChat] = useState(false);

  // Load partnerId and adminId from localStorage
  useEffect(() => {
    const storedPartnerId = localStorage.getItem("partnerId");
    const adminInfo = localStorage.getItem("adminInfo");

    if (storedPartnerId) setPartnerId(storedPartnerId);
    if (adminInfo) setAdminId(JSON.parse(adminInfo)?.id);
  }, []);

  // Fetch internships on component mount
   useEffect(() => {
    const fetchInternships = async () => {
      try {
        if (partnerId) {
          const response = await axios.get(`/api/interns/partner/${partnerId}`);
          console.log("Fetched internships:", response.data);
          setInternships(response.data);
        } else {
          console.error("Partner ID not found");
        }
      } catch (error) {
        console.error("Error fetching internships:", error);
      }
    };
  
    fetchInternships();
  }, [partnerId])

  // Fetch messages for the selected internship
  const fetchMessages = async (internshipId) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/chats/${partnerId}/${internshipId}`);
      if (response.status === 200) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle selecting an internship and fetching its messages
  const handleInternshipClick = (id, jobTitle) => {
    setSelectedInternshipId(id);       // Set the selected internship ID
    setSelectedInternshipTitle(jobTitle); // Set the selected internship title
    fetchMessages(id);                 // Fetch messages for the selected internship
    setShowChat(true);                 // Show the chat UI
  };

  // Handle sending new messages
  const handleSend = async () => {
    if (input.trim() && adminId && partnerId && selectedInternshipId) {
      const newMessage = {
        internshipId: selectedInternshipId,
        senderId: partnerId,
        receiverId: adminId,
        message: input,
      };

      console.log('Message being sent:', newMessage); // Log before sending the message

      try {
        const response = await axios.post(`/api/chats/send`, newMessage, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log('Response from backend:', response.data); // Log response data

        if (response.status === 201) { // Change from 200 to 201
          console.log('Current messages:', messages);

          setMessages((prevMessages) => {
            console.log('Updating messages with:', response.data);
            return [...prevMessages, response.data];
          });

          setInput(""); // Clear input after sending
        } else {
          console.error("Failed to send message due to unexpected response status:", response.status);
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    } else {
      console.error("Input, adminId, partnerId, or internshipId is missing");
    }
  };


  // Show internship cards before opening chat
  if (!showChat) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        {internships.map(({ jobTitle, _id }) => (
          <InternshipCard
            key={_id}
            internshipId={_id}
            jobTitle={jobTitle}
            onClick={handleInternshipClick}  // Pass ID and Title on click
          />
        ))}
      </div>
    );
  }

  // Chat UI
  return (
    <div className="flex flex-col font-poppins h-screen bg-gray-100">
      {/* Chat Header */}
      <div className="p-4 bg-white shadow-md flex items-center justify-between">
        <button
          className="text-blue-500 hover:text-blue-700 font-medium"
          onClick={() => setShowChat(false)} // Toggle showChat to false
        >
          ← Back
        </button>
        <h2 className="text-lg font-semibold">
          Chat - (Title: {selectedInternshipTitle}) (ID: {selectedInternshipId})
        </h2>
      </div>

      {/* Messages Display */}
      <div className="flex-grow overflow-y-auto p-4">
        {loading ? (
          <div className="text-center text-gray-500">Loading messages...</div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex mb-4 ${msg.sender === partnerId ? "justify-end" : "justify-start"
                }`}
            >
              <div
                className={`max-w-sm p-3 rounded-lg shadow-md ${msg.sender === partnerId ? "bg-blue-100 text-right" : "bg-gray-200 text-left"
                  }`}
              >
                <div className="text-sm text-gray-700">{msg.message}</div>
              </div>
            </div>
          ))
        )}
      </div>


      {/* Message Input */}
      <div className="p-4 bg-white border-t flex items-center">
        <input
          type="text"
          className="flex-grow p-2 border rounded-lg focus:outline-none"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
