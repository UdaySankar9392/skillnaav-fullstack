import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";


Modal.setAppElement("#root");

const PartnerManagement = () => {
  const [internships, setInternships] = useState([]);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [internshipToReject, setInternshipToReject] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [internshipToDelete, setInternshipToDelete] = useState(null);
  const [comment, setComment] = useState("");
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [deletedInternships, setDeletedInternships] = useState([]);
  const [chatMessages, setChatMessages] = useState([]); // Chat messages for the review
  const [newMessage, setNewMessage] = useState(""); // New message input

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const applicationsPerPage = 10;

  // Sorting state
  const [sortCriteria, setSortCriteria] = useState("jobTitle");
  const [sortDirection, setSortDirection] = useState("asc");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchInternships = async () => {
      try {
        const response = await axios.get("/api/interns");
        setInternships(response.data);
      } catch (error) {
        console.error("Error fetching internships:", error);
      }
    };
    fetchInternships();
  }, []);

  const handleApprove = async (internId) => {
    try {
      await axios.patch(`/api/interns/${internId}/approve`, {
        status: "approved",
      });
      setInternships((prevInternships) =>
        prevInternships.map((internship) =>
          internship._id === internId ? { ...internship, adminApproved: true } : internship
        )
      );
    } catch (error) {
      console.error("Error approving internship:", error);
    }
  };

  const handleRejectClick = (internship) => {
    setInternshipToReject(internship);
    setIsRejectModalOpen(true);
  };

  const confirmReject = async () => {
    if (!internshipToReject) return;
    try {
      await axios.patch(`/api/interns/${internshipToReject._id}/reject`, {
        status: "rejected",
        reason: comment, // Include the reason here
      });
      setInternships((prevInternships) => prevInternships.map((internship) => internship._id === internshipToReject._id ? { ...internship, adminApproved: false } : internship));
      setIsRejectModalOpen(false);
    } catch (error) {
      console.error("Error rejecting internship:", error);
    }
  };

  const handleReview = (internship) => {
    setSelectedInternship(internship); // Set the selected internship
    setIsModalOpen(true); // Open chat modal
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedInternship(null);
    setComment(""); // Reset comment when closing modal
  };

  const closeRejectModal = () => {
    setIsRejectModalOpen(false);
  };

  // const handleCommentSubmit = async () => {
  //   try {
  //     await axios.post(`/api/interns/${selectedInternship._id}/review`, { reviewText: comment });
  //     setInternships((prevInternships) =>
  //       prevInternships.map((internship) =>
  //         internship._id === selectedInternship._id
  //           ? { ...internship, isAdminReviewed: true, adminReviewText: comment }
  //           : internship
  //       )
  //     );
  //     closeModal(); // Close modal after successful submission
  //   } catch (error) {
  //     console.error("Error submitting review:", error);
  //   }
  // };
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return; // Prevent sending empty messages
  
    try {
      // Retrieve the admin ID from localStorage
      const adminInfo = JSON.parse(localStorage.getItem("adminInfo"));
      if (!adminInfo || !adminInfo.id) {
        console.error("Admin ID not found");
        return;
      }
      const adminId = adminInfo.id; // Use the dynamically fetched admin ID
  
      // Send message to backend
      const response = await axios.post(`/api/chats`, {
        internshipId: selectedInternship._id, // Include selected internship ID
        senderId: adminId,
        receiverId: selectedInternship.submitterId, // Assuming you have submitterId in internship data
        message: newMessage,
      });
  
      // Update chat history with new message
      setChatMessages((prev) => [
        ...prev,
        { sender: adminId, text: newMessage, timestamp: new Date() },
      ]);
      
      setNewMessage(""); // Clear input field
    } catch (error) {
      console.error("Error sending message:", error.response.data); // Log detailed error response
    }
  };
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setInternshipToDelete(null); // Reset selected internship to delete
  };

  const handleDeleteClick = (internship) => {
    setInternshipToDelete(internship); // Set the internship to delete
    setIsDeleteModalOpen(true); // Open delete confirmation modal
  };

  const confirmDelete = async () => {
    if (!internshipToDelete) return;

    try {
      // Optimistic UI update: Immediately move the internship to the deleted list
      setDeletedInternships((prev) => [...prev, internshipToDelete]);

      // Call API to mark the internship as deleted (soft delete)
      const response = await axios.delete(`/api/interns/${internshipToDelete._id}`);

      console.log("Marked as deleted:", response.data);

      // Update the internships list by removing the deleted internship
      setInternships((prevInternships) =>
        prevInternships.filter((i) => i._id !== internshipToDelete._id)
      );

      closeDeleteModal(); // Close the modal after deletion
    } catch (error) {
      // If an error occurs, revert the optimistic UI changes and show an error message
      setDeletedInternships((prev) => prev.filter((i) => i._id !== internshipToDelete._id)); // Revert
      setInternships((prevInternships) => [
        ...prevInternships,
        internshipToDelete, // Revert the deletion
      ]);
      console.error("Error deleting internship:", error);
      alert("Error deleting internship. Please try again later.");
    }
  };


  const sortInternships = (internships) => {
    return internships.sort((a, b) => {
      const aValue = a[sortCriteria].toLowerCase();
      const bValue = b[sortCriteria].toLowerCase();

      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
  };

  const filteredInternships = internships.filter((internship) => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    return (
      internship.jobTitle.toLowerCase().includes(lowerCaseQuery) ||
      internship.companyName.toLowerCase().includes(lowerCaseQuery) ||
      (internship.organization &&
        internship.organization.toLowerCase().includes(lowerCaseQuery))
    );
  });

  const indexOfLastInternship = currentPage * applicationsPerPage;
  const indexOfFirstInternship = indexOfLastInternship - applicationsPerPage;
  const sortedInternships = sortInternships([...filteredInternships]);
  const currentInternships = sortedInternships.slice(
    indexOfFirstInternship,
    indexOfLastInternship
  );
  const totalPages = Math.ceil(filteredInternships.length / applicationsPerPage);

  return (
    <div className="p-6 rounded-lg shadow-md bg-gray-100 font-poppins text-sm">
      <h2 className="text-2xl font-semibold mb-8 text-center text-gray-800">
        Admin Dashboard - Internship Management
      </h2>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by Organization, Role, or Company"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border rounded-md w-full focus:outline-none focus:ring focus:ring-indigo-400"
        />
      </div>

      {/* Sorting Controls */}
      <div className="flex mb-4 space-x-4">
        <select
          value={sortCriteria}
          onChange={(e) => setSortCriteria(e.target.value)}
          className="p-2 border rounded-md focus:outline-none focus:ring focus:ring-indigo-400"
        >
          <option value="jobTitle">Sort by Job Title</option>
          <option value="companyName">Sort by Company</option>
        </select>
        <select
          value={sortDirection}
          onChange={(e) => setSortDirection(e.target.value)}
          className="p-2 border rounded-md focus:outline-none focus:ring focus:ring-indigo-400"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      <div className="mb-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
        <table className="min-w-full bg-white rounded-lg shadow-lg">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-gray-600">S.No</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-600">Job Title</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-600">Company</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-600">Location</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-600">Stipend/Salary</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentInternships.map((internship, index) => (
              <tr key={internship._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-2">{index + 1 + (currentPage - 1) * applicationsPerPage}</td>
                <td className="px-4 py-2">{internship.jobTitle}</td>
                <td className="px-4 py-2">{internship.companyName}</td>
                <td className="px-4 py-2">{internship.location}</td>
                <td className="px-4 py-2">{internship.salaryDetails}</td>
                <td className="px-4 py-2 flex space-x-2">
                  <button
                    className={`px-3 py-1 rounded-md text-white ${internship.adminApproved ? "bg-green-500" : "bg-blue-500 hover:bg-blue-700"}`}
                    onClick={() => handleApprove(internship._id)}
                    disabled={internship.adminApproved}
                  >
                    {internship.adminApproved ? "Approved" : "Approve"}
                  </button>
                  <button
                    className={`px-3 py-1 rounded-md text-white ${internship.isAdminReviewed ? "bg-green-500 cursor-not-allowed" : "bg-indigo-500 hover:bg-indigo-700"
                      }`}
                    onClick={() => !internship.isAdminReviewed && handleReview(internship)}
                    disabled={internship.isAdminReviewed}
                  >
                    {internship.isAdminReviewed ? "Reviewed" : "Review"}
                  </button>

                  <button
                    className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-700"
                    onClick={() => handleRejectClick(internship)}
                  >
                    Reject
                  </button>
                  <button
                    className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-700"
                    onClick={() => handleDeleteClick(internship)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="overflow-x-auto">
      <div className="flex justify-between mt-4 whitespace-nowrap">
        <button
          className="bg-gray-300 text-gray-700 rounded-md px-4 py-2 disabled:opacity-50"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="bg-gray-300 text-gray-700 rounded-md px-4 py-2 disabled:opacity-50"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={closeDeleteModal}
        overlayClassName="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[999]" // Ensure overlay has a lower z-index
        className="bg-white p-6 rounded-lg shadow-lg w-96 z-[1000]" // Ensure modal has a higher z-index
      >
        <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
        {internshipToDelete && (
          <div>
            <p>
              Are you sure you want to delete the internship for
              <strong> {internshipToDelete.jobTitle} </strong> at
              <strong> {internshipToDelete.companyName} </strong>?
            </p>
            <div className="flex space-x-2 mt-4">
              <button
                onClick={confirmDelete}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Delete
              </button>
              <button
                onClick={closeDeleteModal}
                className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>
  {/* Review Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        overlayClassName="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
        className="bg-white p-6 rounded-lg shadow-lg w-96"
      >
        <h2 className="text-lg font-semibold mb-4">Chat with Submitter</h2>
        {selectedInternship && (
          <div>
            <div className="h-64 border border-gray-300 rounded-md overflow-y-auto mb-4 p-3">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-2 ${
                    msg.sender === "admin"
                      ? "text-right text-blue-600"
                      : "text-left text-gray-800"
                  }`}
                >
                  <p className="bg-gray-200 inline-block px-3 py-1 rounded-md">
                    <strong>{msg.sender === "admin" ? "You" : "Submitter"}:</strong> {msg.text}
                  </p>
                  <span className="text-xs text-gray-500 ml-2">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>

            <textarea
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4"
              rows="3"
            />

            <div className="flex space-x-2">
              <button
                onClick={handleSendMessage}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
              >
                Send Message
              </button>
              <button
                onClick={closeModal}
                className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onRequestClose={closeRejectModal}
        overlayClassName="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[999]" // Ensure overlay has a lower z-index
        className="bg-white p-6 rounded-lg shadow-lg w-96 z-[1000]" // Ensure modal has a higher z-index
      >
        <h2 className="text-lg font-semibold mb-4">Reject Internship</h2>
        {internshipToReject && (
          <div>
            <p className="text-gray-700 mb-4">
              Are you sure you want to reject the internship for <strong>{internshipToReject.jobTitle}</strong> at <strong>{internshipToReject.companyName}</strong>?
            </p>

            <textarea
              placeholder="Optional rejection comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4"
              rows="4"
            />

            <div className="flex space-x-2">
              <button
                onClick={confirmReject}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500"
              >
                Confirm Reject
              </button>
              <button
                onClick={closeRejectModal}
                className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PartnerManagement;
