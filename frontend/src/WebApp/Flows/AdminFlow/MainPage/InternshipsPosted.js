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
  const [comment, setComment] = useState(""); // State for comment

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
      await axios.delete(`/api/interns/${internshipToReject._id}`);
      setInternships((prevInternships) =>
        prevInternships.filter((internship) => internship._id !== internshipToReject._id)
      );
      setIsRejectModalOpen(false);
    } catch (error) {
      console.error("Error rejecting internship:", error);
    }
  };

  const handleReview = (internship) => {
    setSelectedInternship(internship);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedInternship(null);
    setComment(""); // Reset comment when closing modal
  };

  const closeRejectModal = () => {
    setIsRejectModalOpen(false);
  };

  const handleCommentSubmit = () => {
    console.log("Comment submitted:", comment);
    // Add your logic for submitting the comment here

    // Reset comment after submission
    setComment("");
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
              <td className="px-4 py-2">{internship.stipendOrSalary}</td>
              <td className="px-4 py-2 flex space-x-2">
                <button
                  className={`px-3 py-1 rounded-md text-white ${internship.adminApproved
                    ? "bg-green-500"
                    : "bg-blue-500 hover:bg-blue-700"
                    }`}
                  onClick={() => handleApprove(internship._id)}
                  disabled={internship.adminApproved}
                >
                  {internship.adminApproved ? "Approved" : "Approve"}
                </button>
                <button
                  className="px-3 py-1 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
                  onClick={() => handleReview(internship)}
                >
                  Review
                </button>
                <button
                  className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                  onClick={() => handleRejectClick(internship)}
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination controls */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-gray-700">Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Internship Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Internship Details"
        className="fixed inset-0 flex items-center justify-center"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
          {selectedInternship && (
            <>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                {selectedInternship.jobTitle}
              </h2>
              <div className="mb-2">
                <p className="font-medium text-gray-700">
                  <strong>Company:</strong> {selectedInternship.companyName}
                </p>
                <p className="font-medium text-gray-700">
                  <strong>Location:</strong> {selectedInternship.location}
                </p>
                <p className="font-medium text-gray-700">
                  <strong>Stipend/Salary:</strong> {selectedInternship.stipendOrSalary}
                </p>
              </div>
              <p className="mb-4 text-gray-600">
                <strong>Description:</strong> {selectedInternship.jobDescription}
              </p>

              {/* Comment Section */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Leave a Comment</h3>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-400"
                  rows={4}
                  placeholder="Write your comment here..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <button
                  className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200"
                  onClick={handleCommentSubmit}
                >
                  Send Comment
                </button>
              </div>

              {/* Close Button */}
              <button
                className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-200"
                onClick={closeModal}
              >
                Close
              </button>
            </>
          )}
        </div>
      </Modal>


      {/* Reject Confirmation Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onRequestClose={closeRejectModal}
        contentLabel="Reject Confirmation"
        className="fixed inset-0 flex items-center justify-center"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white p-6 rounded-md shadow-md">
          <h2 className="text-xl font-semibold mb-4">Confirm Rejection</h2>
          <p>Are you sure you want to reject the internship: <strong>{internshipToReject?.jobTitle}</strong>?</p>
          <div className="flex justify-end mt-4">
            <button className="mr-2 px-4 py-2 bg-gray-200 rounded-md" onClick={closeRejectModal}>
              Cancel
            </button>
            <button className="px-4 py-2 bg-red-500 text-white rounded-md" onClick={confirmReject}>
              Reject
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PartnerManagement;
