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
  const [comment, setComment] = useState("");

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
      });
      setInternships((prevInternships) =>
        prevInternships.map((internship) =>
          internship._id === internshipToReject._id
            ? { ...internship, adminApproved: false }
            : internship
        )
      );
      setIsRejectModalOpen(false);
    } catch (error) {
      console.error("Error rejecting internship:", error);
    }
  };

  const handleDeleteClick = async (internship) => {
    if (window.confirm(`Are you sure you want to delete the internship: ${internship.jobTitle}?`)) {
      try {
        await axios.delete(`/api/interns/${internship._id}`);
        setInternships((prevInternships) =>
          prevInternships.filter((i) => i._id !== internship._id)
        );
      } catch (error) {
        console.error("Error deleting internship:", error);
      }
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

  const handleCommentSubmit = async () => {
    try {
      await axios.post(`/api/interns/${selectedInternship._id}/review`, { reviewText: comment });
      setInternships((prevInternships) =>
        prevInternships.map((internship) =>
          internship._id === selectedInternship._id
            ? { ...internship, isAdminReviewed: true, adminReviewText: comment }
            : internship
        )
      );
      closeModal();
    } catch (error) {
      console.error("Error submitting review:", error);
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
                  className="px-3 py-1 bg-indigo-500 text-white rounded-md hover:bg-indigo-700"
                  onClick={() => handleReview(internship)}
                >
                  Review
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

      {/* Pagination */}
      <div className="flex justify-between mt-4">
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

 {/* Review Modal */}
<Modal
  isOpen={isModalOpen}
  onRequestClose={closeModal}
  overlayClassName="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
  className="bg-white p-6 rounded-lg shadow-lg w-96"
>
  <h2 className="text-lg font-semibold mb-4">Review Internship</h2>
  {selectedInternship && (
   <div className="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto">
   <h3 className="font-medium text-lg text-gray-800 mb-2">{selectedInternship.jobTitle}</h3>
   <p className="text-sm text-gray-500 mb-1">Start Date: <span className="text-gray-700 font-semibold">{selectedInternship.startDate}</span></p>
   <p className="text-sm text-gray-500 mb-1">End Date: <span className="text-gray-700 font-semibold">{selectedInternship.endDateOrDuration}</span></p>
   <p className="text-gray-600 text-sm leading-relaxed mb-4">Description: {selectedInternship.jobDescription}</p>
 
   <textarea
     placeholder="Leave a comment..."
     value={comment}
     onChange={(e) => setComment(e.target.value)}
     className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4"
     rows="4"
   />
   
   <button
     onClick={handleCommentSubmit}
     className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 ease-in-out focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none shadow-lg"
   >
     Submit Comment
   </button>
 </div>
 
  )}
  <button onClick={closeModal} className="mt-4 text-red-500">
    Close
  </button>
</Modal>

{/* Reject Modal */}
<Modal
  isOpen={isRejectModalOpen}
  onRequestClose={closeRejectModal}
  overlayClassName="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
  className="bg-white p-6 rounded-lg shadow-lg w-96"
>
  <h2 className="text-lg font-semibold mb-4">Reject Internship</h2>
  {internshipToReject && (
    <div>
      <p>
        Are you sure you want to reject the internship: <strong>{internshipToReject.jobTitle}</strong>?
      </p>
    
      <div className="mt-4 flex space-x-2">
        <button
          onClick={confirmReject}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
        >
          Confirm Reject
        </button>
        <button
          onClick={closeRejectModal}
          className="text-gray-500 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100"
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
