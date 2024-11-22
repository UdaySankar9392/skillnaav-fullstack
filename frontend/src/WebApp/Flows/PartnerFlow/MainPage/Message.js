import React, { useState, useEffect } from "react";

const ChatInterface = ({ internshipIdProp }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [partnerId, setPartnerId] = useState(null);
  const [adminId, setAdminId] = useState(null); // Track adminId
  const [internshipId, setInternshipIdState] = useState(null);

  useEffect(() => {
    // If internshipIdProp is provided, store it in localStorage
    if (internshipIdProp) {
      localStorage.setItem("internshipId", internshipIdProp); // Store internshipId in localStorage
      setInternshipIdState(internshipIdProp); // Set state
    } else {
      // Otherwise, try to get it from localStorage
      const storedInternshipId = localStorage.getItem("internshipId");
      if (storedInternshipId) {
        setInternshipIdState(storedInternshipId);
      }
    }
  }, [internshipIdProp]);

  // Corrected part of the fetchMessages function
const fetchMessages = async () => {
  try {
    if (!partnerId) {
      console.error("No partnerId found");
      return;
    }

    console.log("Fetching messages for partnerId:", partnerId);

    const response = await fetch(`/api/chats/${partnerId}`);
    if (response.ok) {
      const data = await response.json();
      console.log("Fetched messages:", data); // Log the response data to check its structure

      // Set messages state
      setMessages(data);

      // Check if internshipId is in the response and set it correctly
      if (data.length > 0 && data[0].internship) { // Correct key for internshipId
        setInternshipIdState(data[0].internship); // Correctly set the internshipId state
      } else {
        console.error("No internshipId found in messages");
      }
    } else {
      console.error("Failed to fetch messages");
    }
  } catch (error) {
    console.error("Error fetching messages:", error);
  } finally {
    setLoading(false);
  }
};

  // Fetch partnerId from localStorage
  const getPartnerId = () => {
    const storedPartnerId = localStorage.getItem("partnerId");
    if (storedPartnerId) {
      setPartnerId(storedPartnerId);
    } else {
      console.error("partnerId not found in localStorage");
    }
  };

  // Fetch adminId from localStorage
  const getAdminId = () => {
    const adminInfo = localStorage.getItem("adminInfo");
    if (adminInfo) {
      const parsedAdminInfo = JSON.parse(adminInfo);
      setAdminId(parsedAdminInfo.id);
    } else {
      console.error("Admin ID not found in localStorage");
    }
  };

  // Fetch partnerId and adminId when component mounts
  useEffect(() => {
    getPartnerId();
    getAdminId(); // Fetch admin ID as well
  }, []);

  // Fetch messages when partnerId is available
  useEffect(() => {
    if (partnerId) {
      fetchMessages();
    }
  }, [partnerId]);

  const handleSend = async () => {

    if (input.trim() && adminId && partnerId) {
      const newMessage = {
        internshipId,
        senderId: partnerId,  // Assuming partner sends the message
        receiverId: adminId,   // Admin receives the message
        message: input,
      };

      try {
        const response = await fetch(`http://localhost:5000/api/chats/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newMessage),
        });
        
        if (response.ok) {
          const messageData = await response.json();
          setMessages([...messages, messageData]); // Add new message to existing ones
          setInput(""); // Clear input after sending
        } else {
          console.error("Failed to send message");
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    } else {
      console.error("Input, adminId, or partnerId is missing");
    }
  };

  return (
    <div className="flex flex-col font-poppins h-screen p-4 bg-gray-100">
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div>Loading messages...</div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col p-4 rounded-lg shadow-md ${
                msg.sender === partnerId ? "bg-blue-100 self-end" : "bg-white"
              }`}
            >
              <div className="flex justify-between items-center mb-2 text-sm text-gray-500">
                <span className="font-semibold">{msg.sender === partnerId ? "Partner" : "Admin"}</span>
                <span className="text-xs text-gray-400">Internship ID: {msg.internship }</span>
              </div>
              <div className="text-gray-800">{msg.message}</div>
            </div>
          ))
        )}
      </div>
      <div className="flex items-center mt-4 p-2 bg-white border-t border-gray-300">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow p-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSend}
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
