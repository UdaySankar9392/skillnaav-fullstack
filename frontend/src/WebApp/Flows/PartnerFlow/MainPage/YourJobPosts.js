import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";

Modal.setAppElement("#root");

const YourJobPosts = () => {
  const [internships, setInternships] = useState([]);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [internshipToReject, setInternshipToReject] = useState(null);

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
        console.log("Fetched internships:", response.data);
        setInternships(response.data);
      } catch (error) {
        console.error("Error fetching internships:", error);
      }
    };
    fetchInternships();
  }, []);

  const handleApprove = async (internId) => {
    try {
      console.log("Approving internship ID:", internId);
      const response = await axios.patch(`/api/interns/${internId}/approve`, {
        status: "approved",
      });

      console.log("Intern approved:", response.data);
      setInternships((prevInternships) =>
        prevInternships.map((internship) =>
          internship._id === internId
            ? { ...internship, isApproved: true }
            : internship
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
      console.log("Rejecting internship ID:", internshipToReject._id);
      await axios.delete(`/api/interns/${internshipToReject._id}`);

      // Remove internship from state
      setInternships((prevInternships) =>
        prevInternships.filter(
          (internship) => internship._id !== internshipToReject._id
        )
      );

      console.log("Internship rejected and deleted successfully");
      setIsRejectModalOpen(false);
    } catch (error) {
      console.error("Error rejecting internship:", error);
    }
  };

  const handleReadMore = (internship) => {
    setSelectedInternship(internship);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const closeRejectModal = () => {
    setIsRejectModalOpen(false);
  };

  // Sorting logic
  const sortInternships = (internships) => {
    return internships.sort((a, b) => {
      const aValue = a[sortCriteria].toLowerCase();
      const bValue = b[sortCriteria].toLowerCase();

      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
  };

  // Filtering logic
  const filteredInternships = internships.filter((internship) => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    return (
      (internship.jobTitle &&
        internship.jobTitle.toLowerCase().includes(lowerCaseQuery)) ||
      (internship.companyName &&
        internship.companyName.toLowerCase().includes(lowerCaseQuery)) ||
      (internship.organization &&
        internship.organization.toLowerCase().includes(lowerCaseQuery))
    );
  });

  // Pagination logic
  const indexOfLastInternship = currentPage * applicationsPerPage;
  const indexOfFirstInternship = indexOfLastInternship - applicationsPerPage;
  const sortedInternships = sortInternships([...filteredInternships]);
  const currentInternships = sortedInternships.slice(
    indexOfFirstInternship,
    indexOfLastInternship
  );
  const totalPages = Math.ceil(
    filteredInternships.length / applicationsPerPage
  );

  return (
    <div className="p-6 rounded-lg font-poppins shadow-md">
      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by Organization, Role, or Company"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border rounded w-full focus:outline-none focus:ring focus:ring-indigo-300"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentInternships.map((internship) => (
          <div
            key={internship._id}
            className="bg-white p-4 rounded-lg shadow-md"
          >
            <h3 className="text-xl font-semibold mb-2">
              {internship.jobTitle}
            </h3>
            <p className="mb-1">
              <strong>Company:</strong> {internship.companyName}
            </p>
            <p className="mb-1">
              <strong>Location:</strong> {internship.location}
            </p>
            <p className="mb-1">
              <strong>Stipend/Salary:</strong> {internship.stipendOrSalary}
            </p>
            <div className="mt-4">
              <strong>Status:</strong>{" "}
              <span
                className={`inline-block px-2 py-1 rounded-full font-bold ${
                  internship.isApproved
                    ? "bg-green-200 text-green-800"
                    : "bg-red-200 text-red-800"
                }`}
              >
                {internship.isApproved ? "Accepted" : "Not Approved"}
              </span>
            </div>
            <div className="flex space-x-2 mt-4">
              <button
                className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
                onClick={() => handleReadMore(internship)}
              >
                Read More
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* Pagination controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="self-center text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
        >
          Next
        </button>
      </div>
      {/* Internship Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Internship Details"
        className="fixed font-poppins inset-0 flex items-center justify-center"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
          {selectedInternship && (
            <>
              <h2 className="text-2xl font-semibold mb-4">
                {selectedInternship.jobTitle}
              </h2>
              <p className="mb-2">
                <strong>Company:</strong> {selectedInternship.companyName}
              </p>
              <p className="mb-2">
                <strong>Location:</strong> {selectedInternship.location}
              </p>
              <p className="mb-2">
                <strong>Stipend/Salary:</strong>{" "}
                {selectedInternship.stipendOrSalary}
              </p>
              <p className="mb-4">{selectedInternship.description}</p>
            </>
          )}
          <button
            onClick={closeModal}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Close
          </button>
        </div>
      </Modal>
      {/* Reject Confirmation Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onRequestClose={closeRejectModal}
        contentLabel="Reject Internship"
        className="fixed font-poppins inset-0 flex items-center justify-center"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Confirm Reject</h2>
          <p>
            Are you sure you want to reject the internship for{" "}
            {internshipToReject?.jobTitle}?
          </p>
          <div className="flex justify-end mt-4">
            <button
              onClick={confirmReject}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Confirm
            </button>
            <button
              onClick={closeRejectModal}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 ml-2"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default YourJobPosts;
