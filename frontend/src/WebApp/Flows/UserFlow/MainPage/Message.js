import React, { useState } from 'react';
import { FaPaperclip, FaPaperPlane, FaFileAlt } from 'react-icons/fa';

const ChatInterface = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setIsModalOpen(false); // Close the modal after file selection
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div className="flex h-screen font-poppins">
      {/* Sidebar */}
      <div className="w-1/4 border-r border-gray-200 p-4 bg-white">
        <div className="mb-4">
          <div className="flex items-center mb-4 cursor-pointer">
            <img
              src="https://via.placeholder.com/40"
              alt="User Avatar"
              className="rounded-full mr-3"
            />
            <div>
              <p className="font-medium">Mary Jane</p>
              <p className="text-gray-500 text-sm truncate">
                Hey Olivia, can you please review the latest design w...
              </p>
            </div>
          </div>
          <hr className="border-t border-gray-300" />
        </div>

        <div>
          <div className="flex items-center cursor-pointer">
            <img
              src="https://via.placeholder.com/40"
              alt="User Avatar"
              className="rounded-full mr-3"
            />
            <div>
              <p className="font-medium">Mary Jane</p>
              <p className="text-gray-500 text-sm truncate">
                Hey Olivia, can you please review the latest design w...
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Content */}
      <div className="w-3/4 flex flex-col justify-between p-6 bg-gray-50">
        {/* Messages */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-start">
            <img
              src="https://via.placeholder.com/40"
              alt="User Avatar"
              className="rounded-full mr-3"
            />
            <div>
              <div className="bg-gray-100 p-4 rounded-lg">
                Hey Olivia, can you please review the latest design when you can?
              </div>
              <p className="text-gray-500 text-xs mt-1">Friday 2:20pm</p>
              <div className="bg-white p-3 mt-2 rounded-lg border border-gray-200 flex items-center">
                <span className="text-purple-500 mr-2">
                  <i className="fas fa-file-alt"></i>
                </span>
                <div>
                  <p className="font-medium">Latest design screenshot.jpg</p>
                  <p className="text-gray-500 text-sm">1.2 MB</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <div>
              <div className="bg-purple-600 text-white p-4 rounded-lg">
                Sure thing, I’ll have a look today.
              </div>
              <p className="text-gray-500 text-xs mt-1 text-right">Friday 2:20pm</p>
            </div>
          </div>
        </div>

        {/* Today Marker */}
        <div className="text-center text-gray-500 text-xs my-4">Today</div>

        {/* File Upload Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg">
              <div className="flex flex-col items-center bg-gray-100 rounded-lg p-6">
                <div className="text-purple-600">
                  <FaFileAlt size={40} />
                </div>
                <label className="text-purple-600 cursor-pointer mt-2">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".png, .jpg, .jpeg, .pdf"
                  />
                  <span className="text-sm font-semibold">Click to upload</span> or drag and drop
                </label>
                <p className="text-gray-500 text-sm mt-1">PNG, JPG, or PDF (Max. 50mb)</p>
              </div>
              <button onClick={toggleModal} className="mt-4 text-gray-600 hover:text-gray-800">
                Close
              </button>
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center bg-gray-100 rounded-full p-2">
            {/* Input Field */}
            <input
              type="text"
              className="flex-grow bg-gray-100 p-2 border border-gray-300 rounded-full focus:outline-none"
              placeholder="Message"
            />

            {/* File Attachment Button */}
            <button className="ml-2 text-gray-600 hover:text-gray-800" onClick={toggleModal}>
              <FaPaperclip />
            </button>

            {/* Send Button */}
            <button className="ml-2 text-purple-600 hover:text-purple-800">
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
