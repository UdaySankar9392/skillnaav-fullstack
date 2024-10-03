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
    <div className="p-6 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-700">
        Admin Dashboard - Posted Internships
      </h2>
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
      {/* Sorting Controls */}
      <div className="flex mb-4">
        <select
          value={sortCriteria}
          onChange={(e) => setSortCriteria(e.target.value)}
          className="mr-4 p-2 border rounded focus:outline-none focus:ring focus:ring-indigo-300"
        >
          <option value="jobTitle">Sort by Job Title</option>
          <option value="companyName">Sort by Company</option>
        </select>
        <select
          value={sortDirection}
          onChange={(e) => setSortDirection(e.target.value)}
          className="p-2 border rounded focus:outline-none focus:ring focus:ring-indigo-300"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
              Job Title
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
              Company
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
              Location
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
              Stipend/Salary
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {currentInternships.map((internship) => (
            <tr
              key={internship._id}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-6 py-4">{internship.jobTitle}</td>
              <td className="px-6 py-4">{internship.companyName}</td>
              <td className="px-6 py-4">{internship.location}</td>
              <td className="px-6 py-4">{internship.stipendOrSalary}</td>
              <td className="px-6 py-4 flex space-x-2">
                <button
                  className={`px-4 py-2 rounded-md text-white ${
                    internship.isApproved
                      ? "bg-green-500"
                      : "bg-blue-500 hover:bg-blue-700"
                  }`}
                  onClick={() => handleApprove(internship._id)}
                  disabled={internship.isApproved}
                >
                  {internship.isApproved ? "Approved" : "Approve"}
                </button>
                <button
                  className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
                  onClick={() => handleReadMore(internship)}
                >
                  Read More
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
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
        className="fixed inset-0 flex items-center justify-center"
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
        contentLabel="Reject Internship Confirmation"
        className="fixed inset-0 flex items-center justify-center"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
          <h2 className="text-xl font-semibold mb-4">Reject Internship</h2>
          <p className="mb-4">
            Are you sure you want to reject the internship "
            {internshipToReject?.jobTitle}" by "
            {internshipToReject?.companyName}"?
          </p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={confirmReject}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Confirm
            </button>
            <button
              onClick={closeRejectModal}
              className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PartnerManagement;
